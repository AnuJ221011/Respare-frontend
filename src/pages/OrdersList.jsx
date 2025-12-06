import { useState, useEffect, useCallback } from "react";
import OrderListTable from "../components/OrderListTable";
import Loader from "../components/ui/Loader";
import AdminOptions from "../components/AdminOptions";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrl}/api/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || "Failed to fetch orders");
    }
    return response.json();
  }, [baseUrl]);

  

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchOrders();
        if (!ignore) {
          setOrders(data.orders);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Unknown error");
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
  }, [fetchOrders]);

  console.log("Orders fetched:", orders);

  const handleOrderCreated = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  if (loading) return <Loader message="Loading orders..." />;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="p-4 py-2">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold mb-6">Orders</h2>
        <AdminOptions onOrderCreated={handleOrderCreated}/>

      </div>
      
      <OrderListTable orders={orders} />
    </div>
  );
}