import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import VendorListCard from "../components/OrderDetails/VendorListCard";
import Loader from "../components/ui/Loader";
import Button from "../components/ui/Button";

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchVendors = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required");
    }
    const res = await fetch(`${baseUrl}/api/suppliers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const errorPayload = await res.json().catch(() => ({}));
      throw new Error(errorPayload.message || "Failed to fetch vendors");
    }
    const data = await res.json();
    return Array.isArray(data) ? data : data.suppliers || [];
  }, [baseUrl]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const list = await fetchVendors();
        if (!ignore) {
          setVendors(list);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Unable to load vendors");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [fetchVendors]);

  const authorizedRequest = async (url, options = {}) => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required");
    }
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(body.message || "Request failed");
    }
    return body;
  };

  const handleAddVendor = async (payload) => {
    const data = await authorizedRequest(`${baseUrl}/api/suppliers`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data;
  };

  const handleUpdateVendor = async (vendorId, payload) => {
    if (!vendorId) throw new Error("Missing vendor id");
    const data = await authorizedRequest(`${baseUrl}/api/suppliers/${vendorId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return data;
  };

  const handleDeleteVendor = async (vendorId) => {
    if (!vendorId) throw new Error("Missing vendor id");
    await authorizedRequest(`${baseUrl}/api/suppliers/${vendorId}`, {
      method: "DELETE",
    });
    setVendors((prev) => prev.filter((vendor) => vendor.id !== vendorId));
  };

  const reloadVendors = async () => {
    const list = await fetchVendors();
    setVendors(list);
  };

  return (
    <div className="px-4 py-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Vendors</p>
            <h1 className="text-2xl font-semibold text-gray-900">Supplier Directory</h1>
            <p className="text-sm text-gray-500">
              Track every supplier, their coverage area, and the part categories they support.
            </p>
          </div>
          <Link to="/orderList" className="self-start sm:self-auto">
            <Button variant="secondary">← Back to Orders</Button>
          </Link>
        </div>

        {error && (
          <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <Loader message="Loading vendors..." />
        ) : (
          <VendorListCard
            vendors={vendors}
            actionLabel="Details"
            onAddVendor={handleAddVendor}
            onUpdateVendor={handleUpdateVendor}
            onReload={reloadVendors}
            onDelete={handleDeleteVendor}
          />
        )}
      </div>
    </div>
  );
}
