import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { 
  useAffiliateWithdrawals, 
  useAffiliateProfile, 
  useRequestWithdrawal, 
  useUpdateAffiliatePayment 
} from '../../hooks/useAffiliates'
import { apiErrorMessage } from '../../utils/apiError'
import type { WithdrawalStatus, MomoNetwork, StoredPaymentDetails, AffiliatePayoutDetailsPayload } from '../../types/affiliate'

const STATUS_CONFIG: Record<WithdrawalStatus, { color: string; dot: string }> = {
  Pending:  { color: 'bg-amber-100 text-amber-700',    dot: 'bg-amber-400' },
  Approved: { color: 'bg-teal-100 text-teal-700',     dot: 'bg-teal-500' },
  Rejected: { color: 'bg-red-100 text-red-700',        dot: 'bg-red-500' },
  Paid:     { color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
}

export default function AffiliateWithdrawalsPage() {
  const { data: currentAffiliate, isLoading: isProfileLoading } = useAffiliateProfile()
  const { data: withdrawals, isLoading: isWithdrawalsLoading } = useAffiliateWithdrawals()
  const { mutate: requestWithdrawal, isPending: isRequesting } = useRequestWithdrawal()
  const { mutate: updatePaymentMethod, isPending: isUpdatingPayment } = useUpdateAffiliatePayment()

  const [showModal, setShowModal] = useState(false)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [payoutPassword, setPayoutPassword] = useState('')
  const [payoutError, setPayoutError] = useState('')
  const profile = currentAffiliate?.affiliateProfile || currentAffiliate || {}
  const paymentDetails = profile.payoutMethod === 'MOBILE_MONEY' || profile.momoNumber
    ? { type: 'Mobile Money', phoneNumber: profile.momoNumber, network: profile.momoNetwork, accountName: profile.momoAccountName }
    : profile.payoutMethod === 'BANK_ACCOUNT' || profile.bankAccountNumber
    ? { type: 'Bank', bankName: profile.bankName, accountNumber: profile.bankAccountNumber, accountName: profile.bankAccountName }
    : currentAffiliate?.paymentDetails

  // Every field below shows what is on file until the affiliate types over it
  const onFile = paymentDetails as StoredPaymentDetails | undefined
  const isMomoOnFile = onFile?.type === 'Mobile Money'
  const isBankOnFile = onFile?.type === 'Bank'

  const [paymentTypeChoice, setPaymentType] = useState<'Mobile Money' | 'Bank' | null>(null)
  const paymentType = paymentTypeChoice ?? (isBankOnFile ? 'Bank' : 'Mobile Money')

  const [momoNetworkEdit, setMomoNetwork] = useState<MomoNetwork | null>(null)
  const momoNetwork = momoNetworkEdit ?? ((onFile?.network as MomoNetwork) || 'MTN')

  const [momoPhoneEdit, setMomoPhone] = useState<string | null>(null)
  const momoPhone = momoPhoneEdit ?? (isMomoOnFile ? onFile?.phoneNumber || '' : '')

  const [momoNameEdit, setMomoName] = useState<string | null>(null)
  const momoName = momoNameEdit ?? (isMomoOnFile ? onFile?.accountName || '' : '')

  const [bankNameEdit, setBankName] = useState<string | null>(null)
  const bankName = bankNameEdit ?? (onFile?.bankName || '')

  const [bankAccNumEdit, setBankAccNum] = useState<string | null>(null)
  const bankAccNum = bankAccNumEdit ?? (isBankOnFile ? onFile?.accountNumber || '' : '')

  const [bankAccNameEdit, setBankAccName] = useState<string | null>(null)
  const bankAccName = bankAccNameEdit ?? (isBankOnFile ? onFile?.accountName || '' : '')

  // Throws away an unsaved payout edit so the form follows the stored details again
  const discardPayoutEdits = () => {
    setPaymentType(null)
    setMomoNetwork(null)
    setMomoPhone(null)
    setMomoName(null)
    setBankName(null)
    setBankAccNum(null)
    setBankAccName(null)
    setPayoutPassword('')
    setPayoutError('')
  }

  if (isProfileLoading || isWithdrawalsLoading) {
    return (
      <div className="flex justify-center items-center h-64 w-full text-[#1a5c18]">
        <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>
    )
  }

  if (!currentAffiliate) return null

  const myWithdrawals = withdrawals || []
  const totalPaid = myWithdrawals.filter(w => w.status === 'Paid').reduce((a, b) => a + b.amount, 0)
  const totalPending = myWithdrawals.filter(w => w.status === 'Pending' || w.status === 'Approved').reduce((a, b) => a + b.amount, 0)

  const handleSubmit = () => {
    const num = parseFloat(amount)
    setError('')
    const availBal = profile.availableBalance ?? 0
    if (!paymentDetails) return setError('Please connect a payment method first')
    if (!num || num <= 0) return setError('Enter a valid amount')
    if (num > availBal) return setError(`Max available: GHS ${availBal}`)
    
    requestWithdrawal({ amount: num }, {
      onSuccess: () => {
        setSuccess(true)
        setTimeout(() => { setShowModal(false); setSuccess(false); setAmount('') }, 1800)
      },
      onError: (err: unknown) => setError(apiErrorMessage(err, 'Failed to submit withdrawal'))
    })
  }

  const handleUpdatePayment = () => {
    setPayoutError('')

    let payload: AffiliatePayoutDetailsPayload
    if (paymentType === 'Mobile Money') {
      if (!momoPhone || !momoName) return
      payload = {
        payoutMethod: 'MOBILE_MONEY',
        momoNetwork,
        momoNumber: momoPhone,
        momoAccountName: momoName,
        currentPassword: payoutPassword
      }
    } else {
      if (!bankName || !bankAccNum || !bankAccName) return
      payload = {
        payoutMethod: 'BANK_ACCOUNT',
        bankName,
        bankAccountNumber: bankAccNum,
        bankAccountName: bankAccName,
        currentPassword: payoutPassword
      }
    }

    // The API requires the account password before it will change where money goes
    if (!payoutPassword) {
      setPayoutError('Enter your account password to confirm this change.')
      return
    }

    updatePaymentMethod(payload, {
      onSuccess: () => {
        setShowPaymentModal(false)
        discardPayoutEdits()
      },
      onError: (err: unknown) => setPayoutError(apiErrorMessage(err, 'Could not update your payout details.'))
    })
  }

  return (
    <div className="space-y-6 w-full">
      <Helmet><title>Withdrawals — Affiliate Portal</title></Helmet>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Withdrawals</h1>
          <p className="text-gray-400 text-sm mt-1">Request and track your commission payout history.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={(profile.availableBalance ?? 0) <= 0 || !paymentDetails}
          className="px-5 py-2.5 bg-[#1a5c18] hover:bg-[#154a14] disabled:opacity-40 active:scale-[0.98] text-white text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-sm"
        >
          + Request Withdrawal
        </button>
      </div>

      {/* Connected Account & Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Connected Account Section */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#1a5c18]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                Payout Account
              </h3>
              {paymentDetails ? (
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Connected</span>
              ) : (
                <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Not Set</span>
              )}
            </div>
            
            {paymentDetails ? (
              <div className="space-y-1 mt-4">
                <p className="text-xs text-gray-500 font-medium">{paymentDetails.type}</p>
                {paymentDetails.type === 'Mobile Money' ? (
                  <>
                    <p className="text-base font-bold text-gray-900">{paymentDetails.phoneNumber}</p>
                    <p className="text-xs text-gray-500">{paymentDetails.network} • {paymentDetails.accountName}</p>
                  </>
                ) : (
                  <>
                    <p className="text-base font-bold text-gray-900">{paymentDetails.accountNumber}</p>
                    <p className="text-xs text-gray-500">{paymentDetails.bankName} • {paymentDetails.accountName}</p>
                  </>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-2">Connect a Mobile Money or Bank account to receive your funds.</p>
            )}
          </div>

          <button 
            onClick={() => setShowPaymentModal(true)}
            className="w-full mt-4 py-2 border border-[#1a5c18] text-[#1a5c18] hover:bg-[#1a5c18]/5 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {paymentDetails ? 'Update Account' : 'Connect Account'}
          </button>
        </div>

        {/* Financial Summaries */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Available Balance', value: `GHS ${Number(profile.availableBalance ?? 0).toLocaleString()}`, color: 'text-[#1a5c18]' },
            { label: 'In Progress', value: `GHS ${totalPending.toLocaleString()}`, color: 'text-amber-600' },
            { label: 'Total Paid Out', value: `GHS ${totalPaid.toLocaleString()}`, color: 'text-blue-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-center">
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

      </div>

      {/* Withdrawals Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">Withdrawal History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Date', 'Amount', 'Payment Method', 'Status', 'Reference / Note'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {myWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">No withdrawal requests yet.</td>
                </tr>
              ) : myWithdrawals.map(w => {
                const cfg = STATUS_CONFIG[w.status]
                const payInfo = w.paymentDetails.type === 'Mobile Money'
                  ? `${w.paymentDetails.network} · ${w.paymentDetails.phoneNumber}`
                  : `${(w.paymentDetails as StoredPaymentDetails).bankName}`
                return (
                  <tr key={w.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {new Date(w.requestedAt).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 font-bold text-gray-900">GHS {w.amount.toLocaleString()}</td>
                    <td className="px-5 py-4 text-xs text-gray-600">{payInfo}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.color}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        <span>{w.status}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400 italic">
                      {w.status === 'Paid' && w.reference ? w.reference
                        : w.status === 'Rejected' && w.rejectionReason ? `Rejected: ${w.rejectionReason}`
                        : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            {success ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-base font-bold text-gray-900">Submitted!</h3>
                <p className="text-xs text-gray-400 mt-1">Your request is pending admin review.</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Request Withdrawal</h3>
                <p className="text-xs text-gray-500 mb-4">Available: <span className="font-bold text-[#1a5c18]">GHS {currentAffiliate.availableBalance ?? 0}</span></p>

                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Withdrawal Amount (GHS)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => { setAmount(e.target.value); setError('') }}
                  placeholder="Enter amount"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a5c18] focus:ring-2 focus:ring-[#1a5c18]/10 transition-all"
                />
                {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}

                <div className="mt-2 p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 font-semibold mb-0.5">Payment will be sent to:</p>
                  {currentAffiliate.paymentDetails?.type === 'Mobile Money' && (
                    <p className="text-xs text-gray-700">{(currentAffiliate.paymentDetails as StoredPaymentDetails).network} · {(currentAffiliate.paymentDetails as StoredPaymentDetails).phoneNumber} · {(currentAffiliate.paymentDetails as StoredPaymentDetails).accountName}</p>
                  )}
                  {currentAffiliate.paymentDetails?.type === 'Bank' && (
                    <p className="text-xs text-gray-700">{(currentAffiliate.paymentDetails as StoredPaymentDetails).bankName} · {(currentAffiliate.paymentDetails as StoredPaymentDetails).accountNumber}</p>
                  )}
                </div>

                <div className="flex space-x-3 mt-5">
                  <button onClick={() => { setShowModal(false); setAmount(''); setError('') }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-3 rounded-xl transition-all cursor-pointer">
                    Cancel
                  </button>
                  <button 
                    onClick={handleSubmit} 
                    disabled={isRequesting}
                    className="flex-1 bg-[#1a5c18] hover:bg-[#154a14] disabled:opacity-50 text-white text-sm font-semibold py-3 rounded-xl transition-all cursor-pointer flex justify-center items-center"
                  >
                    {isRequesting ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : 'Submit'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Connect/Update Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Payment Method</h3>
            <p className="text-xs text-gray-500 mb-5">Select where you want your commissions to be paid.</p>

            <div className="flex space-x-2 mb-4 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setPaymentType('Mobile Money')}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${paymentType === 'Mobile Money' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Mobile Money
              </button>
              <button
                onClick={() => setPaymentType('Bank')}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${paymentType === 'Bank' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Bank Account
              </button>
            </div>

            <div className="space-y-4">
              {paymentType === 'Mobile Money' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Network</label>
                    <select
                      value={momoNetwork}
                      onChange={(e) => setMomoNetwork(e.target.value as MomoNetwork)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a5c18] transition-all bg-white"
                    >
                      <option value="MTN">MTN</option>
                      <option value="Telecel">Telecel</option>
                      <option value="AirtelTigo">AirtelTigo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      value={momoPhone}
                      onChange={(e) => setMomoPhone(e.target.value)}
                      placeholder="e.g. 0241234567"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a5c18] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Account Name</label>
                    <input
                      type="text"
                      value={momoName}
                      onChange={(e) => setMomoName(e.target.value)}
                      placeholder="Name on MoMo account"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a5c18] transition-all"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Bank Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. GCB Bank"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a5c18] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Account Number</label>
                    <input
                      type="text"
                      value={bankAccNum}
                      onChange={(e) => setBankAccNum(e.target.value)}
                      placeholder="Bank account number"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a5c18] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Account Name</label>
                    <input
                      type="text"
                      value={bankAccName}
                      onChange={(e) => setBankAccName(e.target.value)}
                      placeholder="Name on bank account"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a5c18] transition-all"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm with your account password</label>
              <input
                type="password"
                value={payoutPassword}
                onChange={(e) => { setPayoutPassword(e.target.value); setPayoutError('') }}
                placeholder="Your account password"
                autoComplete="current-password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a5c18] transition-all"
              />
              <p className="text-[11px] text-gray-500 mt-1.5">For your security, withdrawals pause for a short cooling-off period after payout details change.</p>
              {payoutError && <p className="text-[11px] text-red-600 mt-2 font-semibold">{payoutError}</p>}
            </div>

            <div className="flex space-x-3 mt-6">
              <button onClick={() => { setShowPaymentModal(false); discardPayoutEdits() }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-3 rounded-xl transition-all cursor-pointer">
                Cancel
              </button>
              <button 
                onClick={handleUpdatePayment} 
                disabled={isUpdatingPayment}
                className="flex-1 bg-[#1a5c18] hover:bg-[#154a14] disabled:opacity-50 text-white text-sm font-semibold py-3 rounded-xl transition-all cursor-pointer flex justify-center items-center"
              >
                {isUpdatingPayment ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : 'Save Details'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
