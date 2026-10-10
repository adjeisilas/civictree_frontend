import { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { apiErrorMessage } from '../../utils/apiError'
import { useNavigate } from 'react-router-dom'
import {
  usePartnerDashboard,
  usePartnerReports,
  useRequestPartnerPayout,
} from '../../hooks/usePartner'
import type { PeriodType } from '../../types/partner'

export default function PartnerDashboard() {
  const navigate = useNavigate()
  const { data: stats, isLoading: isStatsLoading } = usePartnerDashboard()
  const [activePeriod, setActivePeriod] = useState<PeriodType>('monthly')
  const { data: reportData, isLoading: isReportLoading } = usePartnerReports(activePeriod)
  const { mutate: requestPayout, isPending: isPayoutSubmitting } = useRequestPartnerPayout()

  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState('')
  const [payoutError, setPayoutError] = useState('')
  const [payoutSuccess, setPayoutSuccess] = useState(false)

  if (isStatsLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 w-full text-[#153e14]">
        <svg className="w-10 h-10 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="mt-3 text-xs font-semibold text-gray-500">Loading Revenue-Share Cockpit...</p>
      </div>
    )
  }

  const handlePayoutSubmit = () => {
    const amt = parseFloat(payoutAmount)
    setPayoutError('')

    if (isNaN(amt) || amt <= 0) {
      setPayoutError('Please enter a valid amount.')
      return
    }

    if (amt > (stats?.availableBalance || 0)) {
      setPayoutError('Requested amount exceeds your available balance.')
      return
    }

    if (amt < 50) {
      setPayoutError('Minimum withdrawal amount is GHS 50.00.')
      return
    }

    requestPayout(
      { amount: amt },
      {
        onSuccess: () => {
          setPayoutSuccess(true)
          setTimeout(() => {
            setShowPayoutModal(false)
            setPayoutSuccess(false)
            setPayoutAmount('')
          }, 1800)
        },
        onError: (err: unknown) => {
          setPayoutError(apiErrorMessage(err, 'Failed to submit settlement request.'))
        },
      }
    )
  }

  // Max value calculation for custom responsive SVG bar chart
  const maxEarnings = Math.max(...(reportData?.chartData.map((d) => d.partnerEarnings) || [100]))

  const totalVouchers = Math.max(stats?.totalVouchersSold || 1, 1) // prevent div zero
  const wasscePct = (((stats?.voucherDistribution?.wassce?.count || 0) / totalVouchers) * 100).toFixed(1)
  const becePct = (((stats?.voucherDistribution?.bece?.count || 0) / totalVouchers) * 100).toFixed(1)
  const novdecPct = (((stats?.voucherDistribution?.novdec?.count || 0) / totalVouchers) * 100).toFixed(1)

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <Helmet>
        <title>Revenue Partner Dashboard — CivicTree</title>
      </Helmet>

      {/* ─── Hero / Executive Banner ────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#123811] via-[#1a4f19] to-[#256323] text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-white/10">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_top_right,rgba(223,186,96,0.25),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#dfba60]/20 text-[#dfba60] text-xs font-bold border border-[#dfba60]/30 tracking-wide uppercase">
                Active Contract: {stats?.sharePercentage ?? 5.0}% Revenue Share
              </span>
              <span className="text-xs text-white/60 font-mono hidden sm:inline">
                • {stats?.contractRef}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              {stats?.partnerName || 'Revenue Partner'}
            </h1>
            <p className="text-white/75 text-xs sm:text-sm mt-1 max-w-2xl">
              You receive an automatic <strong className="text-white font-semibold">{stats?.sharePercentage}% cut</strong> on every examination result checker voucher sold across Web, USSD, and Affiliate networks.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setShowPayoutModal(true)}
              className="px-5 py-3 bg-[#dfba60] hover:bg-[#eac875] text-[#123811] font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Request Payout</span>
            </button>

            <button
              onClick={() => navigate('/partner/reports')}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              Full Analytics →
            </button>
          </div>
        </div>
      </div>

      {/* ─── Key Metrics Grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Lifetime Share Earnings */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lifetime Share Earnings</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            GHS {Number(stats?.lifetimeShareEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            from <strong className="text-gray-600 font-semibold">{Number(stats?.totalVouchersSold || 0).toLocaleString()}</strong> total vouchers sold
          </p>
        </motion.div>

        {/* Card 2: Available Withdrawable Balance */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs bg-gradient-to-b from-white to-emerald-50/30 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Available Balance</span>
            <div className="w-9 h-9 rounded-xl bg-[#153e14] text-[#dfba60] flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-900 mt-2">
            GHS {Number(stats?.availableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className="text-gray-500">Pending Payout:</span>
            <span className="font-semibold text-amber-700">GHS {Number(stats?.pendingWithdrawalAmount || 0).toLocaleString()}</span>
          </div>
        </motion.div>

        {/* Card 3: Today's Revenue Share */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Today's Earnings</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            GHS {Number(stats?.todayEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            <strong className="text-blue-700 font-bold">+{stats?.todayVouchersSold || 0}</strong> purchases today (Gross GHS {Number(stats?.todayGrossVolume || 0).toLocaleString()})
          </p>
        </motion.div>

        {/* Card 4: Month-to-Date Performance */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Month to Date (MTD)</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            GHS {Number(stats?.mtdEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center space-x-1">
            <span>↑ +{stats?.mtdGrowthPercentage || 24.6}% MoM Growth</span>
          </p>
        </motion.div>
      </div>

      {/* ─── Multi-Period Chart & Live Pulse ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Card (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900">Partner Earnings Trend</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Calculated {stats?.sharePercentage}% share on all platform voucher transactions
              </p>
            </div>

            {/* Time Toggle Tabs */}
            <div className="flex items-center bg-gray-100/80 p-1 rounded-xl self-start sm:self-auto">
              {(['hourly', 'daily', 'monthly', 'yearly'] as PeriodType[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setActivePeriod(period)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                    activePeriod === period
                      ? 'bg-white text-[#153e14] shadow-xs font-bold'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {period === 'hourly' ? 'Today' : period === 'daily' ? 'Week' : period === 'monthly' ? 'Month' : 'Year'}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Display Area */}
          <div className="pt-6">
            {isReportLoading ? (
              <div className="h-56 flex items-center justify-center text-gray-400 text-xs">
                Refreshing chart metrics...
              </div>
            ) : (
              <div className="space-y-4">
                {/* SVG Visual Bars */}
                <div className="h-52 flex items-end justify-between gap-2 pt-6 px-2">
                  {reportData?.chartData.map((d, idx) => {
                    const shareRate = stats?.sharePercentage ?? 5.0
                    const calcGross = (earnings: number) => earnings / (shareRate / 100 || 1)
                    const safeGross = d.grossVolume ?? calcGross(d.partnerEarnings || 0)
                    const heightPct = Math.max(12, Math.round((d.partnerEarnings / (maxEarnings || 1)) * 100))
                    
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center group relative">
                        {/* Hover Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-12 bg-gray-900 text-white text-[10px] px-2.5 py-1 rounded-md shadow-lg transition-opacity whitespace-nowrap z-20">
                          <p className="font-bold">GHS {d.partnerEarnings.toFixed(2)}</p>
                          <p className="text-gray-300">Gross: GHS {safeGross.toLocaleString()}</p>
                        </div>

                        {/* Bar */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPct}%` }}
                          transition={{ duration: 0.4, delay: idx * 0.04 }}
                          className="w-full max-w-[42px] bg-gradient-to-t from-[#153e14] to-[#256323] rounded-t-lg group-hover:brightness-110 transition-all shadow-xs cursor-pointer"
                        />
                        <span className="text-[11px] text-gray-400 mt-2 font-medium truncate w-full text-center">
                          {d.label}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Summary Strip below chart */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-xs text-gray-500">
                  <span>
                    Gross Platform Sales in Period:{' '}
                    <strong className="text-gray-800">
                      GHS {Number(reportData?.totalGrossVolume || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </strong>
                  </span>
                  <span>
                    Your {stats?.sharePercentage}% Share:{' '}
                    <strong className="text-emerald-700 font-bold">
                      GHS {Number(reportData?.totalPartnerEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Breakdown by Category (1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Voucher Distribution</h2>
            <p className="text-xs text-gray-400 mt-0.5">Breakdown by examination checker type</p>

            <div className="mt-5 space-y-4">
              {/* WASSCE */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <div className="flex items-center justify-between text-xs font-bold text-gray-800 mb-1.5">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span>WASSCE Checkers</span>
                  </span>
                  <span className="text-emerald-800">
                    GHS {Number(stats?.voucherDistribution.wassce.earnings || 0).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-emerald-200/50 rounded-full h-2">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${wasscePct}%` }} />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  {Number(stats?.voucherDistribution.wassce.count || 0).toLocaleString()} vouchers sold ({wasscePct}% volume)
                </p>
              </div>

              {/* BECE */}
              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100">
                <div className="flex items-center justify-between text-xs font-bold text-gray-800 mb-1.5">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span>BECE Checkers</span>
                  </span>
                  <span className="text-blue-800">
                    GHS {Number(stats?.voucherDistribution.bece.earnings || 0).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-blue-200/50 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${becePct}%` }} />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  {Number(stats?.voucherDistribution.bece.count || 0).toLocaleString()} vouchers sold ({becePct}% volume)
                </p>
              </div>

              {/* NOVDEC */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100">
                <div className="flex items-center justify-between text-xs font-bold text-gray-800 mb-1.5">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                    <span>NOVDEC Checkers</span>
                  </span>
                  <span className="text-amber-800">
                    GHS {Number(stats?.voucherDistribution.novdec.earnings || 0).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-amber-200/50 rounded-full h-2">
                  <div className="bg-amber-600 h-2 rounded-full" style={{ width: `${novdecPct}%` }} />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  {Number(stats?.voucherDistribution.novdec.count || 0).toLocaleString()} vouchers sold ({novdecPct}% volume)
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={() => navigate('/partner/transactions')}
              className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              View Full Sales Ledger →
            </button>
          </div>
        </div>
      </div>

      {/* ─── Recent Streaming Purchases Ledger ──────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-base font-bold text-gray-900">Recent Platform Purchases</h2>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Live stream of purchases generating your {stats?.sharePercentage}% revenue cut
            </p>
          </div>

          <button
            onClick={() => navigate('/partner/transactions')}
            className="text-xs font-bold text-[#153e14] hover:underline cursor-pointer"
          >
            View All Transactions ({stats?.totalVouchersSold || 0}) →
          </button>
        </div>

        {/* Transaction Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 font-semibold">Order Ref</th>
                <th className="pb-3 font-semibold">Checker Type</th>
                <th className="pb-3 font-semibold">Channel</th>
                <th className="pb-3 font-semibold">Payment</th>
                <th className="pb-3 font-semibold text-right">Gross Total</th>
                <th className="pb-3 font-semibold text-right">Your Cut ({stats?.sharePercentage}%)</th>
                <th className="pb-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                stats.recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 font-mono font-semibold text-gray-900">
                      {tx.orderRef}
                      <span className="block text-[10px] text-gray-400 font-sans font-normal">
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className="font-semibold text-gray-800">{tx.voucherType}</span>
                      <span className="text-gray-400 text-[11px] block">Qty: {tx.quantity}</span>
                    </td>
                    <td className="py-3.5 text-gray-600">{tx.channel}</td>
                    <td className="py-3.5 text-gray-600">{tx.paymentMethod}</td>
                    <td className="py-3.5 text-right font-semibold text-gray-900">
                      GHS {(Number(tx.grossAmount) || (Number(tx.partnerEarning) ? Number(tx.partnerEarning) / ((stats?.sharePercentage || 5) / 100) : 0)).toFixed(2)}
                    </td>
                    <td className="py-3.5 text-right font-bold text-emerald-700">
                      +GHS {(Number(tx.partnerEarning) || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800 text-[10px] font-bold">
                        {tx.settlementStatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 text-xs font-semibold">
                    No recent transactions found. New sales will appear here in real-time.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Payout Request Modal ────────────────────────────────────────────── */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8"
          >
            {payoutSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <h3 className="text-lg font-bold text-gray-900">Payout Request Submitted!</h3>
                <p className="text-xs text-gray-500">
                  Your settlement of <strong className="text-gray-800">GHS {parseFloat(payoutAmount).toFixed(2)}</strong> has been scheduled for disbursement.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-serif">Request Revenue-Share Payout</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Disbursement will be sent to your primary settlement account (MTN MoMo / Bank).
                </p>

                <div className="my-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">Available Balance</span>
                    <p className="text-xl font-bold text-emerald-950 mt-0.5">
                      GHS {Number(stats?.availableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPayoutAmount(String(stats?.availableBalance || 0))}
                    className="text-xs font-bold text-[#153e14] bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs hover:bg-emerald-50"
                  >
                    Max Amount
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Withdrawal Amount (GHS)
                    </label>
                    <input
                      type="number"
                      value={payoutAmount}
                      onChange={(e) => {
                        setPayoutAmount(e.target.value)
                        setPayoutError('')
                      }}
                      placeholder="e.g. 500.00"
                      className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#153e14] focus:ring-2 focus:ring-[#153e14]/15 font-semibold"
                    />
                  </div>

                  {payoutError && (
                    <p className="text-xs text-red-600 font-medium bg-red-50 p-2.5 rounded-lg">{payoutError}</p>
                  )}
                </div>

                <div className="flex items-center space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPayoutModal(false)
                      setPayoutAmount('')
                      setPayoutError('')
                    }}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePayoutSubmit}
                    disabled={isPayoutSubmitting}
                    className="flex-1 py-3 bg-[#153e14] hover:bg-[#1a4f19] text-[#dfba60] text-xs font-bold rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
                  >
                    {isPayoutSubmitting ? (
                      <span>Processing...</span>
                    ) : (
                      <span>Submit Payout</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}
