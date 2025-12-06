import { useState } from "react";
import { toast } from "react-toastify";

export default function BidItem({
  bid,
  onEdit,
  onAdminCancel,
  onDelete,
  onHide,
  onUnhide,
  hidden,
  canAdminCancel,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [adminRemarks, setAdminRemarks] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Editable form state in modal
  const [editForm, setEditForm] = useState({
    buyPrice: bid.buyPrice ?? "",
    sellPrice: bid.sellPrice ?? "",
    partQuality: bid.partQuality ?? "",
    remarks: bid.remarks ?? "",
  });

  // Open edit modal and initialize form
  const openEditModal = (e) => {
    e.stopPropagation();
    setEditForm({
      buyPrice: bid.buyPrice ?? "",
      sellPrice: bid.sellPrice ?? "",
      partQuality: bid.partQuality ?? "",
      remarks: bid.remarks ?? "",
    });
    setEditModalOpen(true);
    setMenuOpen(false);
  };

  // Handle input changes inside modal
//   const handleEditChange = (e) => {
//     const { name, value } = e.target;
//     setEditForm((prev) => ({ ...prev, [name]: value }));
//   };

  // Save edited bid
//   const handleEditSave = async () => {
//     if (!editForm.buyPrice || !editForm.sellPrice) {
//       toast.error("Buy Price and Sell Price are required.");
//       return;
//     }
//     try {
//       await onEdit({ ...bid, ...editForm });
//       toast.success("Bid updated successfully.");
//       setEditModalOpen(false);
//     } catch (err) {
//       toast.error(err.message || "Failed to update bid.");
//     }
//   };

//   const handleDeleteClick = async (e) => {
//     e.stopPropagation();
//     const ok = window.confirm(
//       `Delete bid for supplier ${bid.supplier?.name || ""}? This cannot be undone.`
//     );
//     if (!ok) return;
//     if (onDelete) {
//       try {
//         await onDelete(bid.id);
//       } catch (err) {
//         toast.error(err.message || "Failed to delete bid");
//       }
//     }
//     setMenuOpen(false);
//   };

  const confirmAdminCancel = async () => {
    if (!adminRemarks.trim()) {
      toast.error("Remarks required");
      return;
    }
    try {
      await onAdminCancel(bid.id, adminRemarks.trim());
      setCancelModal(false);
      setAdminRemarks("");
    } catch (err) {
      toast.error(err.message || "Failed to cancel bid.");
    }
  };

  return (
    <div className={`p-4 border rounded-lg relative ${hidden ? "opacity-60" : ""}`}>
      {/* Dropdown actions */}
      <div className="absolute top-2 right-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((s) => !s);
          }}
          aria-label="Bid actions"
          className="p-1 rounded hover:bg-gray-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-24 text-sm text-center bg-white border border-gray-200 rounded shadow z-20">
            <button
              onClick={openEditModal}
              className="mt-1 text-blue-600 font-semibold cursor-pointer hover:underline"
            >
              Edit Bid
            </button>
            {/* <button
              onClick={handleDeleteClick}
              className="w-full text-center px-2 py-1 text-sm text-red-600 bg-red-200 border-b font-medium cursor-pointer"
            >
              Delete Bid
            </button> */}
            {canAdminCancel && (
              <button
                onClick={() => {
                  setCancelModal(true);
                  setMenuOpen(false);
                }}
                className="mt-2 mb-1 font-semibold cursor-pointer hover:underline text-red-600"
              >
                Cancel Bid
              </button>
            )}
          </div>
        )}
      </div>

      {/* Supplier info and prices */}
      <div className="grid grid-cols-2 mb-2 px-2 mr-6 md:mr-0">
        <div>
          <div className="font-semibold text-gray-800">{bid.Supplier?.firmName || "—"}</div>
          <div className="text-xs text-gray-500 mt-1">📞 {bid.Supplier?.phone || "—"}</div>
        </div>

        <div className= "ml-20">
          <div className="text text-gray-900 font-semibold md:ml-14">Bids:</div>
          <div className="text-sm font-semibold text-gray-800 flex items-center justify-center gap-1">
            <span className="text-center">₹{bid.buyPrice}</span>
            <span className="text-gray-500 text-xs">→</span>
            <span>₹{bid.sellPrice}</span>
          </div>
          <div className="mt-1 text-xs text-gray-500 md:ml-14">{bid.status}</div>
        </div>
      </div>

      {/* Remarks */}
      <div className="text-xs text-gray-600 text-center mb-1">
        Part Type: {bid.partType || "—"}
      </div>
      <div className="text-xs text-gray-600 text-center mb-2">{bid.remarks || "—"}</div>

      {/* Bottom buttons */}
      <div className="flex justify-center gap-6 mt-2">
        <button
          onClick={() => (hidden ? onUnhide(bid.id) : onHide(bid.id))}
          className="w-20 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors font-medium cursor-pointer"
        >
          {hidden ? "Unhide" : "Hide"}
        </button>
        <button
          onClick={() => setDetailsOpen(true)}
          className="w-24 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium cursor-pointer"
        >
          View Details
        </button>
      </div>

      {/* Admin cancel modal */}
      {cancelModal && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-30">
          <div className="bg-white p-4 rounded shadow max-w-xs w-full relative">
            <button
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-700"
              onClick={() => setCancelModal(false)}
            >
              &times;
            </button>
            <div className="font-bold mb-2 text-orange-700 text-sm">Cancel this bid?</div>
            <textarea
              placeholder="Admin remarks (required)"
              value={adminRemarks}
              onChange={(e) => setAdminRemarks(e.target.value)}
              rows={3}
              className="w-full border p-1 rounded text-xs mb-3"
            />
            <button
              className="w-full bg-orange-700 text-white rounded py-1 text-xs"
              onClick={confirmAdminCancel}
            >
              Confirm Cancel
            </button>
          </div>
        </div>
      )}

      {/* View details modal */}
      {detailsOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-5 rounded shadow max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl cursor-pointer"
              onClick={() => setDetailsOpen(false)}
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold mb-3">Bid Details</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div><strong>Buy Price:</strong> ₹{bid.buyPrice}</div>
              <div><strong>Sell Price:</strong> ₹{bid.sellPrice}</div>
              <div><strong>Status:</strong> {bid.status}</div>
              <div><strong>Supplier:</strong> {bid.supplier?.name || "—"}</div>
              <div><strong>Phone:</strong> {bid.supplier?.phone || "—"}</div>
              <div><strong>City:</strong> {bid.supplier?.city || "—"}, {bid.supplier?.state || "—"}</div>
              <div><strong>Warranty:</strong> {bid.warranty || "—"}</div>
              <div><strong>Part Type:</strong> {bid.partType || "—"}</div>
              <div><strong>Remarks:</strong> {bid.remarks || "—"}</div>
              <div><strong>Admin Remarks:</strong> {bid.adminRemarks || "—"}</div>
              <div><strong>Rating:</strong> {bid.supplier?.rating ?? "—"}</div>
              <div><strong>Delivery ETA:</strong> {bid.deliveryEta || "—"}</div>
              <div><strong>Notify Lower Bids:</strong> {bid.notifyLowerBids ? "Yes" : "No"}</div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl cursor-pointer"
              onClick={() => setEditModalOpen(false)}
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold mb-4">Edit Bid</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Buy Price</label>
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded"
                  value={editForm.buyPrice}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, buyPrice: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sell Price</label>
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded"
                  value={editForm.sellPrice}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, sellPrice: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Part Quality</label>
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={editForm.partQuality}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, partQuality: e.target.value }))
                  }
                >
                  <option value="">Select quality</option>
                  <option value="OEM">OEM</option>
                  <option value="OES">OES</option>
                  <option value="Aftermarket">Aftermarket</option>
                  <option value="Used">Used</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Remarks</label>
                <textarea
                  className="w-full border px-3 py-2 rounded"
                  value={editForm.remarks}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, remarks: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded border cursor-pointer"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer"
                  onClick={async () => {
                    try {
                      await onEdit({ ...bid, ...editForm });
                      setEditModalOpen(false);
                    } catch (err) {
                      toast.error(err.message || "Failed to update bid.");
                    }
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
