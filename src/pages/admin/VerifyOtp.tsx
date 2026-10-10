import React, { useState, useEffect } from 'react'
import { useLocation, Link, Navigate } from 'react-router-dom'
import axios from 'axios'
import AuthLayout from '../../components/admin/layout/AuthLayout'
import OtpInput from '../../components/admin/auth/OtpInput'
import { useVerifyOtp } from '../../hooks/useAuth'
import { apiClient } from '../../lib/apiClient'
import { ENDPOINTS } from '../../services/endpoints'

const serverMessage = (err: unknown) =>
  axios.isAxiosError<{ message?: string }>(err) ? err.response?.data?.message : undefined

export default function VerifyOtp() {
  const location = useLocation()
  const hasEmail = typeof location.state?.email === 'string'
  const email: string = hasEmail ? location.state.email : 'your email'
  const { mutate: verifyOtp, isPending: isLoading } = useVerifyOtp()

  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''))
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [timer, setTimer] = useState(60)
  const isTimerActive = timer > 0

  useEffect(() => {
    if (timer <= 0) return
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [timer])

  // This page only makes sense after requesting a code for an email address
  if (!hasEmail) {
    return <Navigate to="/admin/forgot-password" replace />
  }

  const handleResend = () => {
    setTimer(60)
    setGlobalError(null)
    setOtp(new Array(6).fill(''))
    apiClient
      .post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email })
      .catch((err) => setGlobalError(serverMessage(err) || 'Could not send a new code. Please try again later.'))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setGlobalError(null)

    const enteredOtp = otp.join('')

    if (enteredOtp.length < 6) {
      setGlobalError('Please enter all 6 digits of the verification code.')
      return
    }

    verifyOtp(
      { email, otp: enteredOtp },
      {
        onError: (err) => {
          setGlobalError(serverMessage(err) || 'Invalid or expired verification code.')
        },
      }
    )
  }

  return (
    <AuthLayout
      brandTitle="Verify Code"
      brandDescription="We sent a verification code to your device. Verify this 6-digit code to authorize security updates to your credentials store."
    >
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-heading font-bold text-primary">Enter OTP Code</h1>
        <p className="text-gray-500 text-sm mt-2">
          A 6-digit One-Time Password was sent to <span className="font-semibold text-text-primary">{email}</span>. Please input it below:
        </p>
      </div>

      {/* Alerts */}
      {globalError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start space-x-3 text-red-800 text-sm text-left animate-shake">
          <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-semibold">OTP Verification Failed</p>
            <p className="opacity-90">{globalError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP Input Grid */}
        <OtpInput value={otp} onChange={setOtp} disabled={isLoading} />

        {/* Timer / Resend Code */}
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-gray-400">
            {isTimerActive ? (
              <span>Resend code in <strong className="text-primary">{timer}s</strong></span>
            ) : (
              <span>Didn't receive a code?</span>
            )}
          </span>
          {!isTimerActive && (
            <button
              type="button"
              onClick={handleResend}
              className="text-secondary hover:text-primary hover:underline transition-colors cursor-pointer"
            >
              Resend OTP Code
            </button>
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
              <span>Verifying code...</span>
            </>
          ) : (
            <>
              <span>Verify Code</span>
              <svg className="w-4 h-4 text-accent transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>

        {/* Back to Request Link */}
        <div className="text-center">
          <Link
            to="/admin/forgot-password"
            className="text-xs font-semibold text-secondary hover:text-primary transition-colors flex items-center justify-center space-x-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Edit email address</span>
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
