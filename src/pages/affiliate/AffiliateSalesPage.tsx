import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAffiliateSales } from '../../hooks/useAffiliates'
import type { AffiliateSale } from '../../types/affiliate'
import { parseSale, STATUS_COLORS } from './saleRow'

type FilterRange = 'ALL' | 'TODAY' | 'WEEK' | 'MONTH'

function filterByDate(sales: AffiliateSale[], range: FilterRange) {
  if (range === 'ALL') return sales
  const now = new Date()
  return sales.filter(s => {
    const { dateObj, isValidDate } = parseSale(s)
    if (!isValidDate || !dateObj) return false
    if (range === 'TODAY') return dateObj.toDateString() === now.toDateString()
    if (range === 'WEEK') return (now.getTime() - dateObj.getTime()) <= 7 * 86400000
    if (range === 'MONTH') return dateObj.getMonth() === now.getMonth() && dateObj.getFullYear() === now.getFullYear()
    return true
  })
}

export default function AffiliateSalesPage() {
  const { data: sales, isLoading } = useAffiliateSales()
  const [range, setRange] = useState<FilterRange>('ALL')
  const [search, setSearch] = useState('')

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 w-full text-[#1a5c18]">
        <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>
    )
  }

  const affiliateSales = Array.isArray(sales) ? sales : []
  const filtered = filterByDate(affiliateSales, range).filter(s => {
    if (!s) return false
    const parsed = parseSale(s)
    const searchLower = search.toLowerCase()
    return (
      parsed.ref.toLowerCase().includes(searchLower) ||
      parsed.voucherType.toLowerCase().includes(searchLower) ||
      parsed.customerDisplay.toLowerCase().includes(searchLower)
    )
  })

  const totalSales = filtered
    .filter(s => parseSale(s).isCompleted)
    .reduce((a, b) => a + parseSale(b).saleAmount, 0)
  const totalComm = filtered
    .filter(s => parseSale(s).isCompleted)
    .reduce((a, b) => a + parseSale(b).commissionEarned, 0)

  return (
    <div className="space-y-6 w-full">
      <Helmet><title>Sales History — Affiliate Portal</title></Helmet>

      <div>
        <h1 className="text-2xl font-serif font-bold text-gray-900">Sales History</h1>
        <p className="text-gray-400 text-sm mt-1">All voucher sales generated through your affiliate USSD channel.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Sales', value: filtered.length, color: 'text-gray-800' },
          { label: 'Sales Value', value: `GHS ${totalSales.toLocaleString()}`, color: 'text-blue-700' },
          { label: 'Commission Earned', value: `GHS ${totalComm.toLocaleString()}`, color: 'text-emerald-700' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium">{c.label}</p>
            <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ref, voucher type or phone..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c18] focus:ring-2 focus:ring-[#1a5c18]/10 transition-all"
          />
          <div className="flex space-x-2 flex-wrap gap-y-2">
            {(['ALL', 'TODAY', 'WEEK', 'MONTH'] as FilterRange[]).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${range === r ? 'bg-[#1a5c18] text-white border-[#1a5c18]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#1a5c18]/40'}`}
              >
                {r === 'ALL' ? 'All Time' : r === 'TODAY' ? 'Today' : r === 'WEEK' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Transaction Ref', 'Date', 'Voucher Type', 'Customer', 'Sale Amount', 'Commission', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <svg className="w-10 h-10 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    <p className="text-sm">No sales found.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((sale, idx) => {
                  const parsed = parseSale(sale)
                  const statusColor = STATUS_COLORS[parsed.displayStatus] || 'bg-gray-100 text-gray-700'

                  return (
                    <tr key={sale.id || parsed.ref || idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-[#1a5c18] font-semibold">{parsed.ref}</td>
                      <td className="px-5 py-4 text-xs text-gray-500">{parsed.dateStr}</td>
                      <td className="px-5 py-4 font-medium text-gray-800">{parsed.voucherType}</td>
                      <td className="px-5 py-4 font-mono text-xs text-gray-500">{parsed.customerDisplay}</td>
                      <td className="px-5 py-4 font-bold text-gray-900">GHS {parsed.saleAmount}</td>
                      <td className="px-5 py-4 font-semibold text-emerald-600">+GHS {parsed.commissionEarned}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColor}`}>
                          {parsed.displayStatus}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
