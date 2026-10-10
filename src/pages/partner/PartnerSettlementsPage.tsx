import { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { apiErrorMessage } from '../../utils/apiError'
import {
  usePartnerProfile,
  usePartnerSettlements,
  useRequestPartnerPayout,
} from '../../hooks/usePartner'
import type { PayoutMethodType } from '../../types/partner'

export default function PartnerSettlementsPage() {
  const { data: profile } = usePartnerProfile()
  const { data: settlements, isLoading: isSettlementsLoading } = usePartnerSettlements()
  const { mutate: requestPayout, isPending: isSubmitting } = useRequestPartnerPayout()

  const [showModal, setShowModal] = useState(false)
  const [amount, setAmount] = useState('')
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethodType>('MOMO')
  const [provider, setProvider] = useState('MTN Mobile Money')
  const [accountNumber, setAccountNumber] = useState('0245558921')
  const [accountName, setAccountName] = useState('Apex Capital Ventures Ltd')
  const [notes, setNotes] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState(false)

  const availableBalance = profile?.availableBalance ?? 3362.50
  const pendingAmount = profile?.pendingWithdrawalAmount ?? 1200.00
  const lifetimeWithdrawn = profile?.withdrawnAmount ?? 18500.00

  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    const val = parseFloat(amount)
    if (isNaN(val) || val <= 0) {
      setErrorMsg('Please enter a valid payout amount.')
      return
    }

    if (val > availableBalance) {
      setErrorMsg('Requested amount exceeds available balance.')
      return
    }

    if (val < 50) {
      setErrorMsg('Minimum payout threshold is GHS 50.00.')
      return
    }

    requestPayout(
      { amount: val, notes },
      {
        onSuccess: () => {
          setSuccessMsg(true)
          setTimeout(() => {
            setShowModal(false)
            setSuccessMsg(false)
            setAmount('')
            setNotes('')
          }, 2000)
        },
        onError: (err: unknown) => {
          setErrorMsg(apiErrorMessage(err, 'Failed to submit payout request.'))
        },
      }
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <Helmet>
        <title>Settlements & Payouts — Partner Portal</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Settlements & Payouts</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your revenue-share disbursements, payout methods, and historical payment receipts.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          disabled={availableBalance <= 0}
          className="px-5 py-3 bg-[#153e14] hover:bg-[#1a4f19] disabled:opacity-50 text-[#dfba60] text-xs font-bold rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Request Payout Settlement</span>
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Available Balance */}
        <div className="bg-gradient-to-br from-[#153e14] to-[#205e1e] text-white p-6 rounded-3xl shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(223,186,96,0.2),transparent_70%)] pointer-events-none" />
          <span className="text-xs font-bold text-[#dfba60] uppercase tracking-wider">Available Balance</span>
          <p className="text-3xl font-bold mt-2">
            GHS {availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-white/70 mt-1">Ready for on-demand disbursement</p>
        </div>

        {/* Pending Settlement */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">In Processing / Pending</span>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            GHS {pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400 mt-1">Awaiting bank/MoMo gateway clearance</p>
        </div>

        {/* Lifetime Disbursed */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
          <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Lifetime Paid Out</span>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            GHS {lifetimeWithdrawn.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400 mt-1">Total revenue-share settled to date</p>
        </div>
      </div>

      {/* Saved Payout Accounts */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
        <h2 className="text-base font-bold text-gray-900 mb-1">Registered Disbursement Accounts</h2>
        <p className="text-xs text-gray-400 mb-4">
          All payouts are routed through verified Mobile Money or Commercial Bank accounts.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {profile?.payoutMethods.map((pm) => (
            <div
              key={pm.id}
              className={`p-4 rounded-2xl border flex items-start justify-between ${
                pm.isDefault
                  ? 'border-emerald-300 bg-emerald-50/40'
                  : 'border-gray-200 bg-gray-50/50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                    pm.type === 'MOMO'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-blue-100 text-blue-900'
                  }`}
                >
                  {pm.type === 'MOMO' ? 'MoMo' : 'Bank'}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs font-bold text-gray-900">{pm.provider}</p>
                    {pm.isDefault && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 font-mono mt-0.5">{pm.accountNumber}</p>
                  <p className="text-[11px] text-gray-400">{pm.accountName}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settlements History Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Settlement Payout History</h2>
            <p className="text-xs text-gray-400 mt-0.5">Records of all past and pending disbursements</p>
          </div>
        </div>

        {isSettlementsLoading ? (
          <div className="py-20 text-center text-xs text-gray-400">Loading payout records...</div>
        ) : (settlements || []).length === 0 ? (
          <div className="py-20 text-center text-xs text-gray-400">No settlement history found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase text-[10px] font-bold">
                  <th className="py-3.5 px-5">Settlement Ref</th>
                  <th className="py-3.5 px-4">Disbursement Method</th>
                  <th className="py-3.5 px-4">Recipient Account</th>
                  <th className="py-3.5 px-4 text-right">Amount (GHS)</th>
                  <th className="py-3.5 px-4">Requested Date</th>
                  <th className="py-3.5 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {settlements?.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-5">
                      <span className="font-mono font-bold text-gray-900">{s.reference}</span>
                      {s.notes && (
                        <span className="block text-[10px] text-gray-400 truncate max-w-xs">
                          {s.notes}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-800">{s.provider}</td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-gray-700">{s.destinationAccount}</span>
                      <span className="block text-[10px] text-gray-400">{s.accountName}</span>
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-gray-900">
                      GHS {s.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {new Date(s.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          s.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.status === 'Processing'
                            ? 'bg-blue-100 text-blue-800'
                            : s.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8"
          >
            {successMsg ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <h3 className="text-lg font-bold text-gray-900">Settlement Request Dispatched!</h3>
                <p className="text-xs text-gray-500">
                  Your request for <strong className="text-gray-900">GHS {parseFloat(amount).toFixed(2)}</strong> has been received and queued for immediate disbursement.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePayoutSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 font-serif">Request Revenue-Share Settlement</h3>
                <p className="text-xs text-gray-500">
                  Withdraw your accrued earnings to your preferred account.
                </p>

                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                    {errorMsg}
                  </div>
                )}

                {/* Amount Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Amount to Withdraw (GHS)
                    </label>
                    <span className="text-[11px] text-emerald-800 font-bold">
                      Available: GHS {availableBalance.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 1000.00"
                    required
                    className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#153e14] font-semibold"
                  />
                </div>

                {/* Payout Method */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Disbursement Channel
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPayoutMethod('MOMO')
                        setProvider('MTN Mobile Money')
                      }}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        payoutMethod === 'MOMO'
                          ? 'border-[#153e14] bg-emerald-50/50 text-[#153e14]'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      Mobile Money
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPayoutMethod('BANK')
                        setProvider('GCB Bank Ghana')
                      }}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        payoutMethod === 'BANK'
                          ? 'border-[#153e14] bg-emerald-50/50 text-[#153e14]'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      Bank Transfer
                    </button>
                  </div>
                </div>

                {/* Account Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Provider</label>
                    <input
                      type="text"
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Account Number / Phone</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-[#153e14] hover:bg-[#1a4f19] text-[#dfba60] text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Confirm Withdrawal'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}
