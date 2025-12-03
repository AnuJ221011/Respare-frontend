import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Card from "../ui/Card";
import InfoRow from "../ui/InfoRow";
import Button from "../ui/Button";

const mapOrderToEditable = (source) => ({
  vehicleNumber: source?.vehicleNumber || "",
  vehicleMake: source?.vehicleMake || "",
  vehicleModel: source?.vehicleModel || "",
  vehicleYear: source?.vehicleYear || "",
  partName: (source?.parts || []).map((part) => part.name).join(", ") || "",
  quantity: source?.quantity || 1,
  notes: source?.notes || "",
  images: source?.images || [],
});

export default function OrderCard({ order, onOrderUpdated }) {
  const [open, setOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(order.status || "N/A");
  const [cancelling, setCancelling] = useState(false);
  const [saving, setSaving] = useState(false);
  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  // Local editable copy
  const [editData, setEditData] = useState(mapOrderToEditable(order));

  useEffect(() => {
    setStatus(order.status || "N/A");
    if (!isEditing) {
      setEditData(mapOrderToEditable(order));
    }
  }, [order, isEditing]);

  const handleChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  // Only working with part images (order.images)
  const handleUploadImages = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to upload images.");
      return;
    }
    // Only allow 'orders' as the folder for backend convention
    const type = "orders";
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });
      formData.append("folder", type);
      const res = await fetch(`${baseUrl}/api/images/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to upload images");
      }
      const data = await res.json();
      const newKeys = data.images.map((img) => img.key);
      setEditData((prev) => ({
        ...prev,
        images: [...prev.images, ...newKeys],
      }));
      toast.success("Images uploaded successfully.");
      e.target.value = null;
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteImage = async (key) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to delete images.");
      return;
    }
    try {
      const res = await fetch(`${baseUrl}/api/images/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ key }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to delete image");
      }
      setEditData((prev) => ({
        ...prev,
        images: prev.images.filter((k) => k !== key),
      }));
      toast.success("Image deleted.");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSave = async () => {
    if (saving) return;
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to save changes.");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        vehicleNumber: editData.vehicleNumber,
        vehicleMake: editData.vehicleMake,
        vehicleModel: editData.vehicleModel,
        vehicleYear: editData.vehicleYear,
        partName: editData.partName,
        quantity: Number(editData.quantity),
        notes: editData.notes,
        images: editData.images,
      };
      const res = await fetch(`${baseUrl}/api/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to update order");
      }
      const updatedOrder = await res.json();
      const normalized = updatedOrder.order || updatedOrder;
      setEditData(mapOrderToEditable(normalized));
      setStatus(normalized.status || status);
      onOrderUpdated?.(normalized);
      setIsEditing(false);
      toast.success("Order updated successfully.");
    } catch (error) {
      toast.error(`Error updating order: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(mapOrderToEditable(order));
    setIsEditing(false);
  };

  const handleCancelRequest = async () => {
    if (status === "CANCELLED") return;
    const ok = window.confirm(
      "Are you sure you want to cancel this order? This action cannot be undone."
    );
    if (!ok) return;
    try {
      setCancelling(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not authenticated. Please login.");
        setCancelling(false);
        return;
      }
      const res = await fetch(`${baseUrl}/api/orders/${order.id}/cancel-admin`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const message = data?.message || "Failed to cancel order";
        throw new Error(message);
      }
      const normalized = data?.order || data || { status: "CANCELLED" };
      setStatus(normalized.status || "CANCELLED");
      onOrderUpdated?.(normalized);
      toast.success("Order cancelled successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Card className="relative">
      {/* Mobile collapse header */}
      <div
        className="md:hidden flex justify-between items-center cursor-pointer"
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
      >
        <div>
          <div
            className={`text-sm font-semibold text-gray-800 ${
              order.status === "CANCELLED" ? "line-through text-red-500" : ""
            }`}
          >
            Order ID #{order.id}
          </div>
          <div className="text-xs text-gray-500">{order.vehicleNumber}</div>
        </div>
        <Button size="sm" variant="primary">
          {status}
        </Button>
      </div>

      {/* Main content */}
      <div className={`${open ? "block" : "hidden"} md:block mt-3 md:mt-0`}>
        <div className="flex justify-between items-start">
          <h2
            className={`text-lg font-semibold text-gray-800 ${
              order.status === "CANCELLED" ? "line-through text-red-500" : ""
            }`}
          >
            Order ID #{order.id}
          </h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="hidden md:inline text-gray-500 p-1 hover:bg-gray-100 rounded cursor-pointer"
              aria-label="Edit order"
              title="Edit order"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 inline-block"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M14.5 7.5l-6 6" />
                <path d="M16 6l2 2" />
              </svg>
              Edit
            </button>
          )}
        </div>
        {/* EDIT MODE */}
        {isEditing ? (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Vehicle Number</label>
              <input
                className="w-full p-2 border rounded mb-4"
                value={editData.vehicleNumber}
                onChange={(e) => handleChange("vehicleNumber", e.target.value)}
              />
              <label className="text-sm font-medium">Vehicle Make</label>
              <input
                className="w-full p-2 border rounded mb-4"
                value={editData.vehicleMake}
                onChange={(e) => handleChange("vehicleMake", e.target.value)}
              />
              <label className="text-sm font-medium">Vehicle Model</label>
              <input
                className="w-full p-2 border rounded mb-4"
                value={editData.vehicleModel}
                onChange={(e) => handleChange("vehicleModel", e.target.value)}
              />
              <label className="text-sm font-medium">Vehicle Year</label>
              <input
                className="w-full p-2 border rounded mb-4"
                value={editData.vehicleYear}
                onChange={(e) => handleChange("vehicleYear", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Part Name</label>
              <input
                className="w-full p-2 border rounded mb-4"
                value={editData.partName}
                onChange={(e) => handleChange("partName", e.target.value)}
              />
              <label className="text-sm font-medium">Quantity</label>
              <input
                className="w-full p-2 border rounded mb-4"
                type="number"
                value={editData.quantity}
                onChange={(e) => handleChange("quantity", e.target.value)}
              />
              <label className="text-sm font-medium">Remark</label>
              <textarea
                className="w-full p-2 border rounded mb-4"
                rows={3}
                value={editData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            </div>
            <div className="col-span-2">
              {/* Part Images only */}
              <label className="text-sm font-medium">Part Images</label>
              <div className="flex gap-3 mt-2 mb-4">
                {editData.images.map((src, idx) => (
                  <div key={idx} className="relative group w-20 h-20">
                    <img
                      src={src}
                      className="w-20 h-20 border rounded object-cover"
                      alt={`part-${idx}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(src)}
                      className="absolute top-0 right-0 bg-red-600 rounded-full w-5 h-5 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition"
                      aria-label="Delete part image"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUploadImages}
                  className="hidden"
                  id="uploadPartImages"
                />
                <label
                  htmlFor="uploadPartImages"
                  className="cursor-pointer flex items-center px-3 py-2 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100"
                >
                  + Upload
                </label>
              </div>
              {/* Save / Cancel Buttons */}
              <div className="col-span-2 flex justify-end mt-4 gap-3">
                <Button variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  isLoading={saving}
                  disableWhileLoading
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* VIEW MODE */
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <InfoRow label="Vehicle Number" value={order.vehicleNumber || "N/A"} />
              <InfoRow
                label="Make / Model / Year"
                value={`${order.vehicleMake || ""}, ${order.vehicleModel || ""}, ${order.vehicleYear || ""}`.trim() || "N/A"}
              />
              <InfoRow label="Remark" value={order.notes || "No Remark"} />
            </div>
            <div>
              <InfoRow label="Part Name" value={order.parts?.map((p) => p.name).join(", ")} />
              <InfoRow label="Quantity" value={order.quantity || 0} />
              <InfoRow label="Status" value={status || "N/A"} />
            </div>
            <div className="col-span-2">
              <div className="py-2 text-sm text-gray-500">Part Images</div>
              <div className="flex gap-2 mt-2">
                {(order.images || []).length > 0 ? (
                  order.images.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      className="w-20 h-20 object-cover border rounded-sm"
                      alt={`part-${idx}`}
                    />
                  ))
                ) : (
                  <p className="text-xs text-gray-400">No part images</p>
                )}
              </div>
            </div>
            <div className="mt-6 col-span-2 flex justify-center w-full">
              <Button
                variant="secondary"
                size="md"
                className="mr-4"
                onClick={handleCancelRequest}
                disabled={status === "Cancelled"}
                isLoading={cancelling}
                disableWhileLoading
              >
                {status === "Cancelled" ? "Cancelled" : "Cancel Request"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
