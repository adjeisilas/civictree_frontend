import React, { useState } from 'react'
import { X, Loader2, UserPlus, Wallet, Building2, AlertCircle, CheckCircle2, Key, MapPin, Phone, Mail } from 'lucide-react'
import { useAdminCreateAffiliate } from '../../../hooks/useAffiliates'
import type { AdminCreateAffiliatePayload } from '../../../types/affiliate'
import { MIN_PASSWORD_LENGTH } from '../../../utils/passwordPolicy'

interface AdminCreateAffiliateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (affiliateName: string) => void
}

export default function AdminCreateAffiliateModal({ isOpen, onClose, onSuccess }: AdminCreateAffiliateModalProps) {
  const { mutate: createAffiliate, isPending, isSuccess, error, reset } = useAdminCreateAffiliate()

  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    phoneNumber: '',
    email: '',
    location: '',
    password: '',
    status: 'APPROVED' as 'APPROVED' | 'ACTIVE' | 'PENDING',
    ussdCode: '',
    payoutMethod: 'MOBILE_MONEY' as 'MOBILE_MONEY' | 'BANK_ACCOUNT',
    momoNetwork: 'MTN',
    momoNumber: '',
    momoAccountName: '',
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: ''
  })

  // Reset state when closed or opened
  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFormData({
          fullName: '',
          businessName: '',
          phoneNumber: '',
          email: '',
          location: '',
          password: '',
          status: 'APPROVED',
          ussdCode: '',
          payoutMethod: 'MOBILE_MONEY',
          momoNetwork: 'MTN',
          momoNumber: '',
          momoAccountName: '',
          bankName: '',
          bankAccountNumber: '',
          bankAccountName: ''
        })
        reset()
      }, 300)
    }
  }, [isOpen, reset])

  if (!isOpen) return null

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#'
    let pass = 'Aff_'
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    handleInputChange('password', pass)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const payload: AdminCreateAffiliatePayload = {
      fullName: formData.fullName.trim(),
      businessName: formData.businessName.trim() || undefined,
      phoneNumber: formData.phoneNumber.trim(),
      email: formData.email.trim(),
      location: formData.location.trim() || undefined,
      password: formData.password,
      status: formData.status,
      ussdCode: formData.ussdCode.trim() || undefined,
      payoutMethod: formData.payoutMethod
    }

    if (formData.payoutMethod === 'MOBILE_MONEY') {
      if (formData.momoNumber) {
        payload.momoNetwork = formData.momoNetwork
        payload.momoNumber = formData.momoNumber.trim()
        payload.momoAccountName = (formData.momoAccountName || formData.fullName).trim()
      }
    } else {
      if (formData.bankAccountNumber) {
        payload.bankName = formData.bankName.trim()
        payload.bankAccountNumber = formData.bankAccountNumber.trim()
        payload.bankAccountName = (formData.bankAccountName || formData.fullName).trim()
      }
    }

    createAffiliate(payload, {
      onSuccess: () => {
        if (onSuccess) onSuccess(formData.fullName)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-[#1a5c18] to-[#2d7a2a] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif tracking-tight">Direct Affiliate Onboarding</h2>
              <p className="text-xs text-white/80">Manually provision and activate a new sales agent</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center text-white/90 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 font-serif mb-2">Affiliate Account Created!</h3>
              <p className="text-gray-600 text-sm max-w-md mb-6">
                <span className="font-semibold text-gray-900">{formData.fullName}</span> has been successfully onboarded with status <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">{formData.status}</span>.
                {formData.ussdCode && (
                  <span className="block mt-2 font-mono font-bold text-[#1a5c18] bg-[#1a5c18]/10 py-1 px-3 rounded-lg border border-[#1a5c18]/20">
                    USSD Assigned: {formData.ussdCode}
                  </span>
                )}
              </p>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-[#1a5c18] hover:bg-[#154a14] text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-7">
              
              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-xs sm:text-sm flex items-start gap-3">
                  <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
                  <div>
                    <p className="font-bold mb-0.5">Failed to create affiliate account</p>
                    <p>{error.message || 'Please verify the details and ensure email/phone is unique.'}</p>
                  </div>
                </div>
              )}

              {/* Section 1: Identity */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 border-b border-gray-200 pb-2 mb-4 flex items-center gap-1.5">
                  <span>1. Personal & Business Details</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Mensah"
                      value={formData.fullName}
                      onChange={e => handleInputChange('fullName', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5c18] focus:ring-2 focus:ring-[#1a5c18]/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Business Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Mensah Bookshop"
                      value={formData.businessName}
                      onChange={e => handleInputChange('businessName', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5c18] focus:ring-2 focus:ring-[#1a5c18]/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Phone Number *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 0241234567"
                        value={formData.phoneNumber}
                        onChange={e => handleInputChange('phoneNumber', e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5c18] focus:ring-2 focus:ring-[#1a5c18]/10 transition-all font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Address *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. name@example.com"
                        value={formData.email}
                        onChange={e => handleInputChange('email', e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5c18] focus:ring-2 focus:ring-[#1a5c18]/10 transition-all"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Location / Region (Optional)</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. Kumasi, Ashanti Region"
                        value={formData.location}
                        onChange={e => handleInputChange('location', e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5c18] focus:ring-2 focus:ring-[#1a5c18]/10 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Activation & Credentials */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 border-b border-gray-200 pb-2 mb-4 flex items-center gap-1.5">
                  <span>2. Portal Credentials & Activation</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Initial Status</label>
                    <select
                      value={formData.status}
                      onChange={e => handleInputChange('status', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-[#1a5c18] bg-white"
                    >
                      <option value="APPROVED">APPROVED (Active)</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="PENDING">PENDING</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">USSD Extension (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. *713*005#"
                      value={formData.ussdCode}
                      onChange={e => handleInputChange('ussdCode', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:border-[#1a5c18]"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-gray-700">Initial Password *</label>
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="text-[11px] font-bold text-[#1a5c18] hover:underline cursor-pointer"
                      >
                        Auto-generate
                      </button>
                    </div>
                    <div className="relative">
                      <Key className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        minLength={MIN_PASSWORD_LENGTH}
                        placeholder={`Min ${MIN_PASSWORD_LENGTH} chars`}
                        value={formData.password}
                        onChange={e => handleInputChange('password', e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:border-[#1a5c18]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Payout Account */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 border-b border-gray-200 pb-2 mb-3 flex items-center gap-1.5">
                  <span>3. Commission Payout Method</span>
                </h3>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => handleInputChange('payoutMethod', 'MOBILE_MONEY')}
                    className={`flex items-center justify-center gap-2.5 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      formData.payoutMethod === 'MOBILE_MONEY'
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 font-bold shadow-sm'
                        : 'border-gray-100 hover:border-gray-200 text-gray-500 font-medium'
                    }`}
                  >
                    <Wallet size={18} />
                    <span className="text-xs">Mobile Money</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('payoutMethod', 'BANK_ACCOUNT')}
                    className={`flex items-center justify-center gap-2.5 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      formData.payoutMethod === 'BANK_ACCOUNT'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-800 font-bold shadow-sm'
                        : 'border-gray-100 hover:border-gray-200 text-gray-500 font-medium'
                    }`}
                  >
                    <Building2 size={18} />
                    <span className="text-xs">Bank Account</span>
                  </button>
                </div>

                {formData.payoutMethod === 'MOBILE_MONEY' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Network</label>
                      <select
                        value={formData.momoNetwork}
                        onChange={e => handleInputChange('momoNetwork', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold bg-white focus:outline-none focus:border-emerald-600"
                      >
                        <option value="MTN">MTN Mobile Money</option>
                        <option value="VODAFONE">Telecel (Vodafone Cash)</option>
                        <option value="AIRTELTIGO">ATMoney (AirtelTigo)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">MoMo Phone Number</label>
                      <input
                        type="tel"
                        placeholder="e.g. 0241234567"
                        value={formData.momoNumber}
                        onChange={e => handleInputChange('momoNumber', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Account Name</label>
                      <input
                        type="text"
                        placeholder={formData.fullName || "Account holder name"}
                        value={formData.momoAccountName}
                        onChange={e => handleInputChange('momoAccountName', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                )}

                {formData.payoutMethod === 'BANK_ACCOUNT' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Bank Name</label>
                      <input
                        type="text"
                        placeholder="e.g. GCB Bank"
                        value={formData.bankName}
                        onChange={e => handleInputChange('bankName', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Account Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 10212345678"
                        value={formData.bankAccountNumber}
                        onChange={e => handleInputChange('bankAccountNumber', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Account Holder Name</label>
                      <input
                        type="text"
                        placeholder={formData.fullName || "Account name"}
                        value={formData.bankAccountName}
                        onChange={e => handleInputChange('bankAccountName', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !formData.fullName || !formData.phoneNumber || !formData.email || !formData.password}
                  className="inline-flex items-center gap-2 px-7 py-3 bg-[#1a5c18] hover:bg-[#154a14] text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:active:scale-100 cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      Onboard Affiliate
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  )
}
