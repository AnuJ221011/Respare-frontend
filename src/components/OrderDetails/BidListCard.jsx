import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import Card from "../ui/Card";
import Loader from "../ui/Loader";
import BidItem from "./BidItem";

export default function BidListCard({
  orderId,
  supplierId,
  bids = [],
  canAdminCancel,
  onAddBid,
  onEditBid,
  onDeleteBid,
  onAdminCancelBid,
  isLoading = false,
  error = null,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hiddenBids, setHiddenBids] = useState(new Set());

  // Form state for new bid creation
  const [newBid, setNewBid] = useState({
    supplierId: supplierId || "",
    buyPrice: "",
    sellPrice: "",
    remarks: "",
    adminRemarks: "",
    deliveryEta: "",
    warranty: "",
    stockStatus: "",
    notifyLowerBids: false,
    partImages: [],
  });

  const filteredBids = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return bids.filter((bid) => {
      if (!bid || hiddenBids.has(bid.id)) return false;
      return (
        (bid.supplier?.name || "").toLowerCase().includes(searchLower) ||
        String(bid.buyPrice).includes(searchLower) ||
        String(bid.sellPrice).includes(searchLower) ||
        (bid.remarks || "").toLowerCase().includes(searchLower)
      );
    });
  }, [bids, hiddenBids, searchTerm]);

  const handleHideBid = (bidId) => setHiddenBids((prev) => new Set(prev).add(bidId));
  const handleUnhideBid = (bidId) => setHiddenBids((prev) => {
    const copy = new Set(prev);
    copy.delete(bidId);
    return copy;
  });

  const handleInputChange = (field, value) => {
    setNewBid((prev) => ({ ...prev, [field]: value }));
  };

  const handleImagesChange = (e) => {
    setNewBid((prev) => ({
      ...prev,
      partImages: Array.from(e.target.files),
    }));
  };

  const handleAddBidSubmit = async () => {
    if (!orderId) {
      toast.error("Order ID is missing.");
      return;
    }

    // Validate buyPrice exists and is numeric
    if (newBid.buyPrice === "" || newBid.buyPrice === null || newBid.buyPrice === undefined) {
      toast.error("Buy Price is required.");
      return;
    }
    const buyPriceNum = Number(newBid.buyPrice);
    if (isNaN(buyPriceNum)) {
      toast.error("Buy Price must be a valid number.");
      return;
    }

    if (!newBid.supplierId) {
      toast.error("Supplier ID is required.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You need to be logged in");

      const formData = new FormData();
      formData.append("orderId", orderId);
      formData.append("supplierId", newBid.supplierId);
      formData.append("buyPrice", buyPriceNum.toString());

      if (newBid.sellPrice !== "" && newBid.sellPrice != null) {
        formData.append("sellPrice", newBid.sellPrice.toString());
      }
      if (newBid.remarks) formData.append("remarks", newBid.remarks);
      if (newBid.adminRemarks) formData.append("adminRemarks", newBid.adminRemarks);
      if (newBid.deliveryEta) formData.append("deliveryEta", newBid.deliveryEta);
      if (newBid.warranty) formData.append("warranty", newBid.warranty);
      if (newBid.stockStatus) formData.append("stockStatus", newBid.stockStatus);
      formData.append("notifyLowerBids", newBid.notifyLowerBids ? "true" : "false");

      formData.append("status", "PENDING");

      newBid.partImages.forEach((file) => formData.append("images", file));

      await onAddBid(formData);
      setIsModalOpen(false);
      setNewBid({
        supplierId: "",
        buyPrice: "",
        sellPrice: "",
        remarks: "",
        adminRemarks: "",
        deliveryEta: "",
        warranty: "",
        stockStatus: "",
        notifyLowerBids: false,
        partImages: [],
      });

      toast.success("Bid submitted successfully!");
    } catch (error) {
      console.error("Add Bid error:", error);
      toast.error(error.message || "Error submitting bid.");
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Bid List</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium cursor-pointer"
        >
          + New Bid
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by supplier, price, or remarks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
        />
      </div>
      <div className="space-y-4 max-h-[500px] overflow-y-auto">
        {error && (
          <div className="text-red-600 text-sm border border-red-200 rounded p-3 bg-red-50">
            {error}
          </div>
        )}
        {isLoading ? (
          <Loader message="Loading bids..." />
        ) : filteredBids.length > 0 ? (
          filteredBids.map((bid) => (
            <BidItem
              key={bid.id}
              bid={bid}
              onEdit={onEditBid}
              onDelete={onDeleteBid}
              onAdminCancel={onAdminCancelBid}
              onHide={handleHideBid}
              onUnhide={handleUnhideBid}
              hidden={hiddenBids.has(bid.id)}
              canAdminCancel={canAdminCancel}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-lg mb-2">No bids found</div>
            {searchTerm ? (
              <div className="text-sm">No bids matching "{searchTerm}"</div>
            ) : hiddenBids.size > 0 ? (
              <div className="text-sm">
                All bids are hidden. Add a new bid to get started.
              </div>
            ) : (
              <div className="text-sm">Click "New Bid" to create one</div>
            )}
          </div>
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
              <h3 className="text-lg font-semibold">Add New Bid</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold cursor-pointer"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto flex-grow">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier ID *</label>
                <input
                  type="text"
                  value={newBid.supplierId}
                  onChange={(e) => handleInputChange("supplierId", e.target.value)}
                  placeholder="Enter Supplier ID"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Buy Price *</label>
                <input
                  type="number"
                  value={newBid.buyPrice}
                  onChange={(e) => handleInputChange("buyPrice", e.target.value)}
                  placeholder="Buy price"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sell Price (Admin Only)</label>
                <input
                  type="number"
                  value={newBid.sellPrice}
                  onChange={(e) => handleInputChange("sellPrice", e.target.value)}
                  placeholder="Sell price"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                <textarea
                  value={newBid.remarks}
                  onChange={(e) => handleInputChange("remarks", e.target.value)}
                  placeholder="Any remarks"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Remarks</label>
                <textarea
                  value={newBid.adminRemarks}
                  onChange={(e) => handleInputChange("adminRemarks", e.target.value)}
                  placeholder="Admin remarks"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery ETA</label>
                <input
                  type="text"
                  value={newBid.deliveryEta}
                  onChange={(e) => handleInputChange("deliveryEta", e.target.value)}
                  placeholder="e.g. 2 days"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Warranty</label>
                <input
                  type="text"
                  value={newBid.warranty}
                  onChange={(e) => handleInputChange("warranty", e.target.value)}
                  placeholder="e.g. 1 year"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
                <input
                  type="text"
                  value={newBid.stockStatus}
                  onChange={(e) => handleInputChange("stockStatus", e.target.value)}
                  placeholder="e.g. In Stock"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={newBid.notifyLowerBids}
                    onChange={() =>
                      setNewBid((p) => ({ ...p, notifyLowerBids: !p.notifyLowerBids }))
                    }
                  />
                  Notify me about lower competing bids
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Part Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                />
              </div>
            </div>
            <div className="flex gap-3 p-4 border-t bg-gray-50 flex-shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBidSubmit}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium cursor-pointer"
              >
                Add Bid
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
