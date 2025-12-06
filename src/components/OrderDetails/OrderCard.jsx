import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Card from "../ui/Card";
import InfoRow from "../ui/InfoRow";
import Button from "../ui/Button";

const FUEL_TYPES = ["Diesel", "Petrol", "CNG", "Electric"];

const extractPartNames = (parts) => {
  if (!parts) return [];
  if (Array.isArray(parts)) {
    return parts
      .map((part) =>
        typeof part === "string"
          ? part
          : part?.name || part?.partName || part?.value || ""
      )
      .filter(Boolean);
  }
  if (typeof parts === "string") {
    try {
      const parsed = JSON.parse(parts);
      if (Array.isArray(parsed)) {
        return parsed
          .map((part) =>
            typeof part === "string"
              ? part
              : part?.name || part?.partName || part?.value || ""
          )
          .filter(Boolean);
      }
    } catch {
      return parts
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
    }
    return [parts].filter(Boolean);
  }
  return [];
};

const mapOrderToEditable = (source) => ({
  vehicleNumber: source?.vehicleNumber || "",
  vehicleMake: source?.vehicleMake || "",
  vehicleModel: source?.vehicleModel || "",
  vehicleYear: source?.vehicleYear || "",
  fuelType: source?.fuelType || "",
  partName: extractPartNames(source?.parts).join(", "),
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
        fuelType: editData.fuelType || "",
        partName: editData.partName,
        quantity: Number(editData.quantity),
        notes: editData.notes,
        images: editData.images,
      };

      if (!payload.fuelType) {
        delete payload.fuelType;
      }

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
    <Card className="w-full">
      {/* Mobile collapse header */}
      <div className="md:hidden">
        <button
          onClick={() => setOpen((s) => !s)}
          aria-expanded={open}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">
              Order ID #{order.id}
            </div>
            <div className="text-xs text-gray-500 truncate mt-1">
              {order.vehicleNumber}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded whitespace-nowrap">
              {status}
            </span>
            <svg
              className={`w-5 h-5 transition-transform ${
                open ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>
      </div>

      {/* Main content */}
      <div className={`${open ? "block" : "hidden"} md:block p-4 md:p-6`}>
        <div className="hidden md:flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Order ID #{order.id}</h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-500 p-1 hover:bg-gray-100 rounded cursor-pointer flex items-center gap-1 text-sm"
              aria-label="Edit order"
              title="Edit order"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </button>
          )}
        </div>

        {/* Mobile Edit button */}
        {!isEditing && (
          <div className="md:hidden mb-4">
            <button
              onClick={() => setIsEditing(true)}
              className="w-full text-gray-700 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center gap-2 text-sm font-medium"
              aria-label="Edit order"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Order
            </button>
          </div>
        )}

        {/* EDIT MODE */}
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded text-sm"
                  value={editData.vehicleNumber}
                  onChange={(e) => handleChange("vehicleNumber", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Vehicle Make
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded text-sm"
                  value={editData.vehicleMake}
                  onChange={(e) => handleChange("vehicleMake", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Vehicle Model
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded text-sm"
                  value={editData.vehicleModel}
                  onChange={(e) => handleChange("vehicleModel", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Vehicle Year
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded text-sm"
                  value={editData.vehicleYear}
                  onChange={(e) => handleChange("vehicleYear", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Fuel Type
                </label>
                <select
                  className="w-full px-3 py-2 border rounded text-sm"
                  value={editData.fuelType}
                  onChange={(e) => handleChange("fuelType", e.target.value)}
                >
                  <option value="">Select fuel type</option>
                  {FUEL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Part Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded text-sm"
                  value={editData.partName}
                  onChange={(e) => handleChange("partName", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded text-sm"
                  value={editData.quantity}
                  onChange={(e) => handleChange("quantity", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Remark</label>
                <textarea
                  className="w-full px-3 py-2 border rounded text-sm"
                  rows="3"
                  value={editData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Part Images
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Images remain exactly as the customer uploaded them.
              </p>
              <div className="flex flex-wrap gap-2">
                {editData.images.length > 0 ? (
                  editData.images.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      className="w-16 h-16 sm:w-20 sm:h-20 border rounded object-cover"
                      alt={`part-${idx}`}
                    />
                  ))
                ) : (
                  <span className="text-xs text-gray-400">No part images</span>
                )}
              </div>
            </div>

            {/* Save / Cancel Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={handleCancel}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                isLoading={saving}
                disableWhileLoading
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          /* VIEW MODE */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <InfoRow
                  label="Vehicle Number"
                  value={order.vehicleNumber || "N/A"}
                />
                <InfoRow
                  label="Make / Model / Year"
                  value={
                    `${order.vehicleMake || ""}, ${order.vehicleModel || ""}, ${
                      order.vehicleYear || ""
                    }`.trim() || "N/A"
                  }
                />
                <InfoRow
                  label="Fuel Type"
                  value={order.fuelType || "Not specified"}
                />
                <InfoRow label="Remark" value={order.notes || "No Remark"} />
                <InfoRow label="Status" value={status || "N/A"} />
              </div>

              <div className="space-y-4">
                <InfoRow
                  label="Part Name"
                  value={extractPartNames(order.parts).join(", ") || "—"}
                />
                <InfoRow label="Part Number" value={order.partNumber || "—"} />
                <InfoRow
                  label="Part Group"
                  value={
                    order.partGroup
                      ? order.partGroup.split("_").join(" ")
                      : "—"
                  }
                />
                <InfoRow label="Quantity" value={order.quantity || 0} />
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">
                Part Images
              </div>
              <div className="flex flex-wrap gap-2">
                {(order.images || []).length > 0 ? (
                  order.images.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover border rounded"
                      alt={`part-${idx}`}
                    />
                  ))
                ) : (
                  <p className="text-xs text-gray-400">No part images</p>
                )}
              </div>
            </div>
              </div>
            </div>


            <div className="flex justify-center pt-4">
              <Button
                variant="secondary"
                size="md"
                onClick={handleCancelRequest}
                disabled={status === "Cancelled"}
                isLoading={cancelling}
                disableWhileLoading
                className="w-full sm:w-auto"
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