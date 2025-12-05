import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminOrderBidsPage from "../pages/AdminOrderBidsPage";
import Loader from "../components/ui/Loader";
import { Link } from "react-router-dom";

export default function AdminOrderBidsRoute() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  console.log("AdminOrderBidsRoute - order id:", id);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setErrorMsg("");
      try {
        const orderRes = await fetch(`${BASE_URL}/api/orders/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!orderRes.ok) {
          if (orderRes.status === 401) {
            setErrorMsg("Unauthorized. Please login as an admin.");
          } else {
            setErrorMsg("Error fetching order details.");
          }
          setOrder(null);
          setLoading(false);
          return;
        }

        const orderData = await orderRes.json();
        setOrder(orderData);
      } catch (err) {
        setErrorMsg("Network error. Please try again later.");
        setOrder(null);
      }
      setLoading(false);
    }
    fetchData();
  }, [id, token, BASE_URL]);

  console.log("order data in AdminOrderBidsRoute:", order);

  if (loading) return <Loader message="Loading order and bids..." />;
  if (errorMsg) return <div className="p-4 text-red-600">{errorMsg}</div>;
  if (!order || !Array.isArray(order.quotes)) {
  return (
    <div className="p-4 text-gray-700">
      <div className="text-xs text-gray-500 mb-6 flex items-center">
        <Link to="/orderList" className="mr-2 underline font-medium">
          ← Back to All Order
        </Link>
      </div>

      No order or bids found.
    </div>
  );
}

  // Map backend data to AdminOrderBidsPage props
  return (
    <AdminOrderBidsPage
      order={{
        id: order.id,
        requestedPart: order.parts?.[0]?.name || "", // adjust if needed
        quantity: order.quantity ?? 1,
        status: order.status,
      }}
      bids={order.quotes.map(q => ({
        id: q.id,
        vendorName: q.supplier?.firmName || q.supplier?.name || "Unknown Vendor",
        dateTime: new Date(q.createdAt).toLocaleString(),
        remarks: q.remarks,
        bidAmount: q.sellPrice,
        markupAmount: q.buyPrice, // change formula if needed
        status: q.status,
      }))}
    />
  );
}
