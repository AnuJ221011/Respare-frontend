import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../components/ui/Loader";
import Button from "../components/ui/Button";

export default function AdminOrderBidsPage() {
  const { id: orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [cancelId, setCancelId] = useState(null);
  const [cancelRemarks, setCancelRemarks] = useState("");
  const [savingQuoteId, setSavingQuoteId] = useState(null);
  const [cancelLoadingId, setCancelLoadingId] = useState(null);
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  // Fetch order and quotes on mount, after update/cancel
  useEffect(() => {
    async function fetchOrder() {
      setLoading(true);
      setErrorMsg("");
      try {
        const res = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const errorText = await res.text();
          setErrorMsg(`Server Error (${res.status}): ${errorText.slice(0, 100)}`);
          setOrder(null);
        } else {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        setErrorMsg("Network error. Please try again.");
        setOrder(null);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId, BASE_URL, token]);

  console.log("order data in AdminOrderBidsPage:", order);

  // Handle edit form change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // PATCH: Save updates to a quote
  const handleEditSave = async (quoteId) => {
    try {
      setSavingQuoteId(quoteId);
      const patchRes = await fetch(`${BASE_URL}/api/quotes/${quoteId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      const data = await patchRes.json();
      if (!patchRes.ok) throw new Error(data.message || "Update failed");
      toast.success("Quote updated.");
      setEditId(null);
      setEditForm({});
      // Refresh order/quotes
      const refRes = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setOrder(await refRes.json());
    } catch (err) {
      toast.error(err.message || "Error updating quote");
    } finally {
      setSavingQuoteId(null);
    }
  };

  // DELETE: Admin cancels a quote
  const handleCancelQuote = async (quoteId) => {
    try {
      if (!cancelRemarks) throw new Error("Please enter cancellation remarks.");
      setCancelLoadingId(quoteId);
      const res = await fetch(`${BASE_URL}/api/quotes/${quoteId}/admin/cancel`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adminRemarks: cancelRemarks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cancel failed");
      toast.success("Quote cancelled.");
      setCancelId(null);
      setCancelRemarks("");
      // Refresh quotes
      const refRes = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setOrder(await refRes.json());
    } catch (err) {
      toast.error(err.message || "Error cancelling quote");
    } finally {
      setCancelLoadingId(null);
    }
  };

  if (loading) return <Loader message="Loading order and bids..." />;
  if (errorMsg)
    return <div className="text-red-600">{errorMsg}</div>;
  if (!order) return (
    <>
      <div className="text-xs text-gray-500 mb-6 flex items-center">
        <Link to="/orderList" className="mr-2 underline font-medium">
          ← Back to All Order
        </Link>
      </div>
      <div className="text-gray-700">No order found.</div>
    </>
  );
  if (!Array.isArray(order.quotes))
    return <div className="text-gray-700">No bids found for this order.</div>;

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 w-full max-w-7xl mx-auto p-6">
      <div className="text-xs text-gray-500 mb-6 flex items-center justify-between">
        <Link to="/orderList" className="mr-2 underline font-medium">
          ← Back to All Order
        </Link>

        <Link
              to={{
                pathname: `/order/${order.id}`,
                search: status !== "PENDING" && status !== "QUOTED" ? "?view=finalQuote" : "",
              }}
              
            >
              <button className="mt-2 text-white font-semibold cursor-pointer bg-blue-500 px-4 py-1 rounded-lg hover:underline">
                View Order Details
              </button>
            </Link>
      </div>
      {/* Order Summary */}
      <div className="mb-4 flex flex-wrap gap-8 items-center bg-gray-50 px-5 py-3 rounded-lg border">
        <div className="text-gray-700 text-sm">
          <span className="font-semibold">Requested Part:</span>{" "}
          {Array.isArray(order.parts)
            ? order.parts.map((p, i) => (
                <span key={i} className="font-medium">
                  {p.name || p}
                </span>
              ))
            : "-"}
        </div>
        <div className="text-gray-700 text-sm">
          <span className="font-semibold">Quantity:</span>{" "}
          <span className="font-medium">{order.quantity}</span>
        </div>
        <div className="text-gray-700 text-sm">
          <span className="font-semibold">Current Status:</span>{" "}
          <span className="font-medium">{order.status}</span>
        </div>
      </div>
      {/* Heading */}
      <h2 className="text-lg font-bold text-gray-900 mb-2">
        Bids For Order #{order.id.slice(0, 5)} :{" "}
        {order.parts?.[0]?.name || order.parts?.[0] || "Part"}
      </h2>
      {/* Table */}
      <div className="bg-white rounded-xl shadow border border-gray-200 w-full overflow-x-auto mt-4">
        <table className="w-full text-left min-w-[1180px]">
          <thead>
            <tr className="text-gray-600 text-sm border-b bg-gray-50">
              <th className="py-4 px-4 font-semibold">Vendor Name</th>
              <th className="py-4 px-4 font-semibold">Date/Time</th>
              <th className="py-4 px-4 font-semibold">Vendor Remarks</th>
              <th className="py-4 px-4 font-semibold">Bid Amount</th>
              <th className="py-4 px-4 font-semibold">Markup Amount</th>
              <th className="py-4 px-4 font-semibold">Status</th>
              <th className="py-4 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {order.quotes.map((q) => (
              <tr key={q.id} className="border-b last:border-none align-top">
                <td className="py-5 px-4 text-sm font-medium">{q.supplier?.name || "Vendor"}</td>
                <td className="py-5 px-4 text-sm">
                  {q.createdAt ? new Date(q.createdAt).toLocaleString() : "—"}
                </td>
                <td className="py-5 px-4 text-sm">{q.remarks || "—"}</td>
                <td className="py-5 px-4 text-sm">
                  ₹ {q.buyPrice} <span className="text-gray-400 text-xs">(buy price)</span>
                </td>
                <td className="py-5 px-4 text-sm">
                  ₹ {q.sellPrice} <span className="text-gray-400 text-xs">(excl. GST)</span>
                </td>
                <td className="py-5 px-4 text-sm">
                  <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded font-semibold">
                    {q.status}
                  </span>
                </td>
                <td className="py-5 px-4 text-sm relative flex gap-2">
                  {/* Edit Button/Form */}
                  {editId !== q.id ? (
                    <>
                      <button
                        className="bg-yellow-400 text-white font-semibold px-3 py-1 rounded text-xs"
                        onClick={() => {
                          setEditId(q.id);
                          setEditForm({
                            buyPrice: q.buyPrice,
                            sellPrice: q.sellPrice,
                            remarks: q.remarks,
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-600 text-white font-semibold px-3 py-1 rounded text-xs"
                        onClick={() => setCancelId(q.id)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        name="buyPrice"
                        value={editForm.buyPrice || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-20 text-xs"
                        placeholder="Buy Price"
                      />
                      <input
                        type="number"
                        name="sellPrice"
                        value={editForm.sellPrice || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-20 text-xs"
                        placeholder="Sell Price"
                      />
                      <input
                        name="remarks"
                        value={editForm.remarks || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-28 text-xs"
                        placeholder="Remarks"
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        className="px-2 py-1 text-xs"
                        onClick={() => handleEditSave(q.id)}
                        isLoading={savingQuoteId === q.id}
                        disableWhileLoading
                      >
                        Save
                      </Button>
                      <button
                        className="bg-gray-400 text-white px-2 py-1 rounded text-xs"
                        onClick={() => setEditId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Cancel dialog inline */}
                  {cancelId === q.id && (
                    <div className="absolute bg-white border p-2 rounded shadow z-20 mt-7">
                      <label className="block text-xs font-medium mb-1">Admin Remarks:</label>
                      <input
                        value={cancelRemarks}
                        onChange={e => setCancelRemarks(e.target.value)}
                        className="border rounded p-1 text-xs mb-2 w-36"
                        placeholder="Enter reason"
                      />
                      <div className="flex gap-1">
                        <Button
                          variant="danger"
                          size="sm"
                          className="px-2 py-1 text-xs"
                          onClick={() => handleCancelQuote(q.id)}
                          isLoading={cancelLoadingId === q.id}
                          disableWhileLoading
                        >
                          Confirm Cancel
                        </Button>
                        <button
                          className="bg-gray-400 text-white px-2 py-1 rounded text-xs"
                          onClick={() => setCancelId(null)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
