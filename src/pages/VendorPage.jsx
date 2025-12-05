import { useEffect, useState } from "react";
import VendorListCard from "../components/OrderDetails/VendorListCard";

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/vendors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setVendors(data || []);
      } catch (e) {
        console.error("Failed to load vendors", e);
      }
    };

    fetchVendors();
  }, []);

  const handleDeleteVendor = (id) => {
    setVendors((prev) => prev.filter((v) => v.id !== id));
  };

  const handleUpdateVendor = (updated) => {
    setVendors((prev) => [updated, ...prev]);
  };

  return (
    <div>
      <VendorListCard
        vendors={vendors}
        onDeleteVendor={handleDeleteVendor}
        onUpdateVendor={handleUpdateVendor}
      />
    </div>
  );
}
