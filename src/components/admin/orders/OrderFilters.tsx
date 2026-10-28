import type { DateRangePreset } from '../../../types/admin'
import { VOUCHER_TYPES } from '../../../config/voucherTypes'
import type { ExamType } from '../../../types/admin'

interface OrderFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  filterType: 'ALL' | ExamType
  setFilterType: (type: 'ALL' | ExamType) => void
  filterPayment: 'ALL' | 'Successful' | 'Pending' | 'Failed'
  setFilterPayment: (status: 'ALL' | 'Successful' | 'Pending' | 'Failed') => void
  filterDelivery: 'ALL' | 'Delivered' | 'Failed' | 'Delayed'
  setFilterDelivery: (status: 'ALL' | 'Delivered' | 'Failed' | 'Delayed') => void
  filterChannel?: 'ALL' | 'WEB' | 'USSD'
  setFilterChannel?: (channel: 'ALL' | 'WEB' | 'USSD') => void
  dateRange: DateRangePreset
  setDateRange: (range: DateRangePreset) => void
  startDate: string
  setStartDate: (date: string) => void
  endDate: string
  setEndDate: (date: string) => void
  onResetFilters?: () => void
}

const PRESETS: DateRangePreset[] = [
  'All Time',
  'Today',
  'Yesterday',
  'This Week',
  'Last 7 Days',
  'This Month',
  'Last 30 Days',
  'Custom',
]

export default function OrderFilters({
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  filterPayment,
  setFilterPayment,
  filterDelivery,
  setFilterDelivery,
  filterChannel = 'ALL',
  setFilterChannel,
  dateRange,
  setDateRange,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onResetFilters,
}: OrderFiltersProps) {
  const hasActiveFilters =
    Boolean(searchQuery) ||
    filterType !== 'ALL' ||
    filterPayment !== 'ALL' ||
    filterDelivery !== 'ALL' ||
    filterChannel !== 'ALL' ||
    dateRange !== 'All Time' ||
    Boolean(startDate) ||
    Boolean(endDate)

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4">
      {/* Search Input and Date Presets */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-medium text-text-primary text-xs transition-colors"
          />
          <svg
            className="w-4 h-4 text-gray-400 absolute left-3 top-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Date Presets Pill Group */}
        <div className="flex items-center flex-wrap gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1 text-xs font-semibold text-gray-500">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setDateRange(preset)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                dateRange === preset
                  ? 'bg-white text-primary shadow-xs font-bold border border-gray-200/80'
                  : 'hover:text-text-primary border border-transparent'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range Picker inputs (visible only when 'Custom' preset is selected) */}
      {dateRange === 'Custom' && (
        <div className="p-3.5 bg-gray-50/70 border border-gray-200/70 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs animate-in fade-in duration-150">
          <div className="flex items-center space-x-1.5 text-primary font-bold shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[11px]">Custom Range:</span>
          </div>

          <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
            <div className="flex items-center space-x-1 flex-1">
              <span className="text-gray-400 font-medium text-[11px]">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center space-x-1 flex-1">
              <span className="text-gray-400 font-medium text-[11px]">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {(startDate || endDate) && (
            <button
              type="button"
              onClick={() => {
                setStartDate('')
                setEndDate('')
              }}
              className="text-[11px] font-semibold text-gray-400 hover:text-red-600 transition-colors cursor-pointer shrink-0"
            >
              Clear dates
            </button>
          )}
        </div>
      )}

      {/* Dropdown Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-semibold text-gray-600">
        {/* Exam Type select */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400">Exam Category</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'ALL' | ExamType)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary bg-white text-gray-700 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {VOUCHER_TYPES.map((v) => (
              <option key={v.type} value={v.type}>{v.displayName}</option>
            ))}
          </select>
        </div>

        {/* Channel select */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400">Purchase Channel</label>
          <select
            value={filterChannel}
            onChange={(e) => setFilterChannel?.(e.target.value as 'ALL' | 'WEB' | 'USSD')}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary bg-white text-gray-700 cursor-pointer"
          >
            <option value="ALL">All Channels</option>
            <option value="WEB">Web Direct</option>
            <option value="USSD">USSD (*123#)</option>
          </select>
        </div>

        {/* Payment Status select */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400">Payment Status</label>
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value as 'ALL' | 'Successful' | 'Pending' | 'Failed')}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary bg-white text-gray-700 cursor-pointer"
          >
            <option value="ALL">All Payments</option>
            <option value="Successful">Successful (SUCCESS)</option>
            <option value="Pending">Pending (PENDING)</option>
            <option value="Failed">Failed (FAILED)</option>
          </select>
        </div>

        {/* Delivery Status select */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400">SMS Delivery Status</label>
          <select
            value={filterDelivery}
            onChange={(e) => setFilterDelivery(e.target.value as 'ALL' | 'Delivered' | 'Failed' | 'Delayed')}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary bg-white text-gray-700 cursor-pointer"
          >
            <option value="ALL">All Deliveries</option>
            <option value="Delivered">Delivered Keys (SENT)</option>
            <option value="Delayed">Delayed / Not Sent (NOT_SENT)</option>
            <option value="Failed">Failed Delivery (FAILED)</option>
          </select>
        </div>
      </div>

      {/* Reset filters row */}
      {hasActiveFilters && onResetFilters && (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onResetFilters}
            className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline transition-all cursor-pointer inline-flex items-center space-x-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Reset all filters</span>
          </button>
        </div>
      )}
    </div>
  )
}

