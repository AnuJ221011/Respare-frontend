import { useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import AdminOrderBidsPage from "../pages/AdminOrderBidsPage";

export default function AdminOrderBidsRoute() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  console.log("AdminOrderBidsRoute - order id:", id);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
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
        return;
      }

      const orderData = await orderRes.json();
      setOrder(orderData);
    } catch (err) {
      setErrorMsg("Network error. Please try again later.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [id, token, BASE_URL]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  console.log("order data in AdminOrderBidsRoute:", order);

  return (
    <AdminOrderBidsPage
      order={order}
      loading={loading}
      errorMsg={errorMsg}
      onRefresh={fetchOrder}
    />
  );
}
