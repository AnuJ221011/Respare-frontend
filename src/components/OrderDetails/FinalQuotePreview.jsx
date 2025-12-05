import { useState, useEffect } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { toast } from "react-toastify";
import Loader from "../ui/Loader";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function FinalQuotePreview({
  order,
  quote,
  isLoading,
  error,
  onAssignQC,
  onOrderCompleted,
  onQuoteUpdated,
  onQuoteRefresh,
  assigningQcLoading = false,
}) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    buyPrice: "",
    sellPrice: "",
    partQuality: "",
    remarks: "",
  });
  const [saving, setSaving] = useState(false);
  const [completeMsg, setCompleteMsg] = useState("");
  const [markingDelivered, setMarkingDelivered] = useState(false);

  useEffect(() => {
    setForm({
      buyPrice: quote?.buyPrice ?? "",
      sellPrice: quote?.sellPrice ?? "",
      partQuality: quote?.partQuality ?? "",
      remarks: quote?.remarks ?? "",
    });
  }, [quote]);

  const handleEditClick = () => {
    if (!quote) return;
    setForm({
      buyPrice: quote.buyPrice ?? "",
      sellPrice: quote.sellPrice ?? "",
      partQuality: quote.partQuality ?? "",
      remarks: quote.remarks ?? "",
    });
    setEditMode(true);
  };

  const handleSaveClick = async () => {
    if (!quote?.id) return toast.error("Missing quote ID");
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        buyPrice: parseFloat(form.buyPrice) || 0,
        sellPrice: parseFloat(form.sellPrice) || 0,
        partQuality: form.partQuality || "",
        remarks: form.remarks || "",
      };
      const res = await fetch(`${baseUrl}/api/quotes/${quote.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Update failed");
      const updatedQuote = data.quote || data;
      toast.success("Quote updated successfully!");
      setEditMode(false);
      onQuoteUpdated?.(updatedQuote);
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setForm({
      buyPrice: quote?.buyPrice ?? "",
      sellPrice: quote?.sellPrice ?? "",
      partQuality: quote?.partQuality ?? "",
      remarks: quote?.remarks ?? "",
    });
    setEditMode(false);
  };

  const handleMarkDelivered = async () => {
    if (markingDelivered) return;
    if (!order?.id) return toast.error("Order ID missing");
    try {
      setMarkingDelivered(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseUrl}/api/orders/${order.id}/complete`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Mark delivered failed");
      setCompleteMsg("Item delivered successfully.");
      toast.success("Order marked delivered");
      if (typeof onOrderCompleted === "function") await onOrderCompleted();
      if (typeof onQuoteRefresh === "function") await onQuoteRefresh();
    } catch (err) {
      toast.error(err.message || "Failed to mark delivered");
    } finally {
      setMarkingDelivered(false);
    }
  };

  console.log("Fina Quote:", quote);
  console.log("Final Quote order:", order);

  if (isLoading)
    return (
      <Card className="p-6">
        <Loader message="Loading quote details..." />
      </Card>
    );

  if (error)
    return (
      <Card className="p-6">
        <div className="text-red-600">Error: {error}</div>
      </Card>
    );

  if (!quote)
    return (
      <Card className="p-6">
        <div>No accepted quote available.</div>
      </Card>
    );

  const vendor = quote.Supplier;

  let actionSection = null;
  if (order.status === "QUOTE_ACCEPTED_BY_CUSTOMER" && !editMode) {
    actionSection = (
      <Button
        variant="primary"
        size="md"
        className="px-6"
        onClick={onAssignQC}
        isLoading={assigningQcLoading}
        disableWhileLoading
      >
        Assign QC
      </Button>
    );
  } else if (order.status === "CONFIRMED" && !editMode) {
    actionSection = (
      <Button
        variant="primary"
        size="md"
        className="px-6"
        onClick={handleMarkDelivered}
        isLoading={markingDelivered}
        disableWhileLoading
      >
        Mark Delivered
      </Button>
    );
  } else if (order.status === "COMPLETED") {
    actionSection = (
      <div className="bg-green-50 border border-green-200 rounded px-4 py-3 text-green-800 text-center font-semibold mt-3">
        {completeMsg ? completeMsg : "Item delivered successfully."}
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Quote ID #{quote.id}</h3>
          {!editMode && order.status !== "COMPLETED" ? (
            <Button variant="outline" size="sm" className="ml-4" onClick={handleEditClick}>
              Edit
            </Button>
          ) : null}
          {editMode && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveClick}
                isLoading={saving}
                disableWhileLoading
              >
                Save
              </Button>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500 font-medium mb-1">Vendor Information</div>
        <div className="flex text-sm py-1 mb-6">
          <div className="text-gray-800">
            {vendor?.firmName}
            &nbsp;&nbsp;|&nbsp;&nbsp;
          </div>
          <div className="text-gray-800">
            {vendor?.phone}
            &nbsp;&nbsp;|&nbsp;&nbsp;
          </div>
          <div className="text-gray-800">
            {vendor?.city} ({vendor?.state})
          </div>
        </div>

        <div className="text-gray-500 w-40 mb-1">Part Information</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div>
            <div className="text-xs text-gray-500">Buy Price</div>
            {editMode ? (
              <input
                type="number"
                value={form.buyPrice}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, buyPrice: e.target.value }))
                }
                className="w-full border rounded p-1 text-sm"
              />
            ) : (
              <div className="text-gray-800 font-medium text-sm">₹{quote.buyPrice}</div>
            )}
          </div>
          <div>
            <div className="text-xs text-gray-500">Sell Price</div>
            {editMode ? (
              <input
                type="number"
                value={form.sellPrice}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, sellPrice: e.target.value }))
                }
                className="w-full border rounded p-1 text-sm"
              />
            ) : (
              <div className="text-gray-800 font-medium text-sm">₹{quote.sellPrice}</div>
            )}
          </div>
          <div>
            <div className="text-xs text-gray-500">Part Type</div>
            {editMode ? (
              <select
                value={form.partType}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, partQuality: e.target.value }))
                }
                className="w-full border rounded p-1 text-sm"
              >
                <option value="">Select quality</option>
                <option value="OEM">OEM</option>
                <option value="OES">OES</option>
                <option value="Aftermarket">Aftermarket</option>
                <option value="Used">Used</option>
              </select>
            ) : (
              <div className="text-gray-800 font-medium text-sm">
                {quote.partQuality || "—"}
              </div>
            )}
          </div>
        </div>

        <div className="text-gray-500 w-40 mb-1">Timeline</div>
        <div className="mb-4">
          <div className="text-xs text-gray-500">Tentative Delivery Date</div>
          <div className="text-gray-800 font-medium text-sm">{quote.deliveryEta || "N/A"}</div>
        </div>
        
        <div className="flex gap-10">
  {/* Remarks Section */}
  <div className="w-1/2">
    <div className="text-gray-500 text-sm mb-1">Remarks</div>

    {editMode ? (
      <textarea
        value={form.remarks}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, remarks: e.target.value }))
        }
        className="w-full border rounded p-2 text-xs"
      />
    ) : (
      <div className="text-gray-800 text-xs mb-2">
        {quote.remarks || "N/A"}
      </div>
    )}
  </div>

  {/* Admin Remarks Section */}
  <div className="w-1/2">
    <div className="text-gray-500 text-sm mb-1">Admin Remarks</div>

    <div className="text-gray-800 text-xs">
      {quote.adminRemarks || "N/A"}
    </div>
  </div>
</div>


        <div className="text-gray-500 w-40 mb-1">Images</div>
        <div className="mb-6">
          {quote.partImages && quote.partImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {quote.partImages.map((image, index) => (
                <div key={index} className="border rounded-lg overflow-hidden bg-gray-50">
                  <div className="aspect-square w-full">
                    <img
                      src={typeof image === "string" ? image : URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-contain"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-600">No images uploaded</div>
          )}
        </div>

        <div className="flex justify-end mt-6">{actionSection}</div>
      </div>
    </Card>
  );
}