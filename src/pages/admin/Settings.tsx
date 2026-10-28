import React, { useState } from 'react'
import { useAuthStore } from '../../services/authStore'
import TwoFactorCard from '../../components/admin/settings/TwoFactorCard'
import { MIN_PASSWORD_LENGTH } from '../../utils/passwordPolicy'
import { useUpdateProfile, useChangePassword } from '../../hooks/useProfile'
import { useSettings, useUpdateSettings } from '../../hooks/useSettings'
import { VOUCHER_TYPES } from '../../config/voucherTypes'
import type { ExamType } from '../../types/admin'
import type { UpdateReleaseDatesPayload } from '../../hooks/useSettings'

export default function Settings() {
  const { user } = useAuthStore()

  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Profile Edit States
  const [profileName, setProfileName] = useState(user?.name || 'Admin User')
  const [profileEmail, setProfileEmail] = useState(user?.email || 'admin@civictree.com')
  const [profilePhone, setProfilePhone] = useState(user?.phoneNumber || '')
  const [profileRole, setProfileRole] = useState(user?.role || 'Super Admin')

  // Change Password States
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const { mutate: updateProfile, isPending: isSavingProfile } = useUpdateProfile()
  const { mutate: changePassword, isPending: isUpdatingPassword } = useChangePassword()

  // Platform Settings
  const { data: settings } = useSettings()
  const { mutate: updateSettings, isPending: isSavingSettings } = useUpdateSettings()

  // One date per voucher type, keyed by type code
  const savedReleaseDates = Object.fromEntries(
    VOUCHER_TYPES.map((v) => [v.type, settings?.releaseDates?.[v.type] || ''])
  ) as Record<ExamType, string>

  // The inputs follow the saved dates until the admin picks new ones
  const [releaseDateEdits, setReleaseDates] = useState<typeof savedReleaseDates | null>(null)
  const releaseDates = releaseDateEdits ?? savedReleaseDates

  const handleSaveReleaseDates = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Convert local YYYY-MM-DD to the ISO strings the API expects, per type
    const payload = Object.fromEntries(
      VOUCHER_TYPES.map((v) => [
        v.releaseDateField,
        releaseDates[v.type] ? new Date(releaseDates[v.type]).toISOString() : null,
      ])
    ) as UpdateReleaseDatesPayload

    updateSettings(
      payload,
      {
        onSuccess: () => {
          setReleaseDates(null)
          setToastMessage('Release dates updated successfully!')
          setTimeout(() => setToastMessage(null), 3000)
        },
        onError: () => {
          setToastMessage('Failed to update release dates.')
          setTimeout(() => setToastMessage(null), 3000)
        }
      }
    )
  }

  // Profile Save action
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    
    updateProfile({
      fullName: profileName,
      email: profileEmail,
      phoneNumber: profilePhone
    }, {
      onSuccess: () => {
        setToastMessage('Profile details successfully updated!')
        setTimeout(() => setToastMessage(null), 3000)
      },
      onError: () => {
        setToastMessage('Failed to update profile details.')
        setTimeout(() => setToastMessage(null), 3000)
      }
    })
  }

  // Password Change Action
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)

    if (!currentPassword) {
      setPasswordError('Please enter your current password.')
      return
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters long.`)
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }

    changePassword({
      currentPassword,
      newPassword,
      confirmPassword
    }, {
      onSuccess: () => {
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setToastMessage('Password successfully updated!')
        setTimeout(() => setToastMessage(null), 3000)
      },
      onError: () => {
        setPasswordError('Failed to change password. Please check your current password.')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-primary border border-accent text-white px-4 py-3 rounded-xl shadow-lg z-50 animate-bounce flex items-center space-x-2 text-xs font-semibold">
          <svg className="w-4 h-4 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Page Title Header Banner */}
      <div className="pb-1">
        <div className="z-10 relative">
          <h2 className="font-heading text-[26px] leading-tight text-text-primary">System Settings & Profile</h2>
          <p className="text-[13px] text-gray-600 mt-1 max-w-3xl">
            Configure your administrative account profile, update contact information, and manage security credentials.
          </p>
        </div>
      </div>

      <div className="animate-fadeIn">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Box: Profile Info Form */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 border-b border-gray-50 pb-2">
              Edit Admin Profile Info
            </h3>
            
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-semibold text-gray-600">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-gray-400 text-[11px]">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-primary font-semibold text-text-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-gray-400 text-[11px]">Email Address</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-primary font-semibold text-text-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-gray-400 text-[11px]">Primary Phone</label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-primary font-semibold text-text-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-gray-400 text-[11px]">System Role</label>
                  <input
                    type="text"
                    value={profileRole}
                    onChange={(e) => setProfileRole(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl bg-gray-100 font-semibold text-gray-500 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2.5 bg-[#dfba60] hover:bg-[#cfa54f] text-primary font-bold rounded-xl active:scale-98 transition-all disabled:opacity-50 shadow-sm cursor-pointer inline-flex items-center space-x-2"
                >
                  {isSavingProfile ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Box: Change Password */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 border-b border-gray-50 pb-2">
              Change Password
            </h3>

            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs font-semibold text-gray-600">
              {passwordError && (
                <p className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded-lg border border-red-100">{passwordError}</p>
              )}
              
              <div className="space-y-1.5">
                <label className="text-gray-400 text-[11px]">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-primary font-semibold text-text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 text-[11px]">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-primary font-semibold text-text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 text-[11px]">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-primary font-semibold text-text-primary"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="w-full py-2.5 bg-[#dfba60] hover:bg-[#cfa54f] text-primary font-bold rounded-xl active:scale-98 transition-all disabled:opacity-50 shadow-sm cursor-pointer inline-flex items-center justify-center space-x-2"
                >
                  {isUpdatingPassword ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* Settings Section: Two-Step Verification */}
      <div className="animate-fadeIn mt-6">
        <TwoFactorCard />
      </div>

      {/* Settings Section: Release Dates */}
      <div className="animate-fadeIn mt-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <h3 className="text-xs font-bold text-gray-400 border-b border-gray-50 pb-2">
            Exam Result Release Dates
          </h3>
          <p className="text-xs text-gray-500 font-medium">Configure the anticipated or official result release dates. This information can be displayed to customers on the frontend platform.</p>
          
          <form onSubmit={handleSaveReleaseDates} className="space-y-4 text-xs font-semibold text-gray-600">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {VOUCHER_TYPES.map((v) => (
                <div key={v.type} className="space-y-1.5">
                  <label className="text-gray-400 text-[11px]">
                    {v.displayName} Release Date
                  </label>
                  <input
                    type="date"
                    value={releaseDates[v.type]}
                    onChange={(e) => setReleaseDates({ ...releaseDates, [v.type]: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-primary font-semibold text-text-primary"
                  />
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-5 py-2.5 bg-[#dfba60] hover:bg-[#cfa54f] text-primary font-bold rounded-xl active:scale-98 transition-all disabled:opacity-50 shadow-sm cursor-pointer inline-flex items-center space-x-2"
              >
                {isSavingSettings ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Release Dates</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Spacer bottom */}
      <div className="h-4" />
    </div>
  )
}
