import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAffiliateAuthStore } from '../../stores/affiliateStore'
import { useAffiliateProfile, useUpdateAffiliateProfile, useUpdateAffiliatePayment } from '../../hooks/useAffiliates'
import type { StoredPaymentDetails, AffiliatePayoutDetailsPayload } from '../../types/affiliate'
import { apiErrorMessage } from '../../utils/apiError'

// Ghana mobile number regex: starts with 0, then 2/3/5/6/7/9, then 8 more digits
const GH_PHONE_REGEX = /^0[235679]\d{8}$/

type PayoutType = 'MOBILE_MONEY' | 'BANK'
interface MomoFields { network: string; phoneNumber: string; accountName: string }
interface BankFields { bankName: string; accountNumber: string; accountName: string }

export default function AffiliateProfilePage() {
  const { data: currentAffiliate, isLoading } = useAffiliateProfile()
  const { affiliateLogout } = useAffiliateAuthStore()
  const { mutate: updateProfile, isPending: isSavingProfile } = useUpdateAffiliateProfile()
  const { mutate: updatePayment, isPending: isSavingPayment } = useUpdateAffiliatePayment()

  const [savedProfile, setSavedProfile] = useState(false)
  const [savedPayment, setSavedPayment] = useState(false)
  const [payoutPassword, setPayoutPassword] = useState('')
  const [payoutPasswordError, setPayoutPasswordError] = useState('')
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({})

  const profile = currentAffiliate?.affiliateProfile || currentAffiliate
  const storedDetails = profile?.paymentDetails as StoredPaymentDetails | undefined

  // The payout details already on file
  const savedMomo: MomoFields = {
    network: profile?.momoNetwork || storedDetails?.network || 'MTN',
    phoneNumber: profile?.momoNumber || storedDetails?.phoneNumber || '',
    accountName: profile?.momoAccountName || storedDetails?.accountName || '',
  }
  const savedBank: BankFields = {
    bankName: profile?.bankName || storedDetails?.bankName || '',
    accountNumber: profile?.bankAccountNumber || storedDetails?.accountNumber || '',
    accountName: profile?.bankAccountName || storedDetails?.accountName || '',
  }
  const savedPaymentType: PayoutType =
    profile?.payoutMethod === 'BANK_ACCOUNT' ||
    storedDetails?.type === 'Bank' ||
    (!profile?.momoNumber && Boolean(profile?.bankAccountNumber))
      ? 'BANK'
      : 'MOBILE_MONEY'

  // Each form shows what is saved until the affiliate changes it
  const [momoEdits, setMomoEdits] = useState<MomoFields | null>(null)
  const momoFields = momoEdits ?? savedMomo
  const setMomoFields = (update: (prev: MomoFields) => MomoFields) =>
    setMomoEdits((prev) => update(prev ?? savedMomo))

  const [bankEdits, setBankEdits] = useState<BankFields | null>(null)
  const bankFields = bankEdits ?? savedBank
  const setBankFields = (update: (prev: BankFields) => BankFields) =>
    setBankEdits((prev) => update(prev ?? savedBank))

  const [paymentTypeChoice, setSelectedPaymentType] = useState<PayoutType | null>(null)
  const selectedPaymentType = paymentTypeChoice ?? savedPaymentType

  if (isLoading || !currentAffiliate) {
    return (
      <div className="flex justify-center items-center h-64 w-full text-[#1a5c18]">
        <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>
    )
  }

  const handleSaveProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const payload = {
      fullName: formData.get('fullName') as string,
      businessName: formData.get('businessName') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      email: formData.get('email') as string,
      location: formData.get('location') as string,
    }

    updateProfile(payload, {
      onSuccess: () => {
        setSavedProfile(true)
        setTimeout(() => setSavedProfile(false), 2500)
      }
    })
  }

  const validatePayment = (): boolean => {
    const errors: Record<string, string> = {}
    if (selectedPaymentType === 'MOBILE_MONEY') {
      if (!GH_PHONE_REGEX.test(momoFields.phoneNumber)) {
        errors.phoneNumber = 'Enter a valid 10-digit Ghana number (e.g. 0241234567)'
      }
      if (momoFields.accountName.trim().length < 3) {
        errors.accountName = 'Account name must be at least 3 characters'
      }
    } else {
      if (bankFields.bankName.trim().length < 2) {
        errors.bankName = 'Enter a valid bank name'
      }
      if (!/^\d{10,16}$/.test(bankFields.accountNumber.trim())) {
        errors.accountNumber = 'Account number must be 10–16 digits'
      }
      if (bankFields.accountName.trim().length < 3) {
        errors.accountName = 'Account name must be at least 3 characters'
      }
    }
    setPaymentErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSavePayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validatePayment()) return

    let payload: AffiliatePayoutDetailsPayload = { payoutMethod: selectedPaymentType, currentPassword: payoutPassword }

    if (selectedPaymentType === 'MOBILE_MONEY') {
      payload = {
        ...payload,
        momoNetwork: momoFields.network,
        momoNumber: momoFields.phoneNumber,
        momoAccountName: momoFields.accountName,
        type: 'Mobile Money',
        network: momoFields.network,
        phoneNumber: momoFields.phoneNumber,
        accountName: momoFields.accountName,
      }
    } else {
      payload = {
        ...payload,
        bankName: bankFields.bankName,
        bankAccountNumber: bankFields.accountNumber,
        bankAccountName: bankFields.accountName,
        type: 'Bank',
        accountNumber: bankFields.accountNumber,
        accountName: bankFields.accountName,
      }
    }

    if (!payoutPassword) {
      setPayoutPasswordError('Enter your account password to confirm this change')
      return
    }

    updatePayment({ ...payload, currentPassword: payoutPassword }, {
      onSuccess: () => {
        setMomoEdits(null)
        setBankEdits(null)
        setSelectedPaymentType(null)
        setSavedPayment(true)
        setPayoutPassword('')
        setPayoutPasswordError('')
        setTimeout(() => setSavedPayment(false), 2500)
      },
      onError: (err: unknown) => {
        setPayoutPasswordError(apiErrorMessage(err, 'Could not update your payout details.'))
      }
    })
  }

  const statusColors: Record<string, string> = {
    Active: 'bg-emerald-100 text-emerald-700',
    ACTIVE: 'bg-emerald-100 text-emerald-700',
    Approved: 'bg-emerald-100 text-emerald-700',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    Pending: 'bg-amber-100 text-amber-700',
    PENDING: 'bg-amber-100 text-amber-700',
    Suspended: 'bg-red-100 text-red-700',
    SUSPENDED: 'bg-red-100 text-red-700',
  }

  const fullName = currentAffiliate.fullName || currentAffiliate.user?.fullName || 'Affiliate'
  const email = currentAffiliate.email || currentAffiliate.user?.email || '—'
  const phone = currentAffiliate.phoneNumber || currentAffiliate.phone || currentAffiliate.user?.phoneNumber || '—'
  const status = profile?.status || 'PENDING'
  const code = profile?.affiliateCode || profile?.affiliateId || '—'

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto pb-12">
      <Helmet><title>Profile — Affiliate Portal</title></Helmet>

      <div>
        <h1 className="text-2xl font-serif font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your personal information and payout account details.</p>
      </div>

      {/* Account Summary Card */}
      <div className="bg-[#1a5c18] rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center gap-6 relative overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(223,186,96,0.15),transparent_60%)]" />
        <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/20 flex items-center justify-center text-2xl font-bold shrink-0 z-10">
          {fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
        </div>
        <div className="z-10">
          <h2 className="text-xl font-bold">{fullName}</h2>
          <p className="text-white/70 text-sm">{email}</p>
          <div className="flex items-center space-x-3 mt-2">
            <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ${statusColors[status] ?? 'bg-gray-100 text-gray-600'}`}>
              {status}
            </span>
            <span className="text-[#dfba60] text-xs font-mono font-bold">{code}</span>
          </div>
        </div>

        {/* Read-only USSD Code */}
        {profile?.ussdCode && (
          <div className="sm:ml-auto z-10 bg-white/10 border border-white/20 rounded-2xl px-5 py-3 text-center">
            <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">Your USSD Extension</p>
            <p className="text-[#dfba60] font-mono font-bold text-xl">{profile?.ussdCode}</p>
          </div>
        )}
      </div>

      {/* Read-only Fields Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex space-x-3 text-xs text-amber-800">
        <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="font-semibold">Platform Managed Fields</p>
          <p className="text-amber-700 mt-0.5">
            Your USSD extension code, commission rates, and application status are managed by the platform administration.
          </p>
        </div>
      </div>

      {/* Personal Info Form */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <h2 className="text-base font-bold text-gray-800 mb-5 font-serif">Personal & Business Information</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
              <input name="fullName" defaultValue={fullName} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c18]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Business Name</label>
              <input name="businessName" defaultValue={profile?.businessName || ''} placeholder="e.g. JM Sales" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c18]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number</label>
              <input name="phoneNumber" defaultValue={phone} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c18]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
              <input name="email" defaultValue={email} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c18]" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Location / City</label>
              <input name="location" defaultValue={profile?.location || ''} placeholder="e.g. Accra, Greater Accra" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c18]" />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingProfile}
              className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${savedProfile ? 'bg-emerald-500 text-white' : 'bg-[#1a5c18] hover:bg-[#154a14] text-white'}`}
            >
              {isSavingProfile ? 'Saving Profile...' : savedProfile ? '✓ Profile Saved' : 'Save Personal Details'}
            </button>
          </div>
        </form>
      </div>

      {/* Payout Details Form */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <h2 className="text-base font-bold text-gray-800 mb-2 font-serif">Payout Account Details</h2>
        <p className="text-xs text-gray-500 mb-6">Specify where you would like your commission earnings paid out.</p>

        {/* Method selector */}
        <div className="flex space-x-3 mb-6">
          <button
            type="button"
            onClick={() => setSelectedPaymentType('MOBILE_MONEY')}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              selectedPaymentType === 'MOBILE_MONEY' ? 'border-[#1a5c18] bg-[#1a5c18]/5 text-[#1a5c18]' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <span>📱 Mobile Money</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPaymentType('BANK')}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              selectedPaymentType === 'BANK' ? 'border-[#1a5c18] bg-[#1a5c18]/5 text-[#1a5c18]' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <span>🏦 Bank Account</span>
          </button>
        </div>

        <form onSubmit={handleSavePayment} className="space-y-4">
          {selectedPaymentType === 'MOBILE_MONEY' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">MoMo Network</label>
                <select
                  value={momoFields.network}
                  onChange={e => setMomoFields(p => ({ ...p, network: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c18] bg-white"
                >
                  <option value="MTN">MTN Mobile Money</option>
                  <option value="Telecel">Telecel Cash</option>
                  <option value="AirtelTigo">ATMoney (AirtelTigo)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">MoMo Phone Number</label>
                <input
                  type="tel"
                  value={momoFields.phoneNumber}
                  onChange={e => { setMomoFields(p => ({ ...p, phoneNumber: e.target.value })); setPaymentErrors(p => ({ ...p, phoneNumber: '' })) }}
                  placeholder="0241234567"
                  maxLength={10}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all ${
                    paymentErrors.phoneNumber ? 'border-red-400 focus:border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#1a5c18]'
                  }`}
                />
                {paymentErrors.phoneNumber && <p className="text-red-500 text-[11px] mt-1">{paymentErrors.phoneNumber}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Account Name</label>
                <input
                  type="text"
                  value={momoFields.accountName}
                  onChange={e => { setMomoFields(p => ({ ...p, accountName: e.target.value })); setPaymentErrors(p => ({ ...p, accountName: '' })) }}
                  placeholder="Account registered name"
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all ${
                    paymentErrors.accountName ? 'border-red-400 focus:border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#1a5c18]'
                  }`}
                />
                {paymentErrors.accountName && <p className="text-red-500 text-[11px] mt-1">{paymentErrors.accountName}</p>}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Bank Name</label>
                <input
                  type="text"
                  value={bankFields.bankName}
                  onChange={e => { setBankFields(p => ({ ...p, bankName: e.target.value })); setPaymentErrors(p => ({ ...p, bankName: '' })) }}
                  placeholder="e.g. GCB Bank"
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all ${
                    paymentErrors.bankName ? 'border-red-400 focus:border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#1a5c18]'
                  }`}
                />
                {paymentErrors.bankName && <p className="text-red-500 text-[11px] mt-1">{paymentErrors.bankName}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Account Number</label>
                <input
                  type="text"
                  value={bankFields.accountNumber}
                  onChange={e => { setBankFields(p => ({ ...p, accountNumber: e.target.value.replace(/\D/g, '') })); setPaymentErrors(p => ({ ...p, accountNumber: '' })) }}
                  placeholder="1234567890"
                  maxLength={16}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all font-mono ${
                    paymentErrors.accountNumber ? 'border-red-400 focus:border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#1a5c18]'
                  }`}
                />
                {paymentErrors.accountNumber && <p className="text-red-500 text-[11px] mt-1">{paymentErrors.accountNumber}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Account Name</label>
                <input
                  type="text"
                  value={bankFields.accountName}
                  onChange={e => { setBankFields(p => ({ ...p, accountName: e.target.value })); setPaymentErrors(p => ({ ...p, accountName: '' })) }}
                  placeholder="Account registered name"
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all ${
                    paymentErrors.accountName ? 'border-red-400 focus:border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#1a5c18]'
                  }`}
                />
                {paymentErrors.accountName && <p className="text-red-500 text-[11px] mt-1">{paymentErrors.accountName}</p>}
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 pt-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm with your account password</label>
            <input
              type="password"
              value={payoutPassword}
              onChange={e => { setPayoutPassword(e.target.value); setPayoutPasswordError('') }}
              placeholder="Your account password"
              autoComplete="current-password"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all ${payoutPasswordError ? 'border-red-400' : 'border-gray-200 focus:border-[#1a5c18]'}`}
            />
            {payoutPasswordError && <p className="text-red-500 text-[11px] mt-1">{payoutPasswordError}</p>}
            <p className="text-[11px] text-gray-500 mt-1.5">For your security, withdrawals are paused for 48 hours after payout details change.</p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingPayment}
              className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${savedPayment ? 'bg-emerald-500 text-white' : 'bg-[#1a5c18] hover:bg-[#154a14] text-white'}`}
            >
              {isSavingPayment ? 'Saving Payout Details...' : savedPayment ? '✓ Payout Details Saved' : 'Save Payout Details'}
            </button>
          </div>
        </form>
      </div>

      {/* Account Logout */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-gray-800 font-serif">Log Out</h2>
          <p className="text-xs text-gray-400">Clear your active session from this device.</p>
        </div>
        <button
          onClick={affiliateLogout}
          className="px-5 py-2.5 border border-red-200 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 transition-all cursor-pointer"
        >
          Log Out
        </button>
      </div>
    </div>
  )
}
