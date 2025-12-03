import OrderRow from "./OrderRow";

export default function OrderListTable({ orders = [] }) {
  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 w-full overflow-x-auto">
      <table className="w-full text-left min-w-[1180px]">
        <thead>
          <tr className="text-gray-600 text-sm border-b bg-gray-50">
            <th className="py-4 px-4 font-semibold">Order ID</th>
            <th className="py-4 px-4 font-semibold">Vehicle Number</th>
            <th className="py-4 px-4 font-semibold">Make Model</th>
            <th className="py-4 px-4 font-semibold">Fuel Type</th>
            <th className="py-4 px-4 font-semibold">Part Name</th>
            <th className="py-4 px-4 font-semibold">Customer Name</th>
            <th className="py-4 px-4 font-semibold">Date</th>
            <th className="py-4 px-4 font-semibold">Current Status</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </tbody>
      </table>
    </div>
  );
}