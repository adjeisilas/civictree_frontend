import React, { useState } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import axios from 'axios'
import { z } from 'zod'
import AuthLayout from '../../components/admin/layout/AuthLayout'
import { useResetPassword } from '../../hooks/useAuth'
import { MIN_PASSWORD_LENGTH } from '../../utils/passwordPolicy'

const resetPasswordSchema = z.object({
  password: z.string().min(MIN_PASSWORD_LENGTH, { message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long` }),
  confirmPassword: z.string().min(1, { message: 'Please confirm your new password' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type ResetPasswordFields = z.infer<typeof resetPasswordSchema>

export default function ResetPassword() {
  const location = useLocation()
  const { mutate: resetUserPassword, isPending: isLoading } = useResetPassword()

  const email: string = location.state?.email
  const otp: string = location.state?.otp
  const isVerified = Boolean(location.state?.verified && email && otp)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof ResetPasswordFields, string>>>({})
  const [globalError, setGlobalError] = useState<string | null>(null)

  // Route security: block direct visits to this URL without OTP verification
  if (!isVerified) {
    return <Navigate to="/admin/forgot-password" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setGlobalError(null)

    const validation = resetPasswordSchema.safeParse({ password, confirmPassword })

    if (!validation.success) {
      const formattedErrors = validation.error.flatten().fieldErrors
      setErrors({
        password: formattedErrors.password?.[0],
        confirmPassword: formattedErrors.confirmPassword?.[0],
      })
      return
    }

    resetUserPassword(
      { email, otp, newPassword: password, confirmPassword },
      {
        onError: (err) => {
          const serverMessage = axios.isAxiosError<{ message?: string }>(err)
            ? err.response?.data?.message
            : undefined
          setGlobalError(serverMessage || 'Could not reset your password. Please request a new code and try again.')
        },
      }
    )
  }

  return (
    <AuthLayout
      brandTitle="Reset Password"
      brandDescription="Create a new secure credentials payload. Avoid repeating historical passwords to maintain compliance standards."
    >
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-heading font-bold text-primary">Set New Password</h1>
        <p className="text-gray-500 text-sm mt-1">Configure credentials for account <span className="font-semibold text-text-primary">{email}</span></p>
      </div>

      {/* Alerts */}
      {globalError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start space-x-3 text-red-800 text-sm animate-shake">
          <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-semibold">Reset Failed</p>
            <p className="opacity-90">{globalError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-text-primary/80 mb-2">
            New Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className={`w-full pl-11 pr-12 py-3.5 rounded-xl border bg-gray-50/50 text-sm font-sans focus:outline-none focus:ring-2 transition-all duration-300 ${
                errors.password
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                  : 'border-gray-200 focus:ring-light-green/45 focus:border-primary'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-600 font-sans flex items-center">
              <span className="mr-1">&bull;</span> {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-semibold text-text-primary/80 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              className={`w-full pl-11 pr-12 py-3.5 rounded-xl border bg-gray-50/50 text-sm font-sans focus:outline-none focus:ring-2 transition-all duration-300 ${
                errors.confirmPassword
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                  : 'border-gray-200 focus:ring-light-green/45 focus:border-primary'
              }`}
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-red-600 font-sans flex items-center">
              <span className="mr-1">&bull;</span> {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 bg-primary hover:bg-secondary active:scale-[0.99] text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none cursor-pointer"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Updating credentials...</span>
            </>
          ) : (
            <>
              <span>Reset Password</span>
              <svg className="w-4 h-4 text-accent transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  )
}
