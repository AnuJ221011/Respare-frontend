import { useState, useEffect, useCallback, useMemo } from "react";
import Loader from "../components/ui/Loader";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import OrderCard from "../components/OrderDetails/OrderCard";
import FinalQuotePreview from "../components/OrderDetails/FinalQuotePreview";
import BidListCard from "../components/OrderDetails/BidListCard";

const baseUrl = import.meta.env.VITE_BACKEND_URL;
const BID_ELIGIBLE_STATUSES = new Set(["PENDING", "QUOTED"]);
const QUOTE_ELIGIBLE_STATUSES = new Set([
  "QUOTE_ACCEPTED_BY_CUSTOMER",
  "CONFIRMED",
  "COMPLETED",
]);
const ACCEPTED_QUOTE_STATUSES = new Set([
  "ACCEPTED_BY_CUSTOMER",
  "APPROVED_BY_ADMIN",
]);

export default function OrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [bids, setBids] = useState([]);
  const [quote, setQuote] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [loadingBids, setLoadingBids] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [errorOrder, setErrorOrder] = useState(null);
  const [errorBids, setErrorBids] = useState(null);
  const [quoteError, setQuoteError] = useState(null);

  const shouldShowBidList = useMemo(
    () => (order ? BID_ELIGIBLE_STATUSES.has(order.status) : false),
    [order]
  );

  const shouldShowFinalQuote = useMemo(
    () => (order ? QUOTE_ELIGIBLE_STATUSES.has(order.status) : false),
    [order]
  );

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    try {
      setLoadingOrder(true);
      setErrorOrder(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${baseUrl}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to fetch order");
      }
      const data = await res.json();
      const normalized = data.order || data;
      setOrder(normalized);
    } catch (err) {
      console.error("Error fetching order:", err);
      setErrorOrder(err.message || "Unknown error");
      setOrder(null);
    } finally {
      setLoadingOrder(false);
    }
  }, [id]);

  const patchOrderStatus = useCallback(
    async (newStatus) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");
        const res = await fetch(`${baseUrl}/api/orders/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            errData.message || `Failed to update order status to ${newStatus}`
          );
        }
        const updatedOrder = await res.json();
        const normalized = updatedOrder.order || updatedOrder;
        setOrder(normalized);
        return normalized;
      } catch (err) {
        console.error(`Failed to patch order status to ${newStatus}`, err);
        throw err;
      }
    },
    [id]
  );

  const fetchBids = useCallback(
    async (currentStatus) => {
      if (!id || !shouldShowBidList) return;
      try {
        setLoadingBids(true);
        setErrorBids(null);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");
        const res = await fetch(`${baseUrl}/api/quotes/order/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || "Failed to fetch bids");
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setBids(data);
          if (currentStatus === "PENDING" && data.length > 0) {
            await patchOrderStatus("QUOTED");
          }
          const hasAccepted = data.some((q) =>
            ACCEPTED_QUOTE_STATUSES.has(q.status)
          );
          if (hasAccepted && currentStatus !== "QUOTE_ACCEPTED_BY_CUSTOMER") {
            await patchOrderStatus("QUOTE_ACCEPTED_BY_CUSTOMER");
          }
        } else {
          setBids([]);
          setErrorBids(data?.message || "No bids available");
        }
      } catch (err) {
        console.error("Error fetching bids:", err);
        setErrorBids(err.message || "Failed to load bids");
        setBids([]);
      } finally {
        setLoadingBids(false);
      }
    },
    [id, patchOrderStatus, shouldShowBidList]
  );

  const fetchAcceptedQuote = useCallback(async () => {
    if (!id || !shouldShowFinalQuote) {
      setQuote(null);
      setQuoteError(null);
      setLoadingQuote(false);
      return;
    }
    try {
      setLoadingQuote(true);
      setQuoteError(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${baseUrl}/api/quotes/admin/order/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to fetch quotes");
      }
      const data = await res.json();
      let acceptedQuote = null;
      if (Array.isArray(data?.quotes)) {
        acceptedQuote = data.quotes.find((q) =>
          ACCEPTED_QUOTE_STATUSES.has(q.status)
        );
      }
      if (!acceptedQuote) {
        setQuote(null);
        setQuoteError("No accepted quote found");
        return;
      }
      setQuote(acceptedQuote);
    } catch (err) {
      console.error("Error fetching accepted quote:", err);
      setQuote(null);
      setQuoteError(err.message || "Failed to load quote");
    } finally {
      setLoadingQuote(false);
    }
  }, [id, shouldShowFinalQuote]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    if (!order || !shouldShowBidList) {
      setBids([]);
      setLoadingBids(false);
      setErrorBids(null);
      return;
    }
    fetchBids(order.status);
  }, [order?.id, order?.status, fetchBids, shouldShowBidList]);

  useEffect(() => {
    fetchAcceptedQuote();
  }, [fetchAcceptedQuote]);

  const handleAssignQC = async () => {
    try {
      const token = localStorage.getItem("token");
      const acceptedQuoteId =
        quote?.id ||
        bids.find((q) => ACCEPTED_QUOTE_STATUSES.has(q.status))?.id;

      if (!acceptedQuoteId) {
        toast.error("No accepted quote found to approve.");
        return;
      }

      const approveRes = await fetch(
        `${baseUrl}/api/quotes/${acceptedQuoteId}/approve`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!approveRes.ok) {
        const errData = await approveRes.json().catch(() => ({}));
        throw new Error(errData.message || "Quote approval failed");
      }

      await patchOrderStatus("CONFIRMED");
      toast.success("QC assigned, quote approved & order confirmed!");
      await fetchAcceptedQuote();
    } catch (err) {
      toast.error(err.message || "QC assignment failed.");
    }
  };

  const handleAddBid = async (formData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not authenticated. Please login.");
        return;
      }
      const res = await fetch(`${baseUrl}/api/quotes`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        let errorMessage = "Failed to add bid";
        try {
          const errData = await res.json();
          if (errData.message) errorMessage = errData.message;
        } catch {
          /* ignore */
        }
        throw new Error(errorMessage);
      }

      toast.success("New bid added successfully!");
      await fetchBids(order?.status || "PENDING");
    } catch (err) {
      console.error("Add Bid error:", err);
      toast.error(err.message || "Adding bid failed");
    }
  };

  const handleEditBid = async (updatedBid) => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        buyPrice: parseFloat(updatedBid.buyPrice),
        sellPrice: parseFloat(updatedBid.sellPrice),
        remarks: updatedBid.remarks,
        notifyLowerBids: updatedBid.notifyLowerBids,
      };
      const res = await fetch(`${baseUrl}/api/quotes/${updatedBid.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to edit bid");
      }
      toast.success("Bid updated successfully!");
      await fetchBids(order?.status || "PENDING");
    } catch (err) {
      toast.error(err.message || "Edit bid failed");
    }
  };

  const handleDeleteBid = async (bidId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this bid? This action cannot be undone."
      )
    )
      return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseUrl}/api/quotes/${bidId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to delete bid");
      }
      toast.success("Bid deleted successfully!");
      await fetchBids(order?.status || "PENDING");
    } catch (err) {
      toast.error(err.message || "Delete bid failed");
    }
  };

  const handleAdminCancelBid = async (bidId, adminRemarks) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseUrl}/api/quotes/${bidId}/admin/cancel`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adminRemarks }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to cancel bid");
      }
      toast.success("Bid cancelled successfully!");
      await fetchBids(order?.status || "PENDING");
    } catch (err) {
      toast.error(err.message || "Cancel bid failed");
    }
  };

  if (loadingOrder) return <Loader message="Loading order details..." />;
  if (errorOrder)
    return (
      <div className="text-red-600">Error loading order: {errorOrder}</div>
    );

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
      <button
        onClick={() => navigate("/orderList")}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 font-medium mb-4 cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Orders
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {order && <OrderCard order={order} onOrderUpdated={setOrder} />}

        {shouldShowBidList && (
          <BidListCard
            orderId={order.id}
            bids={bids}
            canAdminCancel={true}
            onAddBid={handleAddBid}
            onEditBid={handleEditBid}
            onDeleteBid={handleDeleteBid}
            onAdminCancelBid={handleAdminCancelBid}
            isLoading={loadingBids}
            error={errorBids}
          />
        )}

        {shouldShowFinalQuote && (
          <FinalQuotePreview
            order={order}
            quote={quote}
            isLoading={loadingQuote}
            error={quoteError}
            onAssignQC={handleAssignQC}
            onOrderCompleted={fetchOrder}
            onQuoteUpdated={setQuote}
            onQuoteRefresh={fetchAcceptedQuote}
          />
        )}
      </div>
    </div>
  );
}