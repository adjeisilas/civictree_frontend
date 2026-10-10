import { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useNavigate, Link } from 'react-router-dom'
import { useAffiliateAuthStore } from '../../stores/affiliateStore'
import { useAffiliateProfile, useAffiliateDashboard, useAffiliateSales, useRequestWithdrawal } from '../../hooks/useAffiliates'
import { parseSale } from './saleRow'
import { apiErrorMessage } from '../../utils/apiError'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }),
}

function StatCard({ label, value, sub, color, bgColor, icon, index }: { label: string; value: string; sub?: string; color: string; bgColor: string; icon: React.ReactNode; index: number }) {
  return (
    <motion.div custom={index} variants={cardVariants} initial="hidden" animate="visible"
      className={`${bgColor} rounded-2xl p-5 shadow-sm border border-black/5 flex items-start space-x-4 hover:shadow-md transition-all`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  )
}

export default function AffiliateDashboard() {
  const navigate = useNavigate()
  
  const { data: currentAffiliate, isLoading: isProfileLoading, isError: isProfileError } = useAffiliateProfile()
  const { data: statsData, isLoading: isStatsLoading } = useAffiliateDashboard()
  const { data: salesData, isLoading: isSalesLoading } = useAffiliateSales({ limit: 5 })
  const { mutate: requestWithdrawal, isPending: isWithdrawing } = useRequestWithdrawal()
  const { affiliateLogout } = useAffiliateAuthStore()

  const [copied, setCopied] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawError, setWithdrawError] = useState('')
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)

  if (isProfileLoading || isStatsLoading || isSalesLoading) {
    return (
      <div className="flex justify-center items-center h-64 w-full text-[#1a5c18]">
        <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>
    )
  }

  if (isProfileError || !currentAffiliate) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm text-center max-w-xl mx-auto space-y-5 my-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-2xl font-bold">
          ⚠️
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-serif">Affiliate Profile Not Found</h2>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Your user account is logged in, but an active affiliate profile was not found. If you have not registered as an affiliate yet, please submit your application.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link to="/become-affiliate" className="px-5 py-2.5 bg-[#1a5c18] text-white text-xs font-bold rounded-xl hover:bg-[#154a14] transition-all">
            Apply to Become an Affiliate
          </Link>
          <button onClick={() => affiliateLogout()} className="px-5 py-2.5 border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
            Log Out Session
          </button>
        </div>
      </div>
    )
  }

  const profile = currentAffiliate.affiliateProfile || currentAffiliate
  const ussdCode = statsData?.ussdCode || profile.ussdCode

  const stats = statsData || {
    totalVouchersSold: profile.totalVouchersSold ?? 0,
    approvedCommission: profile.approvedCommission ?? 0,
    withdrawnAmount: profile.withdrawnAmount ?? 0,
    pendingWithdrawalAmount: profile.pendingWithdrawalAmount ?? 0,
    availableBalance: profile.availableBalance ?? 0,
    recentSales: [],
  }

  const handleCopyUssd = () => {
    if (ussdCode) {
      navigator.clipboard.writeText(ussdCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount)
    setWithdrawError('')
    if (isNaN(amount) || amount <= 0) return setWithdrawError('Enter a valid amount')
    if (amount > stats.availableBalance) return setWithdrawError('Amount exceeds available balance')
    
    requestWithdrawal({ amount }, {
      onSuccess: () => {
        setWithdrawSuccess(true)
        setTimeout(() => {
          setShowWithdrawModal(false)
          setWithdrawSuccess(false)
          setWithdrawAmount('')
        }, 1800)
      },
      onError: (err: unknown) => {
        setWithdrawError(apiErrorMessage(err, 'Failed to process withdrawal'))
      }
    })
  }

  const salesList = Array.isArray(salesData) ? salesData : []
  const recentSales = (statsData?.recentSales && statsData.recentSales.length > 0)
    ? statsData.recentSales
    : salesList.slice(0, 5)

  const statCards = [
    {
      label: 'Total Vouchers Sold',
      value: Number(stats?.totalVouchersSold || 0).toLocaleString(),
      sub: 'through your USSD',
      color: 'bg-emerald-100 text-emerald-700',
      bgColor: 'bg-emerald-50',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>,
    },
    {
      label: 'Approved Commission',
      value: `GHS ${Number(stats?.approvedCommission || 0).toLocaleString()}`,
      sub: 'total lifetime earnings',
      color: 'bg-blue-100 text-blue-700',
      bgColor: 'bg-blue-50',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      label: 'Available Balance',
      value: `GHS ${Number(stats?.availableBalance || 0).toLocaleString()}`,
      sub: 'ready to withdraw',
      color: 'bg-[#1a5c18]/15 text-[#1a5c18]',
      bgColor: 'bg-[#1a5c18]/5',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    },
    {
      label: 'Pending Withdrawal',
      value: `GHS ${Number(stats?.pendingWithdrawalAmount || 0).toLocaleString()}`,
      sub: 'awaiting admin approval',
      color: 'bg-amber-200/60 text-amber-700',
      bgColor: 'bg-amber-50',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      label: 'Withdrawn Amount',
      value: `GHS ${Number(stats?.withdrawnAmount || 0).toLocaleString()}`,
      sub: 'total paid out',
      color: 'bg-purple-100 text-purple-700',
      bgColor: 'bg-purple-50',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    },
  ]

  return (
    <div className="space-y-6 w-full">
      <Helmet>
        <title>Affiliate Dashboard — Results Checker</title>
      </Helmet>

      {/* Welcome */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#1a5c18] p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(223,186,96,0.15),transparent_60%)]" />
        <div className="z-10">
          <h1 className="text-2xl font-serif font-bold">Welcome back, {(currentAffiliate.fullName || 'Affiliate').split(' ')[0]}!</h1>
          <p className="text-white/70 text-sm mt-1">Your affiliate channel is active. Every sale is tracked automatically.</p>
        </div>
        <div className="mt-4 sm:mt-0 z-10">
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={stats.availableBalance <= 0}
            className="px-5 py-2.5 bg-[#dfba60] hover:brightness-105 active:scale-[0.98] disabled:opacity-40 text-[#1a3d10] text-xs font-bold rounded-xl transition-all shadow cursor-pointer"
          >
            Request Withdrawal
          </button>
        </div>
      </div>

      {/* My USSD Banner */}
      <div className="bg-gradient-to-br from-[#1a5c18] to-[#2a7a27] rounded-2xl p-6 text-white shadow-lg border border-[#1a5c18]/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs font-bold text-white/60 uppercase tracking-widest">My Affiliate USSD</p>
            </div>
            <p className="text-3xl sm:text-4xl font-mono font-bold text-[#dfba60] tracking-wider break-all">
              {ussdCode ?? 'Pending Approval'}
            </p>
            <p className="text-white/60 text-xs mt-2">Give this USSD to customers who want to purchase vouchers through you.</p>
          </div>
          <div className="flex flex-col space-y-2 shrink-0">
            <button
              onClick={handleCopyUssd}
              disabled={!currentAffiliate.ussdCode}
              className="flex items-center space-x-2 px-5 py-2.5 bg-white/15 hover:bg-white/20 active:scale-[0.98] disabled:opacity-40 rounded-xl text-sm font-semibold transition-all cursor-pointer border border-white/20"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  <span>Copy USSD</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-white/40 text-center">Cannot be modified</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <StatCard key={stat.label} {...stat} index={i} />
        ))}
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-800">Recent Sales</h2>
          <button onClick={() => navigate('/affiliate/sales')} className="text-xs text-[#1a5c18] font-semibold hover:underline cursor-pointer">
            View all →
          </button>
        </div>

        {recentSales.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <svg className="w-10 h-10 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <p className="text-sm">No sales yet. Share your USSD code to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentSales.map((sale, idx) => {
              const parsed = parseSale(sale)
              return (
                <div key={sale.id || parsed.ref || idx} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-[#f0faf0] flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-[#1a5c18]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{parsed.voucherType}</p>
                      <p className="text-xs text-gray-400">{parsed.ref} · {parsed.customerDisplay}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">GHS {parsed.saleAmount}</p>
                    <p className="text-xs text-emerald-600 font-semibold">+GHS {parsed.commissionEarned}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
          >
            {withdrawSuccess ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-base font-bold text-gray-900">Request Submitted!</h3>
                <p className="text-xs text-gray-400 mt-1">Your withdrawal request is now pending admin review.</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Request Withdrawal</h3>
                <p className="text-xs text-gray-500 mb-5">Available Balance: <span className="font-bold text-[#1a5c18]">GHS {stats.availableBalance}</span></p>

                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Amount (GHS)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => { setWithdrawAmount(e.target.value); setWithdrawError('') }}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a5c18] focus:ring-2 focus:ring-[#1a5c18]/10 transition-all mb-2"
                />
                {withdrawError && <p className="text-red-500 text-xs mb-3">{withdrawError}</p>}

                <div className="flex space-x-3 mt-4">
                  <button onClick={() => { setShowWithdrawModal(false); setWithdrawAmount(''); setWithdrawError('') }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-3 rounded-xl transition-all cursor-pointer">
                    Cancel
                  </button>
                  <button 
                    onClick={handleWithdraw} 
                    disabled={isWithdrawing}
                    className="flex-1 bg-[#1a5c18] hover:bg-[#154a14] disabled:opacity-50 text-white text-sm font-semibold py-3 rounded-xl transition-all cursor-pointer flex justify-center items-center"
                  >
                    {isWithdrawing ? (
                       <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : 'Submit Request'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}
