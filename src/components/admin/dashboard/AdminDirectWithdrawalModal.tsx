import React, { useState } from 'react'
import { X, Loader2, DollarSign, Wallet, Building2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAdminDirectWithdrawal } from '../../../hooks/useAffiliates'
import { useTwoFactorStatus } from '../../../hooks/useTwoFactor'
import type { DirectWithdrawalPayload } from '../../../types/affiliate'

interface AdminDirectWithdrawalModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdminDirectWithdrawalModal({ isOpen, onClose }: AdminDirectWithdrawalModalProps) {
  const { mutate: withdraw, isPending, isSuccess, error, reset } = useAdminDirectWithdrawal()
  const { data: twoFactorStatus } = useTwoFactorStatus()
  
  const [formData, setFormData] = useState({
    amount: '',
    payoutMethod: 'MOBILE_MONEY' as 'MOBILE_MONEY' | 'BANK_ACCOUNT',
    momoNetwork: 'MTN',
    momoNumber: '',
    momoAccountName: '',
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: '',
    currentPassword: '',
    twoFactorCode: ''
  })

  // Reset form and mutation state when closed
  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFormData({
          amount: '',
          payoutMethod: 'MOBILE_MONEY',
          momoNetwork: 'MTN',
          momoNumber: '',
          momoAccountName: '',
          bankName: '',
          bankAccountNumber: '',
          bankAccountName: '',
          currentPassword: '',
          twoFactorCode: ''
        })
        reset()
      }, 300)
    }
  }, [isOpen, reset])

  if (!isOpen) return null

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clean payload based on selected payout method
    const payload: DirectWithdrawalPayload = {
      amount: parseFloat(formData.amount),
      payoutMethod: formData.payoutMethod,
      currentPassword: formData.currentPassword,
      ...(twoFactorStatus?.enabled ? { twoFactorCode: formData.twoFactorCode } : {})
    }
    
    if (formData.payoutMethod === 'MOBILE_MONEY') {
      payload.momoNetwork = formData.momoNetwork
      payload.momoNumber = formData.momoNumber
      payload.momoAccountName = formData.momoAccountName
    } else {
      payload.bankName = formData.bankName
      payload.bankAccountNumber = formData.bankAccountNumber
      payload.bankAccountName = formData.bankAccountName
    }

    withdraw(payload)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Direct Admin Withdrawal
          </h2>
          <button
            onClick={onClose}
            disabled={isPending}
            className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Withdrawal Successful!</h3>
              <p className="text-gray-500 text-sm mb-6">
                Your direct withdrawal request has been processed successfully.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm rounded-xl transition-colors"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error.message || 'An error occurred during withdrawal.'}</span>
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Amount to Withdraw (GH¢)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                  placeholder="e.g. 500"
                />
              </div>

              {/* Payout Method */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Payout Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange('payoutMethod', 'MOBILE_MONEY')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      formData.payoutMethod === 'MOBILE_MONEY'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-100 hover:border-gray-200 text-gray-500'
                    }`}
                  >
                    <Wallet size={20} className="mb-1" />
                    <span className="text-xs font-bold">Mobile Money</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('payoutMethod', 'BANK_ACCOUNT')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      formData.payoutMethod === 'BANK_ACCOUNT'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-100 hover:border-gray-200 text-gray-500'
                    }`}
                  >
                    <Building2 size={20} className="mb-1" />
                    <span className="text-xs font-bold">Bank Account</span>
                  </button>
                </div>
              </div>

              {/* Mobile Money Fields */}
              {formData.payoutMethod === 'MOBILE_MONEY' && (
                <div className="space-y-4 pt-2 border-t border-gray-200 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Network</label>
                    <select
                      required
                      value={formData.momoNetwork}
                      onChange={(e) => handleInputChange('momoNetwork', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                    >
                      <option value="MTN">MTN Mobile Money</option>
                      <option value="VODAFONE">Telecel (Vodafone) Cash</option>
                      <option value="AIRTELTIGO">ATMoney (AirtelTigo)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={formData.momoNumber}
                      onChange={(e) => handleInputChange('momoNumber', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                      placeholder="e.g. 0241234567"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Account Name</label>
                    <input
                      type="text"
                      required
                      value={formData.momoAccountName}
                      onChange={(e) => handleInputChange('momoAccountName', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                </div>
              )}

              {/* Bank Fields */}
              {formData.payoutMethod === 'BANK_ACCOUNT' && (
                <div className="space-y-4 pt-2 border-t border-gray-200 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Bank Name</label>
                    <input
                      type="text"
                      required
                      value={formData.bankName}
                      onChange={(e) => handleInputChange('bankName', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                      placeholder="e.g. GCB Bank"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Account Number</label>
                    <input
                      type="text"
                      required
                      value={formData.bankAccountNumber}
                      onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                      placeholder="e.g. 1234567890"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Account Name</label>
                    <input
                      type="text"
                      required
                      value={formData.bankAccountName}
                      onChange={(e) => handleInputChange('bankAccountName', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                </div>
              )}

              {/* Confirm with password: this sends real money */}
              <div className="pt-4 border-t border-gray-200">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Confirm with your password</label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                  placeholder="Your admin password"
                />
                {twoFactorStatus?.enabled && (
                  <div className="mt-3">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Code from your authenticator app</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={11}
                      value={formData.twoFactorCode}
                      onChange={(e) => handleInputChange('twoFactorCode', e.target.value)}
                      autoComplete="one-time-code"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono tracking-widest"
                      placeholder="123456"
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isPending || !formData.amount || !formData.currentPassword || (twoFactorStatus?.enabled === true && formData.twoFactorCode.length < 6)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-[#284c25] text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign size={18} /> Confirm Withdrawal
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
