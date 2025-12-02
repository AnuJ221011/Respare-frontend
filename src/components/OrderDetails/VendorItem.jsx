import { useState } from "react";
import { toast } from "react-toastify";

export default function VendorItem({ vendor, actionLabel = "View Details", onAction, onHide, onDelete }) {
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

  return (
    <div className="p-4 border rounded-lg relative">
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

      {/* Top Section: Name/Phone (Left) and Deals In (Right) */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="font-semibold text-gray-800">{vendor.name}</div>
          <div className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
            <span>📞</span>
            <span>{vendor.phone}</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600 font-medium">Deals in :</div>
          <div className="text-sm text-gray-700 mt-1">
            {vendor.partGroup || "N/A"}
          </div>
        </div>
      </div>

      {/* Bottom Section: Centered Buttons */}
      <div className="flex justify-center gap-32 mt-4">
        <button
          onClick={onHide}
          className="w-28 px-1 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors font-medium cursor-pointer"
          title="Hide this vendor"
        >
          Hide
        </button>
        <button
          onClick={onAction}
          className="w-28 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium cursor-pointer"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
