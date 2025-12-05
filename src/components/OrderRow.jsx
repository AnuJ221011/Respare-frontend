import { useEffect, useMemo, useState } from "react";
import { statusButtonMap } from "../utils/statusButtonMap";
import Button from "./ui/Button";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function OrderRow({ order, variant = "table" }) {
  const [status, setStatus] = useState(order.status);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [assigningQc, setAssigningQc] = useState(false);
  const [markingDelivered, setMarkingDelivered] = useState(false);
  const [cancelingOrder, setCancelingOrder] = useState(false);
  const baseUrl = import.meta.env.VITE_BACKEND_URL;
  const isCancelable = status === "PENDING" || status === "QUOTED";
  const isCard = variant === "card";

  const normalizedParts = Array.isArray(order.parts)
    ? order.parts
    : typeof order.parts === "string"
    ? (() => {
        try {
          const parsed = JSON.parse(order.parts);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        } catch {
          return order.parts.split(",").map((item) => ({ name: item.trim() }));
        }
        return [];
      })()
    : [];

  const partNames = normalizedParts
    .map((part) =>
      typeof part === "string" ? part : part?.name || part?.partName || ""
    )
    .filter(Boolean)
    .join(", ");

  const partGroupLabel = order.partGroup || "—";
  const partsWithFallback = partNames || "—";
  const partGroupBadge = order.partGroup
    ? `(${order.partGroup.split("_").join(" ")})`
    : "";
  const detailsLink = {
    pathname: `/order/${order.id}`,
    search:
      status !== "PENDING" && status !== "QUOTED" ? "?view=finalQuote" : "",
  };
  const bidsLink = `/admin/order/${order.id}/bids`;


  useEffect(() => {
    setStatus(order.status);
  }, [order.status]);

  const extractDate = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      if (isNaN(d)) return iso.split("T")[0] || iso;
      return d.toLocaleDateString();
    } catch {
      return iso.split("T")[0] || iso;
    }
  };

  const extractTime = (utcString) => {
  if (!utcString) return "";
  return new Date(utcString).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
  });
};


  const displayDate = useMemo(
    () =>
      extractDate(
        order.confirmedAt || order.createdAt || order.updatedAt || order.date
      ),
    [order.confirmedAt, order.createdAt, order.updatedAt, order.date]
  );

  const displayTime = useMemo(
  () =>
    extractTime(
      order.confirmedAt || order.createdAt || order.updatedAt || order.date
    ),
  [order.confirmedAt, order.createdAt, order.updatedAt, order.date]
);


  // Display label mapping for user-friendly status
  const getDisplayStatus = (stat) => {
    switch (stat) {
      case "PENDING":
        return "New Order Request";
      case "QUOTED":
        return "Quoted";
      case "QUOTE_ACCEPTED_BY_CUSTOMER":
        return "Quote Accepted";
      case "CONFIRMED":
        return "Confirmed";
      case "COMPLETED":
        return "Delivered";
      case "CANCELLED":
        return "Cancelled";
      default:
        return stat;
    }
  };

  const markOutForDelivery = async () => {
    if (assigningQc) return;
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to update order status.");
      return;
    }
    try {
      setAssigningQc(true);
      // 1. Update order status
      const orderRes = await fetch(
        `${baseUrl}/api/orders/${order.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "CONFIRMED",
          }),
        }
      );

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.message || "Failed to update order status");
      }


      setStatus("CONFIRMED");
      toast.success("QC is assigned and order is marked as confirmed.");
    } catch (error) {
      toast.error(`Error updating status: ${error.message}`);
    } finally {
      setAssigningQc(false);
    }
  };

  const markDelivered = async () => {
    if (markingDelivered) return;
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to update order status.");
      return;
    }
    try {
      setMarkingDelivered(true);
      // 1. Update order status
      const orderRes = await fetch(
        `${baseUrl}/api/orders/${order.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "COMPLETED",
          }),
        }
      );

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.message || "Failed to update order status");
      }

      setStatus("COMPLETED");
      toast.success("Order is marked as delivered.");
    } catch (error) {
      toast.error(`Error updating status: ${error.message}`);
    } finally {
      setMarkingDelivered(false);
    }
  };

  const primaryAction = (() => {
    if (status === "PENDING") {
      return (
        <Link to={bidsLink} className="inline-block">
          <Button variant="primary" size="sm">
            View Bids
          </Button>
        </Link>
      );
    }
    if (status === "QUOTE_ACCEPTED_BY_CUSTOMER") {
      return (
        <Button
          variant="primary"
          size="sm"
          onClick={markOutForDelivery}
          isLoading={assigningQc}
          disableWhileLoading
        >
          Assign QC
        </Button>
      );
    }
    if (status === "CONFIRMED") {
      return (
        <Button
          variant="primary"
          size="sm"
          onClick={markDelivered}
          isLoading={markingDelivered}
          disableWhileLoading
        >
          Mark Delivered
        </Button>
      );
    }
    if (statusButtonMap[status]) {
      return (
        <Button variant="primary" size="sm">
          {statusButtonMap[status]}
        </Button>
      );
    }
    return null;
  })();

  // Handler to cancel order
  const handleCancelOrder = async () => {
    if (cancelingOrder) return;
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to cancel the order.");
      return;
    }
    try {
      setCancelingOrder(true);
      const res = await fetch(
        `${baseUrl}/api/orders/${order.id}/cancel-admin`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "CANCELLED" }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to cancel order");
      }

      setStatus("CANCELLED");
      setShowCancelConfirm(false); // Hide cancel button after cancelling
      toast.success("Order cancelled successfully.");
    } catch (error) {
      toast.error(`Error cancelling order: ${error.message}`);
    } finally {
      setCancelingOrder(false);
    }
  };

  const renderCancelMenu = () => {
    if (!showCancelConfirm || status === "CANCELLED") return null;
    return (
      <div
        className={`absolute ${
          isCard ? "top-10 right-4" : "top-8 right-0"
        } border border-gray-200 shadow-md rounded bg-white p-2 z-10 w-32 text-center`}
      >
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={handleCancelOrder}
          disabled={!isCancelable || cancelingOrder}
          isLoading={cancelingOrder}
          className="w-full text-xs"
        >
          Cancel Order
        </Button>

        <Link to={bidsLink} className="inline-block">
          <button className="mt-2 text-blue-600 font-semibold cursor-pointer hover:underline text-xs">
            View All Bids
          </button>
        </Link>

        <Link to={detailsLink}>
          <button className="mt-2 text-blue-600 font-semibold cursor-pointer hover:underline text-xs">
            View Details
          </button>
        </Link>
      </div>
    );
  };

  if (isCard) {
    return (
      <div className="relative bg-white rounded-2xl shadow border border-gray-200 p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link
              to={detailsLink}
              className={`text-sm font-semibold text-blue-600 hover:underline ${
                status === "CANCELLED" ? "line-through text-red-500" : ""
              }`}
            >
              #{order.id}
            </Link>
            <p className="text-xs text-gray-500">
              {displayDate || "—"}
              {displayTime ? ` • ${displayTime}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {order.partGroup && (
              <span className="text-[11px] uppercase tracking-wide bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                {order.partGroup.split("_").join(" ")}
              </span>
            )}
            <button
              onClick={() => setShowCancelConfirm((show) => !show)}
              aria-label="Toggle cancel order options"
              className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
            >
              <svg
                className={`w-5 h-5 transition-transform ${
                  showCancelConfirm ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-1 text-sm text-gray-800">
          <p className="font-semibold">{order.customerName}</p>
          <p className="text-xs text-gray-600">
            {order.vehicleMake}, {order.vehicleModel} • {order.vehicleNumber}
          </p>
          <p className="text-xs text-gray-700">
            Parts: {partsWithFallback} {partGroupBadge}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium">{getDisplayStatus(status)}</span>
          <div className="flex-shrink-0">{primaryAction}</div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
          {order.fuelType && <span>{order.fuelType}</span>}
          {order.quantity && <span>Qty: {order.quantity}</span>}
          {order.customerCity && <span>{order.customerCity}</span>}
        </div>

        <div className="flex gap-4 text-xs text-blue-600">
          <Link to={detailsLink} className="font-semibold hover:underline">
            View Details
          </Link>
          <Link to={bidsLink} className="font-semibold hover:underline">
            View Bids
          </Link>
        </div>

        {renderCancelMenu()}
      </div>
    );
  }

  return (
    <tr className="border-b last:border-none align-top relative">
      <td className="py-5 px-4 text-sm">
        <Link
          to={detailsLink}
          className={`text-blue-600 font-semibold cursor-pointer hover:underline ${
            status === "CANCELLED" ? "line-through text-red-500" : ""
          }`}
        >
          #{order.id}
        </Link>
      </td>

      <td className="py-5 px-4 text-sm font-medium">{order.vehicleNumber}</td>

      <td className="py-5 px-4 text-sm whitespace-pre-line">
        {order.vehicleMake},<br />
        {order.vehicleModel}
      </td>

      <td className="py-5 px-4 text-sm">{order.fuelType || "—"}</td>

      <td className="py-5 px-4 text-sm">
        {partsWithFallback}{" "}
        {order.partGroup && (
          <span className="text-xs text-gray-500">{partGroupBadge}</span>
        )}
      </td>

      <td className="py-5 px-4 text-sm uppercase tracking-wide text-gray-700">
        {partGroupLabel}
      </td>

      <td className="py-5 px-4 text-sm">{order.customerName}</td>

      <td className="py-5 px-4 text-sm">
        <div className="flex flex-col">
          <div>{displayDate || "—"}</div>
          <div>{displayTime || ""}</div>
          {order.overdue && (
            <span className="text-red-500 text-xs font-semibold">Overdue</span>
          )}
        </div>
      </td>

      <td className="py-5 px-4 text-sm relative">
        <div className="flex flex-col gap-2 w-44">
          <span className="font-medium leading-tight">
            {getDisplayStatus(status)}
          </span>
          {primaryAction}
        </div>

        <button
          onClick={() => setShowCancelConfirm((show) => !show)}
          aria-label="Toggle cancel order options"
          title="Cancel or delete order"
          className="absolute top-2 right-1 p-1 rounded-full hover:bg-gray-200 focus:outline-none"
        >
          <svg
            className={`w-5 h-5 transition-transform ${
              showCancelConfirm ? "rotate-180" : "rotate-0"
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {renderCancelMenu()}
      </td>
    </tr>
  );
}