
import type { Order } from '../../../types/admin'

interface RecentOrdersTableProps {
  orders: Order[]
}

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const getPaymentStatusBadge = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'Paid':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">Paid</span>
      case 'Pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">Pending</span>
      case 'Failed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">Failed</span>
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-100">{status}</span>
    }
  }

  const getDeliveryStatusBadge = (status: Order['deliveryStatus']) => {
    switch (status) {
      case 'Sent':
        return (
          <span className="flex items-center text-xs font-medium text-gray-700">
            <span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5" />
            Sent
          </span>
        )
      case 'Pending':
        return (
          <span className="flex items-center text-xs font-medium text-gray-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
            Pending
          </span>
        )
      case 'Not sent':
        return (
          <span className="flex items-center text-xs font-medium text-gray-700">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" />
            Not sent
          </span>
        )
      default:
        return <span>{status}</span>
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-50">
        <div>
          <h3 className="font-heading font-bold text-primary text-lg">Incoming Orders</h3>
          <p className="text-xs text-gray-400">Recent transactions across Web and USSD portals</p>
        </div>
        <button className="mt-3 sm:mt-0 px-3.5 py-1.5 text-xs font-semibold text-secondary hover:text-primary bg-[#F8FAF8] border border-gray-100 rounded-xl transition-colors cursor-pointer">
          View All Orders
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm font-sans text-text-primary">
          <thead>
            <tr className="bg-gray-50/50 text-gray-400 text-xs font-semibold uppercase border-b border-gray-50">
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Qty</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Payment</th>
              <th className="px-6 py-4">Delivery</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50/40 transition-colors">
                <td className="px-6 py-4 font-semibold text-primary">{order.id}</td>
                <td className="px-6 py-4">
                  <div className="font-medium text-text-primary">{order.customerName}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{order.phone}</div>
                </td>
                <td className="px-6 py-4 font-semibold text-gray-500">{order.voucherType}</td>
                <td className="px-6 py-4">{order.quantity}</td>
                <td className="px-6 py-4 font-semibold">GHS {(Number(order.amount) || 0).toFixed(2)}</td>
                <td className="px-6 py-4">{getPaymentStatusBadge(order.paymentStatus)}</td>
                <td className="px-6 py-4">{getDeliveryStatusBadge(order.deliveryStatus)}</td>
                <td className="px-6 py-4 text-xs text-gray-400 font-semibold">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
