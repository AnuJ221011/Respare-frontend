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

  const formatDate = (isoString) => {
    if (!isoString) return "—";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
      return isoString.split("T")[0] || isoString;
    }
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPartNames = (parts) => {
    if (!parts) return [];
    if (Array.isArray(parts)) {
      return parts.map((part) =>
        typeof part === "string"
          ? part
          : part?.name || part?.partName || part?.value || ""
      );
    }
    if (typeof parts === "string") {
      try {
        const parsed = JSON.parse(parts);
        if (Array.isArray(parsed)) {
          return parsed.map((part) =>
            typeof part === "string"
              ? part
              : part?.name || part?.partName || part?.value || ""
          );
        }
        return [parts];
      } catch {
        return parts.split(",").map((part) => part.trim());
      }
    }
    return [];
  };

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

  const detailsLink = {
    pathname: `/order/${order.id}`,
    search:
      order.status !== "PENDING" && order.status !== "QUOTED"
        ? "?view=finalQuote"
        : "",
  };

  const partNames = getPartNames(order.parts);
  const orderPartsText = partNames.filter(Boolean).join(", ") || "—";
  const orderSummaryItems = [
    { label: "Requested Part(s)", value: orderPartsText },
    {
      label: "Part Group",
      value: order.partGroup ? order.partGroup.split("_").join(" ") : "—",
    },
    { label: "Quantity", value: order.quantity || "—" },
    {
      label: "Vehicle",
      value: `${order.vehicleMake || ""} ${order.vehicleModel || ""} ${
        order.vehicleNumber ? `(${order.vehicleNumber})` : ""
      }`.trim() || "—",
    },
    { label: "Fuel Type", value: order.fuelType || "Not specified" },
    { label: "Current Status", value: order.status || "—" },
  ];

  const quotes = Array.isArray(order.quotes) ? order.quotes : [];

  const renderCancelDialog = (quote, isCard = false) => {
    if (cancelId !== quote.id) return null;

    if (isCard) {
      return (
        <div className="mt-3 border border-gray-200 rounded-lg bg-gray-50 p-3">
          <label className="block text-xs font-medium mb-1">
            Admin Remarks
          </label>
          <input
            value={cancelRemarks}
            onChange={(e) => setCancelRemarks(e.target.value)}
            className="border rounded w-full p-2 text-xs mb-2"
            placeholder="Enter reason"
          />
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="danger"
              size="sm"
              className="px-3 py-1 text-xs"
              onClick={() => handleCancelQuote(quote.id)}
              isLoading={cancelLoadingId === quote.id}
              disableWhileLoading
            >
              Confirm Cancel
            </Button>
            <button
              className="bg-gray-400 text-white px-3 py-1 rounded text-xs"
              onClick={() => {
                setCancelId(null);
                setCancelRemarks("");
              }}
            >
              Close
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="absolute top-full right-0 mt-2 border border-gray-200 rounded bg-white p-3 shadow-md z-20 w-48">
        <label className="block text-xs font-medium mb-1">Admin Remarks:</label>
        <input
          value={cancelRemarks}
          onChange={(e) => setCancelRemarks(e.target.value)}
          className="border rounded p-1 text-xs mb-2 w-full"
          placeholder="Enter reason"
        />
        <div className="flex flex-col gap-1">
          <Button
            variant="danger"
            size="sm"
            className="px-2 py-1 text-xs"
            onClick={() => handleCancelQuote(quote.id)}
            isLoading={cancelLoadingId === quote.id}
            disableWhileLoading
          >
            Confirm Cancel
          </Button>
          <button
            className="bg-gray-400 text-white px-2 py-1 rounded text-xs"
            onClick={() => {
              setCancelId(null);
              setCancelRemarks("");
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  const renderQuoteActions = (quote, isCard = false) => {
    const isEditing = editId === quote.id;
    const inputBaseClass = isCard
      ? "border px-3 py-2 rounded text-sm w-full"
      : "border px-2 py-1 rounded text-xs";

    return (
      <div
        className={`relative ${
          isCard ? "flex flex-col gap-2 w-full" : "flex flex-wrap gap-2"
        }`}
      >
        {!isEditing ? (
          <>
            <button
              className={`bg-yellow-500 text-white font-semibold rounded ${
                isCard ? "px-4 py-2 text-sm" : "px-3 py-1 text-xs"
              }`}
              onClick={() => {
                setEditId(quote.id);
                setEditForm({
                  buyPrice: quote.buyPrice,
                  sellPrice: quote.sellPrice,
                  remarks: quote.remarks,
                });
              }}
            >
              Edit
            </button>
            <button
              className={`bg-red-600 text-white font-semibold rounded ${
                isCard ? "px-4 py-2 text-sm" : "px-3 py-1 text-xs"
              }`}
              onClick={() => setCancelId(quote.id)}
            >
              Cancel
            </button>
          </>
        ) : (
          <div
            className={`${
              isCard
                ? "flex flex-col gap-2 w-full"
                : "flex flex-wrap gap-2 items-center"
            }`}
          >
            <input
              type="number"
              name="buyPrice"
              value={editForm.buyPrice ?? ""}
              onChange={handleEditChange}
              className={`${inputBaseClass} ${isCard ? "" : "w-24"}`}
              placeholder="Buy Price"
            />
            <input
              type="number"
              name="sellPrice"
              value={editForm.sellPrice ?? ""}
              onChange={handleEditChange}
              className={`${inputBaseClass} ${isCard ? "" : "w-24"}`}
              placeholder="Sell Price"
            />
            <input
              name="remarks"
              value={editForm.remarks ?? ""}
              onChange={handleEditChange}
              className={`${inputBaseClass} ${isCard ? "" : "w-32"}`}
              placeholder="Remarks"
            />
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                className={isCard ? "px-4 py-2" : "px-2 py-1 text-xs"}
                onClick={() => handleEditSave(quote.id)}
                isLoading={savingQuoteId === quote.id}
                disableWhileLoading
              >
                Save
              </Button>
              <button
                className="bg-gray-400 text-white px-3 py-1 rounded text-xs"
                onClick={() => setEditId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {renderCancelDialog(quote, isCard)}
      </div>
    );
  };

  return (
    <div className="px-4 py-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <Link to="/orderList" className="underline font-medium">
              ← Back to All Orders
            </Link>
            <span className="hidden sm:inline text-gray-400">•</span>
            <span className="font-semibold text-gray-700">
              Order #{order.id.slice(0, 6)}
            </span>
          </div>
          <Link to={detailsLink}>
            <Button variant="primary" size="sm">
              View Order Details
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Order Summary
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {orderSummaryItems.map((item) => (
              <div key={item.label} className="text-sm">
                <p className="text-gray-500 text-xs uppercase tracking-wide">
                  {item.label}
                </p>
                <p className="font-semibold text-gray-900 mt-1">
                  {item.value || "—"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {quotes.length
                  ? `Bids For Order #${order.id.slice(0, 5)}`
                  : "No Bids Yet"}
              </h2>
              <p className="text-sm text-gray-500">
                {quotes.length
                  ? `${quotes.length} vendor ${
                      quotes.length === 1 ? "bid" : "bids"
                    } received`
                  : "Vendors have not submitted bids for this order yet."}
              </p>
            </div>
          </div>

          {quotes.length === 0 ? (
            <div className="bg-white border border-dashed rounded-2xl p-6 text-center text-sm text-gray-500">
              Once vendors submit their bids, they will appear here with full
              pricing history.
            </div>
          ) : (
            <>
              <div className="hidden md:block bg-white rounded-2xl shadow border border-gray-200 w-full overflow-x-auto">
                <table className="w-full text-left min-w-[1100px]">
                  <thead>
                    <tr className="text-gray-600 text-sm border-b bg-gray-50">
                      <th className="py-4 px-4 font-semibold">Vendor Name</th>
                      <th className="py-4 px-4 font-semibold">Date / Time</th>
                      <th className="py-4 px-4 font-semibold">Vendor Remarks</th>
                      <th className="py-4 px-4 font-semibold">Bid Amount</th>
                      <th className="py-4 px-4 font-semibold">Markup Amount</th>
                      <th className="py-4 px-4 font-semibold">Status</th>
                      <th className="py-4 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map((quote) => (
                      <tr
                        key={quote.id}
                        className="border-b last:border-none align-top"
                      >
                        <td className="py-5 px-4 text-sm font-medium">
                          {quote.supplier?.name || "Vendor"}
                        </td>
                        <td className="py-5 px-4 text-sm">
                          <div className="flex flex-col">
                            <span>{formatDate(quote.createdAt)}</span>
                            <span className="text-xs text-gray-500">
                              {formatTime(quote.createdAt)}
                            </span>
                          </div>
                        </td>
                        <td className="py-5 px-4 text-sm">
                          {quote.remarks || "—"}
                        </td>
                        <td className="py-5 px-4 text-sm">
                          ₹ {quote.buyPrice ?? "—"}
                          <span className="text-gray-400 text-xs ml-1">
                            (buy price)
                          </span>
                        </td>
                        <td className="py-5 px-4 text-sm">
                          ₹ {quote.sellPrice ?? "—"}
                          <span className="text-gray-400 text-xs ml-1">
                            (excl. GST)
                          </span>
                        </td>
                        <td className="py-5 px-4 text-sm">
                          <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded font-semibold uppercase tracking-wide">
                            {quote.status || "—"}
                          </span>
                        </td>
                        <td className="py-5 px-4 text-sm">
                          {renderQuoteActions(quote)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden flex flex-col gap-4">
                {quotes.map((quote) => (
                  <div
                    key={`card-${quote.id}`}
                    className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {quote.supplier?.name || "Vendor"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(quote.createdAt)}
                          {formatTime(quote.createdAt)
                            ? ` • ${formatTime(quote.createdAt)}`
                            : ""}
                        </p>
                      </div>
                      <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded font-semibold uppercase tracking-wide">
                        {quote.status || "—"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Bid Amount
                        </p>
                        <p className="font-semibold text-gray-900">
                          ₹ {quote.buyPrice ?? "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Markup Amount
                        </p>
                        <p className="font-semibold text-gray-900">
                          ₹ {quote.sellPrice ?? "—"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Vendor Remarks
                        </p>
                        <p className="text-sm text-gray-800">
                          {quote.remarks || "—"}
                        </p>
                      </div>
                    </div>

                    {renderQuoteActions(quote, true)}
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
