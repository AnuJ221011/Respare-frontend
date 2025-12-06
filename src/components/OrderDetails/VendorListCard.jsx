import { useState } from "react";
import { toast } from "react-toastify";
import Card from "../ui/Card";
import VendorItem from "./VendorItem";
import { PART_GROUPS, PART_TYPES } from "../../utils/partOptions";

const EMPTY_VENDOR_FORM = {
  name: "",
  phone: "",
  city: "",
  address: "",
  pincode: "",
  gstNumber: "",
  partGroup: "",
  rating: "",
  partGroups: [],
  partTypes: [],
};

const normalizeMultiValue = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
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

const mapVendorToForm = (vendor) => ({
  ...EMPTY_VENDOR_FORM,
  ...(vendor || {}),
  partGroups: normalizeMultiValue(vendor?.partGroups || vendor?.partGroup),
  partTypes: normalizeMultiValue(vendor?.partTypes || vendor?.partType),
});

export default function VendorListCard({
  vendors = [],
  actionLabel = "View Details",
  onAction,
  onAddVendor,
  onUpdateVendor,
  onReload,
  onDelete,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hiddenVendors, setHiddenVendors] = useState(new Set());
  const [modalMode, setModalMode] = useState("create");
  const [editingVendorId, setEditingVendorId] = useState(null);
  const [newVendor, setNewVendor] = useState({ ...EMPTY_VENDOR_FORM });

  // Filter vendors based on search term and hidden status
  const filteredVendors = vendors.filter((vendor) => {
    if (!vendor || hiddenVendors.has(vendor.id)) return false;
    const searchLower = searchTerm.toLowerCase();
    const vendorName = (vendor.name || "").toLowerCase();
    const vendorPhone = (vendor.phone || "").toString();
    const vendorPartGroup = normalizeMultiValue(
      vendor.partGroups || vendor.partGroup
    )
      .join(" ")
      .toLowerCase();
    const vendorPartTypes = normalizeMultiValue(
      vendor.partTypes || vendor.partType
    )
      .join(" ")
      .toLowerCase();
    return (
      vendorName.includes(searchLower) ||
      vendorPhone.includes(searchTerm) ||
      vendorPartGroup.includes(searchLower) ||
      vendorPartTypes.includes(searchLower)
    );
  });

  const handleHideVendor = (vendorId) => {
    setHiddenVendors((prev) => new Set(prev).add(vendorId));
  };

  const handleInputChange = (field, value) => {
    setNewVendor((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleMultiSelect = (field, option) => {
    setNewVendor((prev) => {
      const current = new Set(prev[field] || []);
      if (current.has(option)) {
        current.delete(option);
      } else {
        current.add(option);
      }
      return {
        ...prev,
        [field]: Array.from(current),
      };
    });
  };

  const openCreateModal = () => {
    setModalMode("create");
    setEditingVendorId(null);
    setNewVendor({ ...EMPTY_VENDOR_FORM });
    setIsModalOpen(true);
  };

  const openEditModal = (vendor) => {
    setModalMode("edit");
    setEditingVendorId(vendor.id);
    setNewVendor(mapVendorToForm(vendor));
    setIsModalOpen(true);
  };

  const handleAddVendorSubmit = async () => {
    if (!newVendor.name.trim() || !newVendor.phone.trim()) {
      toast.error("Please fill in at least name and phone number");
      return;
    }
    const vendorData = {
      name: newVendor.name.trim(),
      phone: newVendor.phone.trim(),
      city: newVendor.city.trim() || null,
      address: newVendor.address.trim() || null,
      pincode: newVendor.pincode.trim() || null,
      gstNumber: newVendor.gstNumber.trim() || null,
      partGroup: newVendor.partGroup.trim() || null,
      rating: newVendor.rating ? parseFloat(newVendor.rating) : null,
      partGroups: Array.isArray(newVendor.partGroups)
        ? newVendor.partGroups
        : [],
      partTypes: Array.isArray(newVendor.partTypes) ? newVendor.partTypes : [],
    };
    try {
      if (modalMode === "edit") {
        if (!editingVendorId || !onUpdateVendor) {
          throw new Error("Update handler not available");
        }
        await onUpdateVendor(editingVendorId, vendorData);
        toast.success("Vendor updated successfully!");
      } else if (onAddVendor) {
        await onAddVendor(vendorData);
        toast.success("Vendor added successfully!");
      }
      if (onReload && typeof onReload === "function") {
        try {
          await onReload();
        } catch (reloadErr) {
          console.warn("Vendor reload callback failed:", reloadErr);
        }
      }
    } catch (error) {
      console.error("Error saving vendor:", error);
      toast.error(`Error: ${error.message}`);
      return;
    }
    // Reset form and close modal
    setNewVendor({ ...EMPTY_VENDOR_FORM });
    setEditingVendorId(null);
    setModalMode("create");
    setIsModalOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewVendor({ ...EMPTY_VENDOR_FORM });
    setEditingVendorId(null);
    setModalMode("create");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddVendorSubmit();
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Vendor List</h3>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium cursor-pointer"
        >
          + Add Vendor
        </button>
      </div>
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, phone, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
        />
      </div>
      {/* Vendor List */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto">
        {filteredVendors.length > 0 ? (
          filteredVendors.map((vendor) => (
            <VendorItem
              key={vendor.id}
              vendor={vendor}
              actionLabel={actionLabel}
              onAction={() => onAction && onAction(vendor.id)}
              onHide={() => handleHideVendor(vendor.id)}
              onEdit={() => openEditModal(vendor)}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-lg mb-2">No vendors found</div>
            {searchTerm ? (
              <div className="text-sm">No vendors matching "{searchTerm}"</div>
            ) : hiddenVendors.size > 0 ? (
              <div className="text-sm">All vendors are hidden. Add a new vendor to get started.</div>
            ) : (
              <div className="text-sm">Click "Add Vendor" to get started</div>
            )}
          </div>
        )}
      </div>
      {/* Add Vendor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
              <h3 className="text-lg font-semibold">
                {modalMode === "edit" ? "Edit Vendor" : "Add New Vendor"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold cursor-pointer"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-4 space-y-4 overflow-y-auto flex-grow">
              {/* Form fields (unchanged, see previous versions) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Name *
                </label>
                <input
                  type="text"
                  value={newVendor.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter vendor name"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  autoFocus
                  required
                />
              </div>
              {/* Repeat similar for phone/city/address/etc. as before */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={newVendor.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter phone number"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={newVendor.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter city"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={newVendor.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter address"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  value={newVendor.pincode}
                  onChange={(e) => handleInputChange("pincode", e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter pincode"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Number
                </label>
                <input
                  type="text"
                  value={newVendor.gstNumber}
                  onChange={(e) => handleInputChange("gstNumber", e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter GST Number"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Part Group
                </label>
                <input
                  type="text"
                  value={newVendor.partGroup}
                  onChange={(e) => handleInputChange("partGroup", e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="What does this vendor deal in?"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={newVendor.rating}
                  onChange={(e) => handleInputChange("rating", e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter rating (0-5)"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">
                  Part Groups Offered
                </p>
                <div className="flex flex-wrap gap-2">
                  {PART_GROUPS.map((group) => {
                    const isSelected = newVendor.partGroups.includes(group);
                    return (
                      <button
                        key={group}
                        type="button"
                        onClick={() => toggleMultiSelect("partGroups", group)}
                        className={`px-3 py-1 rounded-full text-xs border ${
                          isSelected
                            ? "bg-black text-white border-black"
                            : "bg-white text-gray-700 border-gray-300"
                        }`}
                      >
                        {group.split("_").join(" ")}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Choose all categories this vendor can support.
                </p>
              </div>
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">
                  Part Types Supported
                </p>
                <div className="flex flex-wrap gap-2">
                  {PART_TYPES.map((type) => {
                    const isSelected = newVendor.partTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleMultiSelect("partTypes", type)}
                        className={`px-3 py-1 rounded-full text-xs border ${
                          isSelected
                            ? "bg-black text-white border-black"
                            : "bg-white text-gray-700 border-gray-300"
                        }`}
                      >
                        {type.split("_").join(" ")}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  e.g. OEM, aftermarket, used, etc.
                </p>
              </div>
              <div className="text-xs text-gray-500 pt-2">* Required fields</div>
            </div>
            {/* Modal Footer */}
            <div className="flex gap-3 p-4 border-t bg-gray-50 flex-shrink-0">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddVendorSubmit}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium cursor-pointer"
              >
                {modalMode === "edit" ? "Save Changes" : "Add Vendor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
