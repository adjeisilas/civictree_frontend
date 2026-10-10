import { Helmet } from 'react-helmet-async'
import { useAffiliateCommissions, useAffiliateProfile } from '../../hooks/useAffiliates'
import { parseCommission, STATUS_CONFIG, DEFAULT_CFG } from './commissionRow'
import type { CommissionStatus } from '../../types/affiliate'

export default function AffiliateEarningsPage() {
  const { data: currentAffiliate, isLoading: isProfileLoading } = useAffiliateProfile()
  const { data: commissions, isLoading: isCommsLoading } = useAffiliateCommissions()

  if (isProfileLoading || isCommsLoading) {
    return (
      <div className="flex justify-center items-center h-64 w-full text-[#1a5c18]">
        <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>
    )
  }

  if (!currentAffiliate) return null

  const myComms = commissions || []

  const approvedComm = Number(currentAffiliate.approvedCommission ?? 0)
  const withdrawnAmt = Number(currentAffiliate.withdrawnAmount ?? 0)
  const pendingComm = Number(currentAffiliate.pendingCommission ?? 0)
  const availBal = Number(currentAffiliate.availableBalance ?? 0)
  const commRate = Number(currentAffiliate.commissionRate ?? 10)

  const summaryItems = [
    { label: 'Commission Per Sale (Rate)', value: `${commRate}%`, color: 'text-gray-900' },
    { label: 'Total Commission Earned', value: `GHS ${(approvedComm + withdrawnAmt + pendingComm).toLocaleString()}`, color: 'text-gray-900' },
    { label: 'Pending Commission', value: `GHS ${pendingComm.toLocaleString()}`, color: 'text-amber-600' },
    { label: 'Approved Commission', value: `GHS ${approvedComm.toLocaleString()}`, color: 'text-emerald-600' },
    { label: 'Withdrawn Amount', value: `GHS ${withdrawnAmt.toLocaleString()}`, color: 'text-blue-600' },
    { label: 'Withdrawable Balance', value: `GHS ${availBal.toLocaleString()}`, color: 'text-[#1a5c18] font-bold' },
  ]

  // Count by status
  const statusCounts = myComms.reduce<Record<string, number>>((acc, c) => {
    const parsed = parseCommission(c)
    acc[parsed.displayStatus] = (acc[parsed.displayStatus] || 0) + 1
    return acc
  }, {})

  const displayStatuses: CommissionStatus[] = ['Pending', 'Approved', 'Paid', 'Rejected', 'Reversed']

  return (
    <div className="space-y-6 w-full">
      <Helmet><title>Earnings — Affiliate Portal</title></Helmet>

      <div>
        <h1 className="text-2xl font-serif font-bold text-gray-900">Earnings</h1>
        <p className="text-gray-400 text-sm mt-1">Your commission breakdown by status and transaction history.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryItems.map(item => (
          <div key={item.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium">{item.label}</p>
            <p className={`text-xl font-bold mt-1 ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Status Distribution */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-bold text-gray-800 mb-4">Commission Status Distribution</h2>
        <div className="flex flex-wrap gap-3">
          {displayStatuses.map(status => {
            const cfg = STATUS_CONFIG[status] || DEFAULT_CFG
            return (
              <div key={status} className={`flex items-center space-x-2 px-3 py-2 rounded-xl ${cfg.color}`}>
                <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span className="text-xs font-semibold">{cfg.label}</span>
                <span className="text-xs font-bold">({statusCounts[status] ?? 0})</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Commission Log Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">Commission Log</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Date', 'Transaction Ref', 'Voucher Type', 'Sale Amount', 'Commission', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {myComms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No commissions recorded yet.</td>
                </tr>
              ) : myComms.map((c, idx) => {
                const parsed = parseCommission(c)

                return (
                  <tr key={c.id || parsed.ref || idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 text-xs text-gray-500">{parsed.dateStr}</td>
                    <td className="px-5 py-4 font-mono text-xs text-[#1a5c18] font-semibold">{parsed.ref}</td>
                    <td className="px-5 py-4 font-medium text-gray-800">{parsed.voucherType}</td>
                    <td className="px-5 py-4 text-gray-700">GHS {parsed.saleAmount}</td>
                    <td className="px-5 py-4 font-bold text-emerald-600">+GHS {parsed.amount}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${parsed.cfg.color}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${parsed.cfg.dot}`} />
                        <span>{parsed.cfg.label}</span>
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

