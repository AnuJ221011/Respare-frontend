import OrderRow from "./OrderRow";

export default function OrderListTable({ orders = [] }) {
  console.log("Order Length:", orders.length);
  if (!orders.length) {
    return (
      <div className="bg-white rounded-xl shadow border border-gray-200 w-full p-6 text-center text-sm text-gray-500">
        No orders found yet.
      </div>
    );
  }

  console.log("Rendering OrderListTable with orders:", orders);

  return (
    <div className="space-y-4">
      <div className="hidden md:block bg-white rounded-xl shadow border border-gray-200 w-full overflow-x-auto">
        <table className="w-full text-left min-w-[1280px]">
          <thead>
            <tr className="text-gray-600 text-sm border-b bg-gray-50">
              <th className="py-4 px-4 font-semibold">Order ID</th>
              <th className="py-4 px-4 font-semibold">Vehicle Number</th>
              <th className="py-4 px-4 font-semibold">Make Model</th>
              <th className="py-4 px-4 font-semibold">Fuel Type</th>
              <th className="py-4 px-4 font-semibold">Part Name</th>
              <th className="py-4 px-4 font-semibold">Part Group</th>
              <th className="py-4 px-4 font-semibold">Customer Name</th>
              <th className="py-4 px-4 font-semibold">Date</th>
              <th className="py-4 px-4 font-semibold">Current Status</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} variant="table" />
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden flex flex-col gap-3">
        {orders.map((order) => (
          <OrderRow key={`${order.id}-card`} order={order} variant="card" />
        ))}
      </div>
    </div>
  );
}