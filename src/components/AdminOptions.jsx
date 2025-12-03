import { useEffect, useRef, useState, useCallback } from "react";

const FUEL_TYPES = ["Diesel", "Petrol", "CNG", "Electric"];

export default function AdminOptions({ onOrderCreated }) {
  const [openMenu, setOpenMenu] = useState(false);
  const [openAddUser, setOpenAddUser] = useState(false);
  const [openCreateOrder, setOpenCreateOrder] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState(null);

  const menuRef = useRef(null);
  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  const [userType, setUserType] = useState("CUSTOMER");

  const [customerFormData, setCustomerFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    city: "",
    state: "",
    role: "CUSTOMER",
    isSupplier: false,
    supplierId: null
  });

  const [supplierFormData, setSupplierFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    firmName: "",
    gstNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    rating: ""
  });

  const [orderFormData, setOrderFormData] = useState({
    vehicleNumber: "",
    vehicleMake: "",
    vehicleModel: "",
    fuelType: "",
    parts: [{ name: "", qty: 1 }],
    quantity: 1,
    notes: "",
    images: []
  });

  // Fetch customers only when needed
  useEffect(() => {
    const fetchCustomers = async () => {
      if (openCreateOrder && !selectedCustomer && !customers.length) {
        try {
          setCustomersLoading(true);
          setCustomersError(null);
          const token = localStorage.getItem("token");

          const response = await fetch(`${baseUrl}/api/customers`, {
            headers: {
              "Authorization": `Bearer ${token}`
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch customers");
          }
          const customerData = await response.json();
          setCustomers(customerData);
        } catch (error) {
          setCustomersError(error.message);
        } finally {
          setCustomersLoading(false);
        }
      }
    };
    fetchCustomers();
  }, [openCreateOrder, selectedCustomer, baseUrl, customers.length]);

  // Close dropdown/modals on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpenMenu(false);
        setOpenAddUser(false);
        setOpenCreateOrder(false);
        setSelectedCustomer(null);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (openMenu && menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenu]);

  // Prevent body scroll when any modal is open
  useEffect(() => {
    const locked = openAddUser || openCreateOrder;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = locked ? "hidden" : originalOverflow || "auto";
    return () => {
      document.body.style.overflow = originalOverflow || "auto";
    };
  }, [openAddUser, openCreateOrder]);

  // Reset add user form
  useEffect(() => {
    if (!openAddUser) {
      setUserType("CUSTOMER");
      setCustomerFormData({
        name: "",
        phone: "",
        email: "",
        password: "",
        city: "",
        state: "",
        role: "CUSTOMER",
        isSupplier: false,
        supplierId: null
      });
      setSupplierFormData({
        name: "",
        phone: "",
        email: "",
        password: "",
        firmName: "",
        gstNumber: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        rating: ""
      });
      setSuccess(null);
      setError(null);
    }
  }, [openAddUser]);

  // Reset order form
  useEffect(() => {
    if (!openCreateOrder) {
      setOrderFormData({
        vehicleNumber: "",
        vehicleMake: "",
        vehicleModel: "",
        fuelType: "",
        parts: [{ name: "", qty: 1 }],
        quantity: 1,
        notes: "",
        images: []
      });
      setSelectedCustomer(null);
      setSuccess(null);
      setError(null);
    }
  }, [openCreateOrder]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const isCustomer = userType === "CUSTOMER";
    const isAdmin = userType === "ADMIN";
    const isCustomerOrAdmin = isCustomer || isAdmin;
    const endpoint = isCustomerOrAdmin ? "/api/customers" : "/api/suppliers";
    const payload = isCustomerOrAdmin
      ? {
          ...customerFormData,
          role: isAdmin ? "ADMIN" : "CUSTOMER",
          isSupplier: false,
          supplierId: null,
        }
      : {
          ...supplierFormData,
          rating:
            supplierFormData.rating === ""
              ? undefined
              : Number(supplierFormData.rating),
        };

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to create ${isCustomer ? "customer" : "supplier"}`
        );
      }

      setSuccess(
        isCustomerOrAdmin
          ? isAdmin
            ? "Admin created successfully."
            : "Customer created successfully."
          : "Supplier added successfully."
      );

      setTimeout(() => {
        setOpenAddUser(false);
      }, 1500);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSupplierInputChange = (e) => {
    const { name, value } = e.target;
    setSupplierFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOrderInputChange = (e) => {
    const { name, value } = e.target;
    setOrderFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePartChange = (index, field, value) => {
    const updatedParts = [...orderFormData.parts];
    updatedParts[index] = {
      ...updatedParts[index],
      [field]: field === 'qty' ? parseInt(value) || 1 : value
    };

    setOrderFormData(prev => ({
      ...prev,
      parts: updatedParts
    }));
  };

  const addPart = useCallback(() => {
    setOrderFormData(prev => ({
      ...prev,
      parts: [...prev.parts, { name: "", qty: 1 }]
    }));
  }, []);

  const removePart = useCallback((index) => {
    if (orderFormData.parts.length > 1) {
      const updatedParts = orderFormData.parts.filter((_, i) => i !== index);
      setOrderFormData(prev => ({
        ...prev,
        parts: updatedParts
      }));
    }
  }, [orderFormData.parts.length]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const limitedFiles = files.slice(0, 10);
    setOrderFormData(prev => ({
      ...prev,
      images: limitedFiles
    }));
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) {
      setError("Please select a customer first");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");

      const formDataToSend = new FormData();

      // Customer details
      formDataToSend.append("customerName", selectedCustomer.name);
      if (selectedCustomer.phone) {
        formDataToSend.append("customerPhone", selectedCustomer.phone);
      }
      if (selectedCustomer.email) {
        formDataToSend.append("customerEmail", selectedCustomer.email);
      }
      if (selectedCustomer.city) {
        formDataToSend.append("customerCity", selectedCustomer.city);
      }
      if (selectedCustomer.state) {
        formDataToSend.append("customerState", selectedCustomer.state);
      }

      // Order details
      formDataToSend.append("vehicleNumber", orderFormData.vehicleNumber);
      formDataToSend.append("vehicleMake", orderFormData.vehicleMake);
      formDataToSend.append("vehicleModel", orderFormData.vehicleModel);
      if (orderFormData.fuelType) {
        formDataToSend.append("fuelType", orderFormData.fuelType);
      }
      formDataToSend.append("parts", JSON.stringify(orderFormData.parts));
      formDataToSend.append("quantity", orderFormData.quantity.toString());
      formDataToSend.append("notes", orderFormData.notes);

      // Images
      orderFormData.images.forEach((file) => {
        formDataToSend.append("images", file);
      });

      const response = await fetch(`${baseUrl}/api/orders`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create order");
      }

      const data = await response.json();
      setSuccess("Order Created Successfully");
      if (onOrderCreated) {
        onOrderCreated(data.order);
      }

      setTimeout(() => {
        setOpenCreateOrder(false);
        setSelectedCustomer(null);
      }, 1500);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* HAMBURGER */}
      <button
        aria-label="Open menu"
        className="p-2 rounded hover:bg-gray-200"
        onClick={() => setOpenMenu((prev) => !prev)}
      >
        <span className="block w-6 h-0.5 bg-black mb-1" />
        <span className="block w-6 h-0.5 bg-black mb-1" />
        <span className="block w-6 h-0.5 bg-black" />
      </button>

      {/* DROPDOWN */}
      {openMenu && (
        <div ref={menuRef} className="absolute right-6 top-16 w-44 bg-white shadow-lg rounded-xl p-2 z-30">
          <button
            className="w-full p-2 text-left rounded hover:bg-gray-100"
            onClick={() => {
              setOpenAddUser(true);
              setOpenMenu(false);
            }}
          >
            Add User
          </button>

          <button
            className="w-full p-2 text-left rounded hover:bg-gray-100"
            onClick={() => {
              setOpenCreateOrder(true);
              setOpenMenu(false);
            }}
          >
            Create Order
          </button>
        </div>
      )}

      {/* ADD USER MODAL */}
      {openAddUser && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999] p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Add User dialog"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenAddUser(false);
          }}
        >
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">Add User</h2>
              <button
                aria-label="Close add user"
                onClick={() => setOpenAddUser(false)}
                className="text-xl"
              >
                ×
              </button>
            </div>
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                {success}
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                Error: {error}
              </div>
            )}
            <div className="max-h-[80vh] overflow-y-auto p-2">
              <form className="flex flex-col gap-4" onSubmit={handleAddUser}>
                <div>
                  <label className="block text-sm font-medium mb-1">User Type</label>
                  <select
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                    className="border p-2 rounded w-full"
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPPLIER">Supplier</option>
                  </select>
                </div>

                {userType !== "SUPPLIER" ? (
                  <>
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name *"
                      value={customerFormData.name}
                      onChange={handleCustomerInputChange}
                      className="border p-2 rounded"
                      required
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number *"
                      value={customerFormData.phone}
                      onChange={handleCustomerInputChange}
                      className="border p-2 rounded"
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address *"
                      value={customerFormData.email}
                      onChange={handleCustomerInputChange}
                      className="border p-2 rounded"
                      required
                    />
                    <input
                      type="password"
                      name="password"
                      placeholder="Password *"
                      value={customerFormData.password}
                      onChange={handleCustomerInputChange}
                      className="border p-2 rounded"
                      required
                    />
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={customerFormData.city}
                      onChange={handleCustomerInputChange}
                      className="border p-2 rounded"
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={customerFormData.state}
                      onChange={handleCustomerInputChange}
                      className="border p-2 rounded"
                    />
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      name="name"
                      placeholder="Supplier Name *"
                      value={supplierFormData.name}
                      onChange={handleSupplierInputChange}
                      className="border p-2 rounded"
                      required
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number *"
                      value={supplierFormData.phone}
                      onChange={handleSupplierInputChange}
                      className="border p-2 rounded"
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address *"
                      value={supplierFormData.email}
                      onChange={handleSupplierInputChange}
                      className="border p-2 rounded"
                      required
                    />
                    <input
                      type="password"
                      name="password"
                      placeholder="Portal PIN / Password *"
                      value={supplierFormData.password}
                      onChange={handleSupplierInputChange}
                      className="border p-2 rounded"
                      required
                    />
                    <input
                      type="text"
                      name="firmName"
                      placeholder="Firm Name *"
                      value={supplierFormData.firmName}
                      onChange={handleSupplierInputChange}
                      className="border p-2 rounded"
                      required
                    />
                    <input
                      type="text"
                      name="gstNumber"
                      placeholder="GST Number"
                      value={supplierFormData.gstNumber}
                      onChange={handleSupplierInputChange}
                      className="border p-2 rounded"
                    />
                    <textarea
                      name="address"
                      placeholder="Business Address"
                      value={supplierFormData.address}
                      onChange={handleSupplierInputChange}
                      className="border p-2 rounded"
                      rows={2}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={supplierFormData.city}
                        onChange={handleSupplierInputChange}
                        className="border p-2 rounded"
                      />
                      <input
                        type="text"
                        name="state"
                        placeholder="State"
                        value={supplierFormData.state}
                        onChange={handleSupplierInputChange}
                        className="border p-2 rounded"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="pincode"
                        placeholder="Pincode"
                        value={supplierFormData.pincode}
                        onChange={handleSupplierInputChange}
                        className="border p-2 rounded"
                      />
                      <input
                        type="number"
                        name="rating"
                        placeholder="Rating (0-5)"
                        min="0"
                        max="5"
                        step="0.1"
                        value={supplierFormData.rating}
                        onChange={handleSupplierInputChange}
                        className="border p-2 rounded"
                      />
                    </div>
                    <p className="text-xs text-gray-500 -mt-2">
                      Supplier phone numbers must be unique.
                    </p>
                  </>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 w-full disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Submitting..."
                    : userType === "CUSTOMER"
                    ? "Create Customer"
                    : userType === "ADMIN"
                    ? "Create Admin"
                    : "Create Supplier"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ORDER MODAL */}
      {openCreateOrder && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[999]"
          role="dialog"
          aria-modal="true"
          aria-label="Create Order dialog"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpenCreateOrder(false);
              setSelectedCustomer(null);
            }
          }}
        >
          <div className="bg-white rounded-xl w-full max-w-xl max-h-[90vh] overflow-hidden shadow-xl relative">
            {!selectedCustomer ? (
              <>
                <div className="flex justify-between items-center mb-4 p-6 pb-4">
                  <h2 className="text-xl font-semibold">Select Customer</h2>
                  <button
                    aria-label="Close create order"
                    className="text-xl"
                    onClick={() => setOpenCreateOrder(false)}
                  >
                    ×
                  </button>
                </div>

                <div className="px-6">
                  {customersLoading && (
                    <div className="text-center py-4">Loading customers...</div>
                  )}
                  {customersError && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                      Error loading customers: {customersError}
                    </div>
                  )}
                  <div className="max-h-64 overflow-y-auto mb-4 border rounded-lg">
                    {customers.length === 0 && !customersLoading && (
                      <div className="text-center py-8 text-gray-500">
                        No customers found
                      </div>
                    )}
                    {customers.map((customer) => (
                      <button
                        key={customer.id}
                        className="w-full p-3 border-b hover:bg-gray-100 text-left transition-colors duration-150"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-600">{customer.phone} • {customer.email}</div>
                        <div className="text-sm text-gray-500">{customer.city}, {customer.state}</div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setOpenCreateOrder(false)}
                    className="w-full px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors mb-6"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4 p-6 pb-4 border-b">
                  <h2 className="text-xl font-semibold">Create Order — {selectedCustomer.name}</h2>
                  <button
                    aria-label="Close create order"
                    className="text-xl"
                    onClick={() => {
                      setSelectedCustomer(null);
                      setOpenCreateOrder(false);
                    }}
                  >
                    ×
                  </button>
                </div>

                <div className="overflow-y-auto max-h-[calc(90vh-120px)] px-6">
                  {success && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                      {success}
                    </div>
                  )}
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                      Error: {error}
                    </div>
                  )}

                  <form onSubmit={handleCreateOrder} className="grid gap-3 pb-6">
                    <input
                      required
                      name="vehicleNumber"
                      value={orderFormData.vehicleNumber}
                      onChange={handleOrderInputChange}
                      className="border p-2 rounded-xl text-sm"
                      placeholder="Vehicle Number"
                    />
                    <input
                      required
                      name="vehicleMake"
                      value={orderFormData.vehicleMake}
                      onChange={handleOrderInputChange}
                      className="border p-2 rounded-xl text-sm"
                      placeholder="Vehicle Make"
                    />
                    <input
                      required
                      name="vehicleModel"
                      value={orderFormData.vehicleModel}
                      onChange={handleOrderInputChange}
                      className="border p-2 rounded-xl text-sm"
                      placeholder="Vehicle Model"
                    />
                    <div>
                      <label className="block text-sm font-medium mb-1">Fuel Type</label>
                      <select
                        name="fuelType"
                        value={orderFormData.fuelType}
                        onChange={handleOrderInputChange}
                        className="border p-2 rounded-xl text-sm w-full"
                      >
                        <option value="">Select fuel type (optional)</option>
                        {FUEL_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Supports Diesel, Petrol, CNG, Electric
                      </p>
                    </div>

                    <div className="border rounded-xl p-3">
                      <label className="block font-medium mb-2 text-sm">Parts Required *</label>
                      {orderFormData.parts.map((part, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Part Name"
                            value={part.name}
                            onChange={(e) => handlePartChange(index, 'name', e.target.value)}
                            className="border p-2 rounded flex-1 text-sm"
                            required
                          />
                          <input
                            type="number"
                            placeholder="Qty"
                            value={part.qty}
                            onChange={(e) => handlePartChange(index, 'qty', e.target.value)}
                            className="border p-2 rounded w-16 text-sm"
                            min="1"
                            required
                          />
                          {orderFormData.parts.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePart(index)}
                              className="bg-red-500 text-white px-2 rounded hover:bg-red-600 text-sm"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addPart}
                        className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 text-xs"
                      >
                        + Add Part
                      </button>
                    </div>

                    <input
                      type="number"
                      required
                      name="quantity"
                      value={orderFormData.quantity}
                      onChange={handleOrderInputChange}
                      className="border p-2 rounded-xl text-sm"
                      placeholder="Total Quantity"
                      min="1"
                    />
                    <textarea
                      name="notes"
                      className="border p-2 rounded-xl text-sm"
                      placeholder="Remarks"
                      value={orderFormData.notes}
                      onChange={handleOrderInputChange}
                      rows={2}
                    />

                    <div>
                      <label className="block font-medium mb-2 text-sm">
                        Upload Images (Max 10 files)
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="border p-2 rounded-xl w-full text-sm"
                      />
                      {orderFormData.images.length > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                          {orderFormData.images.length} file(s) selected
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 text-sm"
                        onClick={() => {
                          setSelectedCustomer(null);
                        }}
                      >
                        Back to Customers
                      </button>

                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                      >
                        {loading ? "Creating Order..." : "Submit Order"}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}