import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { apiErrorMessage } from '../../utils/apiError'
import { MIN_PASSWORD_LENGTH } from '../../utils/passwordPolicy'
import {
  usePartnerProfile,
  useUpdatePartnerProfile,
  useChangePartnerPassword,
} from '../../hooks/usePartner'

export default function PartnerProfilePage() {
  const { data: profile, isLoading } = usePartnerProfile()
  const { mutate: updateProfile, isPending: isUpdating } = useUpdatePartnerProfile()
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePartnerPassword()

  const [partnerName, setPartnerName] = useState(profile?.partnerName || 'Apex Capital & Technology Partners')
  const [legalEntityName, setLegalEntityName] = useState(profile?.legalEntityName || 'Apex Capital Ventures Ltd (Ghana)')
  const [email, setEmail] = useState(profile?.email || 'partners@apexcap.gh')
  const [phone, setPhone] = useState(profile?.phone || '+233 24 555 8921')
  const [updateSuccess, setUpdateSuccess] = useState(false)

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState(false)

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile(
      { partnerName, legalEntityName, email, phone },
      {
        onSuccess: () => {
          setUpdateSuccess(true)
          setTimeout(() => setUpdateSuccess(false), 2500)
        },
      }
    )
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPwdError('')

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPwdError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters long.`)
      return
    }

    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.')
      return
    }

    changePassword(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setPwdSuccess(true)
          setCurrentPassword('')
          setNewPassword('')
          setConfirmPassword('')
          setTimeout(() => setPwdSuccess(false), 2500)
        },
        onError: (err: unknown) => {
          setPwdError(apiErrorMessage(err, 'Failed to change password.'))
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs text-gray-400">Loading partner profile...</div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <Helmet>
        <title>Partner Profile & Legal Agreement — CivicTree</title>
      </Helmet>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-gray-900">Partner Profile & Legal Entity</h1>
        <p className="text-xs text-gray-500 mt-1">
          Manage your contact credentials, review contract terms, and update account security.
        </p>
      </div>

      {/* Contract Agreement Highlight Card */}
      <div className="bg-gradient-to-r from-[#153e14] to-[#205e1e] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(223,186,96,0.25),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="px-3 py-1 rounded-full bg-[#dfba60]/20 text-[#dfba60] text-xs font-bold border border-[#dfba60]/30 uppercase tracking-wide">
              Contract Ref: {profile?.contractRef || 'CTR-REV-2026-04'}
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold mt-2.5">
              {profile?.partnerName}
            </h2>
            <p className="text-xs text-white/70 mt-1 max-w-xl">
              Official partner agreement for continuous {profile?.sharePercentage || 5.0}% revenue-share allocation on all nationwide result checker voucher sales.
            </p>
          </div>

          {/* Key Terms */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shrink-0 text-right space-y-1">
            <p className="text-[10px] text-white/60 uppercase tracking-wider">Revenue Cut</p>
            <p className="text-3xl font-mono font-bold text-[#dfba60]">{profile?.sharePercentage || 5.0}%</p>
            <p className="text-[10px] text-white/60">Status: <span className="text-emerald-300 font-bold">{profile?.status}</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Contact Info Form (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs">
          <h2 className="text-base font-bold text-gray-900 mb-1">Entity & Contact Details</h2>
          <p className="text-xs text-gray-400 mb-6">These details appear on official remittance receipts.</p>

          {updateSuccess && (
            <div className="mb-5 p-3.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200">
              Profile details updated successfully!
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Partner / Firm Display Name
              </label>
              <input
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                required
                className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#153e14]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Registered Legal Entity Name
              </label>
              <input
                type="text"
                value={legalEntityName}
                onChange={(e) => setLegalEntityName(e.target.value)}
                required
                className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#153e14]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Official Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#153e14]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#153e14]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isUpdating}
                className="px-6 py-3 bg-[#153e14] hover:bg-[#1a4f19] text-[#dfba60] text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Security & Password (1 col) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-1">Account Security</h2>
            <p className="text-xs text-gray-400 mb-5">Update your account password</p>

            {pwdSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl">
                Password updated successfully!
              </div>
            )}

            {pwdError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl">
                {pwdError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#153e14]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#153e14]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#153e14]"
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full mt-2 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 text-[11px] text-gray-400">
            For contract adjustments or legal changes, please contact CivicTree executive legal desk at <a href="mailto:legal@civictreegh.com" className="text-[#153e14] underline">legal@civictreegh.com</a>.
          </div>
        </div>
      </div>
    </div>
  )
}
