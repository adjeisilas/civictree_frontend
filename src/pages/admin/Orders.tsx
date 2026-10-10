import { useState, useMemo } from 'react'
import OrderFilters from '../../components/admin/orders/OrderFilters'
import OrderDetailsPage from '../../components/admin/orders/OrderDetailsPage'
import type { Order, DateRangePreset } from '../../types/admin'
import { useOrders, useOrderStats, useResendSms, useReallocateKey, useProcessRefund } from '../../hooks/useOrders'
import type { OrderFilters as ApiOrderFilters } from '../../types/admin'

export default function Orders() {
  // Select active order for details view
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Filters state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'ALL' | 'WASSCE_NOVDEC' | 'BECE'>('ALL')
  const [filterChannel, setFilterChannel] = useState<'ALL' | 'WEB' | 'USSD'>('ALL')
  const [filterPayment, setFilterPayment] = useState<'ALL' | 'Successful' | 'Pending' | 'Failed'>('ALL')
  const [filterDelivery, setFilterDelivery] = useState<'ALL' | 'Delivered' | 'Failed' | 'Delayed'>('ALL')
  const [dateRange, setDateRange] = useState<DateRangePreset>('All Time')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Convert to API filter object (memoized to prevent infinite query loops)
  const apiFilters: ApiOrderFilters = useMemo(() => {
    const filters: ApiOrderFilters = {
      page: currentPage,
      limit: itemsPerPage,
      q: searchQuery || undefined,
      search: searchQuery || undefined,
      voucherType: filterType !== 'ALL' ? filterType : undefined,
      channel: filterChannel !== 'ALL' ? filterChannel : undefined,
      paymentStatus:
        filterPayment !== 'ALL'
          ? filterPayment === 'Successful'
            ? 'SUCCESS'
            : filterPayment === 'Pending'
            ? 'PENDING'
            : 'FAILED'
          : undefined,
      deliveryStatus:
        filterDelivery !== 'ALL'
          ? filterDelivery === 'Delivered'
            ? 'SENT'
            : filterDelivery === 'Delayed'
            ? 'NOT_SENT'
            : 'FAILED'
          : undefined,
    }

    if (dateRange === 'Custom') {
      if (startDate) filters.startDate = startDate
      if (endDate) filters.endDate = endDate
    } else if (dateRange !== 'All Time') {
      filters.dateRange = dateRange
    }

    return filters
  }, [
    dateRange,
    startDate,
    endDate,
    currentPage,
    itemsPerPage,
    searchQuery,
    filterType,
    filterChannel,
    filterPayment,
    filterDelivery,
  ])

  const { data: paginatedData, isLoading: loading, error } = useOrders(apiFilters)
  const { data: orderStats } = useOrderStats()
  const orders = paginatedData?.items || []

  const { mutate: resendSms } = useResendSms()
  const { mutate: reallocateKey } = useReallocateKey()
  const { mutate: processRefund } = useProcessRefund()

  // Handlers that reset page to 1 on filter changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleFilterTypeChange = (type: 'ALL' | 'WASSCE_NOVDEC' | 'BECE') => {
    setFilterType(type)
    setCurrentPage(1)
  }

  const handleFilterChannelChange = (channel: 'ALL' | 'WEB' | 'USSD') => {
    setFilterChannel(channel)
    setCurrentPage(1)
  }

  const handleFilterPaymentChange = (status: 'ALL' | 'Successful' | 'Pending' | 'Failed') => {
    setFilterPayment(status)
    setCurrentPage(1)
  }

  const handleFilterDeliveryChange = (status: 'ALL' | 'Delivered' | 'Failed' | 'Delayed') => {
    setFilterDelivery(status)
    setCurrentPage(1)
  }

  const handleDateRangeChange = (range: DateRangePreset) => {
    setDateRange(range)
    if (range !== 'Custom') {
      setStartDate('')
      setEndDate('')
    }
    setCurrentPage(1)
  }

  const handleStartDateChange = (date: string) => {
    setStartDate(date)
    setCurrentPage(1)
  }

  const handleEndDateChange = (date: string) => {
    setEndDate(date)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setFilterType('ALL')
    setFilterChannel('ALL')
    setFilterPayment('ALL')
    setFilterDelivery('ALL')
    setDateRange('All Time')
    setStartDate('')
    setEndDate('')
    setCurrentPage(1)
  }

  // Resend SMS Voucher keys handler
  const handleResendSMS = (orderId: string) => {
    resendSms(orderId)
    // Optimistic UI update if detailed view is open
    setSelectedOrder((prev) =>
      prev && prev.id === orderId ? { ...prev, deliveryStatus: 'Sent', smsRetryAttempts: (prev.smsRetryAttempts || 0) + 1 } : prev
    )
  }

  // Reallocate new checker key to order
  const handleReallocateKey = (orderId: string) => {
    reallocateKey(orderId)
  }

  // Process Refund and mark order void/failed
  const handleProcessRefund = (orderId: string, refundDetails: { method: string; reason: string; notes: string }) => {
    processRefund({ orderId, refundDetails })
    setSelectedOrder((prev) =>
      prev && prev.id === orderId
        ? { ...prev, paymentStatus: 'Failed', deliveryStatus: 'Not sent' }
        : prev
    )
  }

  const paginatedOrders = orders
  const totalPages = paginatedData?.totalPages || 1
  const totalCount = paginatedData?.totalCount || 0

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Aggregate stats counters
  const rev = orderStats?.summary?.totalRevenue || 0
  const sold = orderStats?.summary?.totalVouchersSold || 0

  const getPaymentBadge = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'Paid':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase">Paid</span>
      case 'Pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase">Pending</span>
      case 'Failed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-100 uppercase">Failed</span>
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-gray-50 text-gray-700 border border-gray-100 uppercase">{status}</span>
    }
  }

  const getDeliveryBadge = (status: Order['deliveryStatus']) => {
    switch (status) {
      case 'Sent':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase">Sent</span>
      case 'Pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase">Pending</span>
      case 'Not sent':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-100 uppercase">Not sent</span>
    }
  }

  // Render Full Sub-Page Details View
  if (selectedOrder) {
    return (
      <OrderDetailsPage
        order={selectedOrder}
        onBack={() => setSelectedOrder(null)}
        onResendSMS={handleResendSMS}
        onReallocateKey={handleReallocateKey}
        onProcessRefund={handleProcessRefund}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-3">
        <svg className="w-10 h-10 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading orders log...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-2xl flex items-center space-x-3 shadow-sm">
        <span className="text-xl">⚠️</span>
        <p className="text-xs font-semibold">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Title Header banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-primary p-6 sm:p-8 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(235,197,107,0.15),transparent_60%)]" />
        <div className="z-10">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight font-serif">Order Management</h2>
          <p className="text-white/80 text-xs sm:text-sm mt-1.5 font-sans">
            Complete visibility and control over every transaction placed via the website or USSD channel, with full filtering, search, and admin action capabilities.
          </p>
        </div>
      </div>

      {/* Aggregate Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Revenue & Volume */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-t-4 border-t-blue-500 hover:shadow-md transition-shadow flex flex-col justify-between">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Revenue & Volume</p>
          <div className="space-y-2 flex-grow">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50"><span className="text-[11px] font-bold text-gray-400">Total Revenue</span><span className="font-bold text-blue-600 text-sm">GHC {rev.toLocaleString()}</span></div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-50"><span className="text-[11px] font-bold text-gray-400">Vouchers Sold</span><span className="font-bold text-gray-700 text-sm">{sold.toLocaleString()}</span></div>
            <div className="flex justify-between items-center"><span className="text-[11px] font-bold text-gray-400">Orders Placed</span><span className="font-bold text-gray-700 text-sm">{orderStats?.summary?.totalOrders?.toLocaleString() || 0}</span></div>
          </div>
        </div>

        {/* Card 2: Order Statuses */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-t-4 border-t-emerald-500 hover:shadow-md transition-shadow flex flex-col justify-between">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Payment Statuses</p>
          <div className="space-y-2 flex-grow">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50"><span className="text-[11px] font-bold text-gray-400">Successful</span><span className="font-bold text-emerald-600 text-sm">{orderStats?.summary?.totalOrdersSuccessful?.toLocaleString() || 0}</span></div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-50"><span className="text-[11px] font-bold text-gray-400">Pending</span><span className="font-bold text-amber-500 text-sm">{orderStats?.summary?.totalOrdersPending?.toLocaleString() || 0}</span></div>
            <div className="flex justify-between items-center"><span className="text-[11px] font-bold text-gray-400">Failed</span><span className="font-bold text-red-500 text-sm">{orderStats?.summary?.totalOrdersFailed?.toLocaleString() || 0}</span></div>
          </div>
        </div>

        {/* Card 3: Breakdown (Voucher / Channel) */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-t-4 border-t-purple-500 hover:shadow-md transition-shadow flex flex-col justify-between">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Sales Breakdown</p>
          <div className="grid grid-cols-2 gap-4 flex-grow">
            <div className="space-y-1.5 border-r border-gray-50 pr-2">
              <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-gray-400">WASSCE/NOVDEC</span><span className="font-bold text-gray-700 text-xs">{(((orderStats?.byVoucherType as Record<string, number | undefined>)?.WASSCE_NOVDEC || 0) + ((orderStats?.byVoucherType as Record<string, number | undefined>)?.WASSCE || 0) + ((orderStats?.byVoucherType as Record<string, number | undefined>)?.NOVDEC || 0)).toLocaleString()}</span></div>
              <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-gray-400">BECE</span><span className="font-bold text-gray-700 text-xs">{orderStats?.byVoucherType?.BECE?.toLocaleString() || 0}</span></div>
            </div>
            <div className="space-y-1.5 pl-1">
              <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-gray-400">Web</span><span className="font-bold text-blue-600 text-xs">{orderStats?.byChannel?.WEB?.toLocaleString() || 0}</span></div>
              <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-gray-400">USSD</span><span className="font-bold text-orange-600 text-xs">{orderStats?.byChannel?.USSD?.toLocaleString() || 0}</span></div>
            </div>
          </div>
        </div>

        {/* Card 4: Delivery Status */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-t-4 border-t-amber-500 hover:shadow-md transition-shadow flex flex-col justify-between">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Delivery Rates</p>
          <div className="space-y-2 flex-grow">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50"><span className="text-[11px] font-bold text-gray-400">Sent (Delivered)</span><span className="font-bold text-emerald-600 text-sm">{orderStats?.deliverySuccessRate?.SENT?.toLocaleString() || 0}</span></div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-50"><span className="text-[11px] font-bold text-gray-400">Failed Delivery</span><span className="font-bold text-red-500 text-sm">{orderStats?.deliverySuccessRate?.FAILED?.toLocaleString() || 0}</span></div>
            <div className="flex justify-between items-center"><span className="text-[11px] font-bold text-gray-400">Not Sent</span><span className="font-bold text-gray-500 text-sm">{orderStats?.deliverySuccessRate?.NOT_SENT?.toLocaleString() || 0}</span></div>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      <OrderFilters
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
        filterType={filterType}
        setFilterType={handleFilterTypeChange}
        filterChannel={filterChannel}
        setFilterChannel={handleFilterChannelChange}
        filterPayment={filterPayment}
        setFilterPayment={handleFilterPaymentChange}
        filterDelivery={filterDelivery}
        setFilterDelivery={handleFilterDeliveryChange}
        dateRange={dateRange}
        setDateRange={handleDateRangeChange}
        startDate={startDate}
        setStartDate={handleStartDateChange}
        endDate={endDate}
        setEndDate={handleEndDateChange}
        onResetFilters={handleResetFilters}
      />

      {/* Table grid portal */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="p-6 flex justify-between items-center border-b border-gray-50 bg-[#FCFDFB]">
          <h3 className="font-serif font-bold text-primary text-base">All Orders</h3>
          <span className="text-xs font-bold text-amber-800 bg-accent/20 border border-accent/25 px-2.5 py-0.5 rounded-full select-none">
            {totalCount.toLocaleString()} total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm font-sans text-text-primary">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-xs font-semibold uppercase border-b border-gray-50">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Channel</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Delivery</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs font-medium">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-10 text-gray-400 font-semibold uppercase tracking-wider">
                    No orders found matching the filter criteria
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-primary font-mono">{item.id}</td>
                    <td className="px-6 py-4 font-semibold text-text-primary">{item.customerName}</td>
                    <td className="px-6 py-4 font-mono text-gray-400">{item.phone}</td>
                    <td className="px-6 py-4 font-bold text-gray-500">{item.voucherType}</td>
                    <td className="px-6 py-4 text-gray-500">{item.quantity}</td>
                    <td className="px-6 py-4 font-bold">GHC {(Number(item.amount) || 0).toFixed(0)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                        item.channel === 'Web' 
                          ? 'bg-blue-50 text-blue-700 border-blue-100' 
                          : 'bg-orange-50 text-orange-700 border-orange-100'
                      }`}>
                        {item.channel}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getPaymentBadge(item.paymentStatus)}</td>
                    <td className="px-6 py-4">{getDeliveryBadge(item.deliveryStatus)}</td>
                    <td className="px-6 py-4 text-gray-400 font-semibold">{item.date}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(item)}
                        className="px-3 py-1.5 text-xs font-semibold text-secondary hover:text-primary bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-lg transition-colors cursor-pointer"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between text-xs font-semibold select-none">
            <span className="text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer bg-white"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer bg-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
