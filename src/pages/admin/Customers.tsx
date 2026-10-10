import { useState } from 'react'
import { Pin, AlertTriangle } from 'lucide-react'
import CustomerDetailsPage from '../../components/admin/customers/CustomerDetailsPage'

import { useCustomers, useCustomerStats } from '../../hooks/useCustomers'
import { exportCustomersToCSV, exportCustomerPhonesToCSV } from '../../utils/exportUtils'

export default function Customers() {
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // States
  const [showGuidelines, setShowGuidelines] = useState(false)
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [searchQuery, setSearchQueryValue] = useState('')
  const [filterChannel, setFilterChannelValue] = useState<'ALL' | 'Web' | 'USSD' | 'Omnichannel'>('ALL')
  const [filterVoucherType, setFilterVoucherTypeValue] = useState<string>('ALL')
  const [activeSegment, setActiveSegmentValue] = useState<'ALL' | 'HIGH_VALUE' | 'REPEAT' | 'ONE_TIME' | 'WEB_ONLY' | 'USSD_ONLY'>('ALL')

  // Narrowing the list puts it back on page 1, or the admin lands past the last page
  const setSearchQuery = (value: string) => {
    setSearchQueryValue(value)
    setCurrentPage(1)
  }
  const setFilterChannel = (value: typeof filterChannel) => {
    setFilterChannelValue(value)
    setCurrentPage(1)
  }
  const setFilterVoucherType = (value: string) => {
    setFilterVoucherTypeValue(value)
    setCurrentPage(1)
  }
  const setActiveSegment = (value: typeof activeSegment) => {
    setActiveSegmentValue(value)
    setCurrentPage(1)
  }

  // Prepare filters for API
  const apiFilters = {
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery || undefined,
    channel: filterChannel !== 'ALL' ? filterChannel : undefined,
    voucherType: filterVoucherType !== 'ALL' ? filterVoucherType : undefined,
    segment: activeSegment !== 'ALL' ? activeSegment : undefined,
  }

  const { data: paginatedData, isLoading: loading, error } = useCustomers(apiFilters)
  const { data: statsData } = useCustomerStats()

  // Selected customer details state (now just phone number)
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState<string | null>(null)
  
  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Send SMS simulator
  const handleSendSMS = (text: string) => {
    if (!text.trim() || !selectedCustomerPhone) return

    setToastMessage(`SMS dispatch initiated for ${selectedCustomerPhone}`)

    // Update status to Delivered after 1.5 seconds
    setTimeout(() => {
      setToastMessage(`SMS successfully sent.`)
    }, 1500)

    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  // Data processing
  const displayedCustomers = paginatedData?.items || []
  const totalPages = paginatedData?.totalPages || 1

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Aggregate Stats Calculations
  const stats = {
    total: statsData?.total || 0,
    webOnly: statsData?.webOnly || 0,
    ussdOnly: statsData?.ussdOnly || 0,
  }

  // Render Full Sub-Page Details View
  if (selectedCustomerPhone) {
    return (
      <CustomerDetailsPage
        phoneNumber={selectedCustomerPhone}
        onBack={() => setSelectedCustomerPhone(null)}
        onSendSMS={handleSendSMS}
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
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading customer profiles...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-2xl flex items-center space-x-3 shadow-sm">
        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
        <p className="text-xs font-semibold">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert message banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-primary border border-accent text-white px-4 py-3 rounded-xl shadow-lg z-50 animate-bounce flex items-center space-x-2 text-xs font-semibold">
          <svg className="w-4 h-4 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Page Title Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-primary p-6 sm:p-8 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(235,197,107,0.15),transparent_60%)]" />
        <div className="z-10 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">Customer Records</h2>
              <p className="text-white/80 text-xs sm:text-sm mt-1.5 font-sans max-w-3xl">
                Unified customer profiles auto-captured at checkout from both the website and USSD channels. No registration required — records are created automatically on first purchase.
              </p>
            </div>
            
            <button
              onClick={() => setShowGuidelines(!showGuidelines)}
              className="mt-4 sm:mt-0 flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer active:scale-95"
            >
              <svg className={`w-4 h-4 transform transition-transform duration-200 ${showGuidelines ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              <span>{showGuidelines ? 'Hide Guidelines' : 'Show Guidelines & Specs'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Key Merge Info callout banner */}
      <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-4 flex items-start space-x-3 shadow-sm">
        <Pin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5 transform -rotate-45" />
        <p className="text-xs font-medium leading-relaxed font-sans">
          <strong>Primary Identifier:</strong> Customers are identified by their phone number as the primary key. If the same phone number places orders on both Web and USSD, they are merged into a single unified <strong>Omnichannel</strong> profile.
        </p>
      </div>

      {/* Expandable Guidelines & Specs (matching image specifications) */}
      {showGuidelines && (
        <div className="space-y-6 bg-gray-50 border border-gray-100 p-6 rounded-2xl animate-fadeIn">
          {/* Customer Profile Data Block */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 select-none">Customer Profile Data</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h5 className="text-xs font-bold text-primary mb-3 uppercase tracking-wide">Core Profile Fields</h5>
                <ul className="space-y-2 text-xs text-gray-600 font-medium">
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Full name (captured at checkout)</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Phone number — primary identifier</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Acquisition channel (Web / USSD)</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> First purchase date & time</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Last purchase date & time</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Account created timestamp</li>
                </ul>
              </div>
              {/* Card 2 */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h5 className="text-xs font-bold text-primary mb-3 uppercase tracking-wide">Purchase Summary</h5>
                <ul className="space-y-2 text-xs text-gray-600 font-medium">
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Total number of orders placed</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Total lifetime spend (GH₵)</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Average order value</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Voucher types purchased</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Most recent order status</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Preferred payment method</li>
                </ul>
              </div>
              {/* Card 3 */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h5 className="text-xs font-bold text-primary mb-3 uppercase tracking-wide">Purchase History View</h5>
                <ul className="space-y-2 text-xs text-gray-600 font-medium">
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Per-order breakdown listed chronologically</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Voucher type and quantity per order</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Payment date, amount, and method</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Delivery confirmation per order</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Order status badge per row</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Downloadable customer history (PDF)</li>
                </ul>
              </div>
              {/* Card 4 */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h5 className="text-xs font-bold text-primary mb-3 uppercase tracking-wide">USSD-Specific Data</h5>
                <ul className="space-y-2 text-xs text-gray-600 font-medium">
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Network used (MTN / Telecel / AirtelTigo)</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> USSD session reference</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Mobile money wallet linked</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> USSD channel purchase count</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Admin Actions & Tools Block */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 select-none">Admin Actions & Tools</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h5 className="text-xs font-bold text-primary mb-3 uppercase tracking-wide">Search & Filter</h5>
                <ul className="space-y-2 text-xs text-gray-600 font-medium">
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Search by name or phone number</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Filter by channel (Web / USSD)</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Filter by voucher type purchased</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Filter by date range</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Filter by spend range</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Filter by order count</li>
                </ul>
              </div>
              {/* Card 2 */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h5 className="text-xs font-bold text-primary mb-3 uppercase tracking-wide">Communication Actions</h5>
                <ul className="space-y-2 text-xs text-gray-600 font-medium">
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Send individual SMS from profile page</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Add customer to a bulk SMS campaign</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Resend any past voucher via SMS</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> View full SMS history for customer</li>
                </ul>
              </div>
              {/* Card 3 */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h5 className="text-xs font-bold text-primary mb-3 uppercase tracking-wide">Export Options</h5>
                <ul className="space-y-2 text-xs text-gray-600 font-medium">
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Export full customer list (CSV / Excel)</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Export filtered subset</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Export phone numbers only (SMS campaigns)</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Export individual customer report (PDF)</li>
                </ul>
              </div>
              {/* Card 4 */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h5 className="text-xs font-bold text-primary mb-3 uppercase tracking-wide">Customer Segmentation</h5>
                <ul className="space-y-2 text-xs text-gray-600 font-medium">
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> High-value customers (top spenders)</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Repeat customers (2+ orders)</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> One-time purchasers</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Channel segments (Web / USSD only)</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Save custom segment as SMS list</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Directory Section Header & Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Captured Profiles</p>
          <p className="text-2xl font-bold text-primary mt-0.5">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Web Captured</p>
          <p className="text-2xl font-bold text-blue-600 mt-0.5">{stats.webOnly}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">USSD Captured</p>
          <p className="text-2xl font-bold text-orange-600 mt-0.5">{stats.ussdOnly}</p>
        </div>
      </div>

      {/* Toolbar: Search, Filters, and Segment Selector tabs */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by customer name or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-gray-400 transition-colors"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Channel filter */}
            <select
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value as typeof filterChannel)}
              className="px-3 py-2 text-xs font-semibold bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer text-gray-600"
            >
              <option value="ALL">Channel: All</option>
              <option value="Web">Web Only</option>
              <option value="USSD">USSD Only</option>
            </select>

            {/* Voucher type filter */}
            <select
              value={filterVoucherType}
              onChange={(e) => setFilterVoucherType(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer text-gray-600"
            >
              <option value="ALL">Voucher Type: All</option>
              <option value="WASSCE_NOVDEC">WASSCE / NOVDEC</option>
              <option value="BECE">BECE</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-200 rounded-xl overflow-hidden p-0.5 bg-gray-50/50">
              <button
                onClick={() => setViewMode('card')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'card' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Card Grid Mode"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Table List Mode"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Segment Selector & Exports Panel */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between border-t border-gray-100 pt-4 gap-4">
          {/* Tabs for customer segments */}
          <div className="flex flex-wrap gap-1.5 bg-gray-50 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveSegment('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSegment === 'ALL' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              All Profiles
            </button>
            <button
              onClick={() => setActiveSegment('HIGH_VALUE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSegment === 'HIGH_VALUE' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
              title="Lifetime spend >= GHS 140"
            >
              Top Spenders (10%)
            </button>
            <button
              onClick={() => setActiveSegment('REPEAT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSegment === 'REPEAT' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Repeat (2+ orders)
            </button>
            <button
              onClick={() => setActiveSegment('ONE_TIME')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSegment === 'ONE_TIME' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              One-Time
            </button>
            <button
              onClick={() => setActiveSegment('WEB_ONLY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSegment === 'WEB_ONLY' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Web-Only
            </button>
            <button
              onClick={() => setActiveSegment('USSD_ONLY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSegment === 'USSD_ONLY' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              USSD-Only
            </button>
          </div>

          {/* Export tools */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => exportCustomersToCSV(displayedCustomers, 'civictree_customers.csv')}
              className="flex items-center space-x-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => exportCustomerPhonesToCSV(displayedCustomers, 'civictree_customer_phones.csv')}
              className="flex items-center space-x-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 transition-colors cursor-pointer"
              title="Export plain text phone list for bulk SMS nodes"
            >
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Export Phones</span>
            </button>
          </div>
        </div>
      </div>

      {/* Directory Grid/Table layout mapping */}
      {displayedCustomers.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center shadow-sm">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-sm font-semibold uppercase text-gray-400 tracking-wider">No customers matching filters</p>
        </div>
      ) : viewMode === 'card' ? (
        /* Card Grid layout (matching "Sample Customer Record" format) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedCustomers.map((cust) => (
            <div
              key={cust.id}
              onClick={() => setSelectedCustomerPhone(cust.phone)}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer relative group flex flex-col justify-between"
            >
              <div>
                {/* Card Header section */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                  <div className="flex items-center space-x-3.5">
                    {/* Avatar Initials circle */}
                    <div className="w-12 h-12 min-w-[48px] min-h-[48px] aspect-square rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base select-none shrink-0 group-hover:scale-105 transition-transform">
                      {cust.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-primary text-base group-hover:text-secondary transition-colors">{cust.name}</h4>
                      <p className="text-gray-400 text-xs font-mono mt-0.5">
                        {cust.phone} &bull; <span className="font-sans font-medium text-[10px] uppercase tracking-wide">{cust.channel} customer</span>
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    cust.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {cust.status}
                  </span>
                </div>

                {/* Card details grids */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 py-4 text-xs font-sans">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Orders</p>
                    <p className="font-bold text-text-primary mt-0.5">{cust.totalOrders} {cust.totalOrders === 1 ? 'order' : 'orders'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lifetime Spend</p>
                    <p className="font-bold text-emerald-600 mt-0.5">GH₵ {cust.lifetimeSpend}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">First Purchase</p>
                    <p className="font-semibold text-gray-500 mt-0.5">{cust.firstPurchase}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Last Purchase</p>
                    <p className="font-semibold text-gray-500 mt-0.5">{cust.lastPurchase}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Preferred Payment</p>
                    <p className="font-semibold text-gray-500 mt-0.5">{cust.preferredPayment}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Voucher Types</p>
                    <p className="font-bold text-primary mt-0.5">{(cust.voucherTypes || []).join(', ')}</p>
                  </div>
                </div>
              </div>

              {/* View Profile Action button */}
              <div className="pt-2 flex justify-end">
                <span className="text-[11px] font-bold text-secondary group-hover:text-primary transition-colors flex items-center space-x-1 uppercase tracking-wider">
                  <span>View Full Profile</span>
                  <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table List Layout */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm font-sans text-text-primary">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-xs font-semibold uppercase border-b border-gray-100">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Primary Phone</th>
                  <th className="px-6 py-4">Channel</th>
                  <th className="px-6 py-4 text-center">Orders</th>
                  <th className="px-6 py-4">Lifetime Spend</th>
                  <th className="px-6 py-4">Last Purchase</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs font-medium">
                {displayedCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 min-w-[32px] min-h-[32px] aspect-square rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {cust.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-bold text-primary text-sm">{cust.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-500">{cust.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                        cust.channel === 'Web' ? 'bg-blue-50 text-blue-700 border-blue-100' : cust.channel === 'USSD' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      }`}>
                        {cust.channel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold">{cust.totalOrders}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">GH₵ {cust.lifetimeSpend}</td>
                    <td className="px-6 py-4 text-gray-500">{cust.lastPurchase}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cust.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {cust.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedCustomerPhone(cust.phone)}
                        className="px-3 py-1.5 text-xs font-semibold text-secondary hover:text-primary bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-lg transition-colors cursor-pointer"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && !selectedCustomerPhone && (
        <div className="flex items-center justify-between bg-white px-6 py-4 border border-gray-100 rounded-2xl shadow-sm mt-4">
          <p className="text-xs text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-900">{displayedCustomers.length}</span> out of <span className="font-bold text-gray-900">{paginatedData?.totalCount || 0}</span> customers
          </p>
          <div className="flex items-center space-x-2 text-sm font-semibold">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-3 text-gray-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Space spacer bottom */}
      <div className="h-2" />
    </div>
  )
}
