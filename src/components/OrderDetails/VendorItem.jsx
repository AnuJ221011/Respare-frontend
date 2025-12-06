  import { useState } from "react";
  import { toast } from "react-toastify";

  const normalizeList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch {
        return value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
      return value ? [value] : [];
    }
    return [];
  };

  export default function VendorItem({
    vendor,
    actionLabel = "View Details",
    onAction,
    onHide,
    onEdit,
    onDelete,
  }) {
    const [menuOpen, setMenuOpen] = useState(false);

    const handleDeleteClick = async (e) => {
      e.stopPropagation();
      const ok = window.confirm(`Delete vendor ${vendor.name}? This cannot be undone.`);
      if (!ok) return;
      if (onDelete) {
        try {
          await onDelete(vendor.id);
        } catch (err) {
          console.error("Delete vendor failed:", err);
          toast.error(err.message || "Failed to delete vendor");
        }
      }
      setMenuOpen(false);
    };

    const partGroupList = normalizeList(vendor?.partGroups || vendor?.partGroup);
    const partTypeList = normalizeList(vendor?.partTypes || vendor?.partType);

    return (
      <div className="p-4 border rounded-lg relative bg-white shadow-sm">
        {/* Small toggle menu button */}
        <div className="absolute top-2 right-2">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((s) => !s); }}
            aria-label="Vendor actions"
            className="p-1 rounded hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-26 text-center bg-white border rounded shadow z-20">
              <button
                onClick={handleDeleteClick}
                className="w-full text-center px-1 py-1 text-sm text-red-600 bg-red-200 border-b rounded font-medium cursor-pointer"
              >
                Delete Vendor
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="font-semibold text-gray-900 text-base">
                {vendor.name}
              </div>
              <div className="text-xs text-gray-500">
                {vendor.firmName || vendor.companyName || "—"}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-gray-600">
              {vendor.phone && <span>📞 {vendor.phone}</span>}
              {vendor.email && <span>✉️ {vendor.email}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Location
              </p>
              <p className="font-medium">
                {[vendor.city, vendor.state, vendor.pincode]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                GST Number
              </p>
              <p className="font-medium">{vendor.gstNumber || "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Rating
              </p>
              <p className="font-medium">
                {vendor.rating ? `${vendor.rating}/5` : "Not rated"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Address
              </p>
              <p className="font-medium">{vendor.address || "—"}</p>
            </div>
          </div>

          {!!partGroupList.length && (
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                Part Groups
              </p>
              <div className="flex flex-wrap gap-2">
                {partGroupList.map((group) => (
                  <span
                    key={group}
                    className="px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded-full border border-gray-200"
                  >
                    {group.split("_").join(" ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!!partTypeList.length && (
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                Part Types
              </p>
              <div className="flex flex-wrap gap-2">
                {partTypeList.map((type) => (
                  <span
                    key={type}
                    className="px-2 py-0.5 text-xs bg-blue-50 text-blue-800 rounded-full border border-blue-100"
                  >
                    {type.split("_").join(" ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Section: Buttons */}
          <div className="flex flex-wrap justify-end gap-2 mt-2">
            <button
              onClick={onHide}
              className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors font-medium cursor-pointer"
              title="Hide this vendor"
            >
              Hide
            </button>
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-3 py-1 text-xs bg-white border border-gray-300 text-gray-800 rounded hover:bg-gray-50 transition-colors font-medium cursor-pointer"
              >
                Edit
              </button>
            )}
            <button
              onClick={onAction}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium cursor-pointer"
            >
              {actionLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }
