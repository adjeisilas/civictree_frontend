import React, { useState } from 'react'
import { useAuthStore } from '../../services/authStore'
import { MIN_PASSWORD_LENGTH } from '../../utils/passwordPolicy'
import { useUpdateProfile, useChangePassword } from '../../hooks/useProfile'
import { useActivityLogs } from '../../hooks/useUsers'

export default function Profile() {
  const { user } = useAuthStore()

  // Profile Edit States
  const [profileName, setProfileName] = useState(user?.name || 'Admin User')
  const [profileEmail, setProfileEmail] = useState(user?.email || 'admin@civictree.com')
  const [profilePhone, setProfilePhone] = useState(user?.phoneNumber || '')
  const [profileTitle, setProfileTitle] = useState('Super Administrator')
  const [profileBio, setProfileBio] = useState('Managing voucher distribution network, carrier SMS configurations, and USSD payment gateways for CivicTree Ghana.')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile()
  const { mutate: changePassword, isPending: isUpdatingPassword } = useChangePassword()

  const { data: activityData, isLoading: isLoadingActivity } = useActivityLogs(1, 5, user?.id)

  // Change Password States
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Avatar Options
  const avatarColors = [
    { name: 'Forest Green', bg: 'bg-primary/20 border-primary/30 text-primary', fill: '#294f26' },
    { name: 'Ocean Blue', bg: 'bg-blue-100 border-blue-200 text-blue-700', fill: '#1E40AF' },
    { name: 'Sunset Amber', bg: 'bg-amber-100 border-amber-200 text-amber-700', fill: '#B45309' },
    { name: 'Teal Lagoon', bg: 'bg-teal-100 border-teal-200 text-teal-700', fill: '#0F766E' },
    { name: 'Grape Purple', bg: 'bg-purple-100 border-purple-200 text-purple-700', fill: '#6B21A8' }
  ]
  const [selectedAvatarColor, setSelectedAvatarColor] = useState(0)

  // Session Toggles (Removed unused state)

  // Password Strength Meter
  const getPasswordStrength = () => {
    if (!newPassword) return { score: 0, text: 'No password', color: 'bg-gray-200', textClass: 'text-gray-400' }
    let score = 0
    if (newPassword.length >= 6) score += 1
    if (/[A-Z]/.test(newPassword)) score += 1
    if (/[0-9]/.test(newPassword)) score += 1
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1

    if (score <= 1) return { score, text: 'Weak', color: 'bg-red-500', textClass: 'text-red-500' }
    if (score === 2) return { score, text: 'Fair', color: 'bg-amber-500', textClass: 'text-amber-500' }
    if (score === 3) return { score, text: 'Good', color: 'bg-blue-500', textClass: 'text-blue-500' }
    return { score, text: 'Strong', color: 'bg-emerald-500', textClass: 'text-emerald-500' }
  }

  const strength = getPasswordStrength()

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
    <div className="space-y-6 max-w-7xl mx-auto">
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

      {/* Profile Overview Header Card */}
      <div className="pb-1">
        
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
            {/* Round Avatar Container */}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 border-gray-200 font-serif font-bold text-3xl transition-colors shadow-lg ${avatarColors[selectedAvatarColor].bg.split(' ')[0]} ${avatarColors[selectedAvatarColor].bg.split(' ')[2]}`}>
              {profileName.charAt(0)}
            </div>
            
            <div className="space-y-1">
              <div className="flex flex-col md:flex-row items-center gap-2">
                <h1 className="font-heading text-[26px] leading-tight text-text-primary">{profileName}</h1>
                <span className="text-xs font-bold text-[#a1781b] bg-[#dfba60]/25 border border-[#dfba60]/30 px-2 py-0.5 rounded-full">
                  {user?.role || 'Super Admin'}
                </span>
              </div>
              <p className="text-gray-600 text-xs font-sans font-medium">{profileTitle}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Main Two Column Config */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar Customizer & Recent Activity */}
        <div className="space-y-6">
          
          {/* Avatar Theme Selection */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 border-b border-gray-50 pb-2">
              Select Avatar Profile Theme
            </h3>
            
            <div className="flex flex-wrap gap-2.5">
              {avatarColors.map((color, idx) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedAvatarColor(idx)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all cursor-pointer hover:scale-105 active:scale-95 ${color.bg} ${
                    selectedAvatarColor === idx ? 'ring-2 ring-primary ring-offset-2 scale-105' : 'opacity-80'
                  }`}
                  title={color.name}
                >
                  {profileName.charAt(0)}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 leading-normal">
              Selecting a theme changes the avatar background highlight color across the sidebar card, header menu, and profile headers.
            </p>
          </div>

          {/* Activity Feed */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 border-b border-gray-50 pb-2">
              Recent System Activity logs
            </h3>
            
            <div className="space-y-3.5 text-xs font-semibold text-gray-600">
              {isLoadingActivity ? (
                <div className="text-center py-4 text-gray-400">Loading activity logs...</div>
              ) : activityData?.logs && activityData.logs.length > 0 ? (
                activityData.logs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      log.status === 'Failed' ? 'bg-red-500' :
                      log.status === 'Warning' ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`} />
                    <div className="space-y-0.5">
                      <p className="text-text-primary">{log.action}</p>
                      <p className="text-[11px] text-gray-400">
                        {log.timestamp} &middot; IP {log.ipAddress} &middot; {log.device}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-400">No recent activity</div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Profile Edit & Security Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* General Account Details */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 border-b border-gray-50 pb-2">
              Profile & Contact Information
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-semibold text-gray-600">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-gray-400 text-[11px]">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-primary font-semibold text-text-primary"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-gray-400 text-[11px]">Email Address</label>
                  <input
                    type="email"
                    required
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-primary font-semibold text-text-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-gray-400 text-[11px]">Primary Phone</label>
                  <input
                    type="text"
                    required
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-primary font-semibold text-text-primary"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-gray-400 text-[11px]">Professional Title</label>
                  <input
                    type="text"
                    required
                    value={profileTitle}
                    onChange={(e) => setProfileTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-primary font-semibold text-text-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 text-[11px]">Personal Bio Description</label>
                <textarea
                  rows={3}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-primary font-medium text-gray-700 leading-normal resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-[#dfba60] hover:bg-[#cfa54f] text-primary font-bold rounded-xl active:scale-98 transition-all disabled:opacity-50 shadow-sm cursor-pointer inline-flex items-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Saving Profile Details...</span>
                    </>
                  ) : (
                    <span>Save Profile Settings</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Password & Security Configurations */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 border-b border-gray-50 pb-2">
              Credentials & Password Security
            </h3>

            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs font-semibold text-gray-600">
              {passwordError && (
                <p className="text-xs text-red-600 font-bold bg-red-50 p-2.5 rounded-lg border border-red-100">{passwordError}</p>
              )}
              
              <div className="space-y-1.5 relative">
                <label className="text-gray-400 text-[11px]">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-primary font-semibold text-text-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showCurrentPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* New Password */}
                <div className="space-y-1.5 relative">
                  <label className="text-gray-400 text-[11px]">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-3.5 pr-10 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-primary font-semibold text-text-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showNewPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5 relative">
                  <label className="text-gray-400 text-[11px]">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full pl-3.5 pr-10 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-primary font-semibold text-text-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

              </div>

              {/* Strength Meter Grid */}
              {newPassword && (
                <div className="space-y-1.5 p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-gray-400">Password Strength:</span>
                    <span className={strength.textClass}>{strength.text}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden flex gap-0.5">
                    <div className={`h-full flex-1 transition-all duration-300 ${strength.score >= 1 ? strength.color : 'bg-transparent'}`} />
                    <div className={`h-full flex-1 transition-all duration-300 ${strength.score >= 2 ? strength.color : 'bg-transparent'}`} />
                    <div className={`h-full flex-1 transition-all duration-300 ${strength.score >= 3 ? strength.color : 'bg-transparent'}`} />
                    <div className={`h-full flex-1 transition-all duration-300 ${strength.score >= 4 ? strength.color : 'bg-transparent'}`} />
                  </div>
                  <ul className="text-[11px] text-gray-400 font-semibold list-disc list-inside space-y-0.5 leading-normal pt-1 border-t border-gray-200/50 mt-1.5">
                    <li className={newPassword.length >= 6 ? 'text-emerald-500' : ''}>At least 6 characters</li>
                    <li className={/[A-Z]/.test(newPassword) ? 'text-emerald-500' : ''}>Contains an uppercase letter</li>
                    <li className={/[0-9]/.test(newPassword) ? 'text-emerald-500' : ''}>Contains a digit number</li>
                    <li className={/[^A-Za-z0-9]/.test(newPassword) ? 'text-emerald-500' : ''}>Contains a special symbol</li>
                  </ul>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-5 py-2.5 bg-[#dfba60] hover:bg-[#cfa54f] text-primary font-bold rounded-xl active:scale-98 transition-all disabled:opacity-50 shadow-sm cursor-pointer inline-flex items-center space-x-2"
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
    </div>
  )
}
