import { useEffect, useMemo, useState } from "react";
import { statusButtonMap } from "../utils/statusButtonMap";
import Button from "./ui/Button";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function OrderRow({ order }) {
  const [status, setStatus] = useState(order.status);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [assigningQc, setAssigningQc] = useState(false);
  const [markingDelivered, setMarkingDelivered] = useState(false);
  const [cancelingOrder, setCancelingOrder] = useState(false);
  const baseUrl = import.meta.env.VITE_BACKEND_URL;
  const isCancelable = status === "PENDING" || status === "QUOTED";


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

  console.log("Order", order, "Status:", status);

  return (
    <tr className="border-b last:border-none align-top relative">
      {/* Order ID with special link when IN_PROGRESS */}
      <td className="py-5 px-4 text-sm">
        <Link
          to={{
            pathname: `/order/${order.id}`,
            search: status !== "PENDING" && status !== "QUOTED" ? "?view=finalQuote" : "",
          }}
          className={`text-blue-600 font-semibold cursor-pointer hover:underline ${
            status === "CANCELLED" ? "line-through text-red-500" : ""
          }`}
        >
          #{order.id}
        </Link>
      </td>

      {/* Vehicle Number */}
      <td className="py-5 px-4 text-sm font-medium">{order.vehicleNumber}</td>

      {/* Make Model */}
      <td className="py-5 px-4 text-sm whitespace-pre-line">{order.vehicleMake},<br />{order.vehicleModel}</td>

      {/* Fuel Type */}
      <td className="py-5 px-4 text-sm">{order.fuelType || "—"}</td>

      {/* Part Name */}
      <td className="py-5 px-4 text-sm">{order.parts?.map(p => p.name).join(", ")}</td>

      {/* Customer Name */}
      <td className="py-5 px-4 text-sm">{order.customerName}</td>

      {/* Date + Overdue */}
      <td className="py-5 px-4 text-sm">
        <div className="flex flex-col">
          <div>{displayDate || "—"}</div>
          <div>{displayTime || ""}</div>
          {order.overdue && (
            <span className="text-red-500 text-xs font-semibold">Overdue</span>
          )}
        </div>
      </td>

      {/* Status + Button */}
      <td className="py-5 px-4 text-sm relative">
        <div className="flex flex-col gap-2 w-40">
          <span className="font-medium leading-tight">{getDisplayStatus(status)}</span>

          {status === "PENDING" ? (
            <Link to={`/admin/order/${order.id}/bids`} className="inline-block">
              <Button variant="primary" size="sm">
                View Bids
              </Button>
            </Link>
          ) : status === "QUOTE_ACCEPTED_BY_CUSTOMER" ? (
            <Button
              variant="primary"
              size="sm"
              onClick={markOutForDelivery}
              isLoading={assigningQc}
              disableWhileLoading
            >
              Assign QC
            </Button>
          ) : status === "CONFIRMED" ? (
            <Button
              variant="primary"
              size="sm"
              onClick={markDelivered}
              isLoading={markingDelivered}
              disableWhileLoading
            >
              Mark Delivered
            </Button>
          ) : ( 
            statusButtonMap[status] && (
              <Button children={statusButtonMap[status]} variant="primary" size="sm" />
            )
          )}
        </div>

        {/* Arrow icon for cancel */}
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

        {showCancelConfirm && status !== "CANCELLED" && (
          <div className="absolute top-8 right-0 border border-gray-200 shadow-md rounded bg-white p-2 z-10 w-32 text-center">
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


            <Link to={`/admin/order/${order.id}/bids`} className="inline-block">
              <button className="mt-2 text-blue-600 font-semibold cursor-pointer hover:underline">
                View All Bids
              </button>
            </Link>

            <Link
              to={{
                pathname: `/order/${order.id}`,
                search: status !== "PENDING" && status !== "QUOTED" ? "?view=finalQuote" : "",
              }}
              
            >
              <button className="mt-2 text-blue-600 font-semibold cursor-pointer hover:underline">
                View Details
              </button>
            </Link>

          </div>
        )}


        {/* Delete arrow button */}
        {/* <button
          onClick={() => setShowDeleteConfirm((show) => !show)}
          aria-label="Toggle order delete options"
          title="Toggle order delete options"
          className="absolute top-2 right-1 p-1 rounded-full hover:bg-gray-200 focus:outline-none"
        >
          {/* Arrow icon (simple chevron down/up toggle) 
          <svg
            className={`w-5 h-5 transition-transform ${
              showDeleteConfirm ? "rotate-180" : "rotate-0"
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button> 

        {showDeleteConfirm && (
          <div className="absolute top-8 right-0 border border-white rounded shadow-md p-2 z-10 w-28 text-center cursor-pointer bg-red-400">
            <button
              type="button"
              onClick={handleDeleteOrder}
              className="text-white font-semibold cursor-pointer"
            >
              Delete Order
            </button>
          </div>
        )}
        */}
      </td>
    </tr>
  );
}