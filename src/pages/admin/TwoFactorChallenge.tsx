import React, { useState } from 'react'
import { useLocation, Navigate, Link } from 'react-router-dom'
import axios from 'axios'
import AuthLayout from '../../components/admin/layout/AuthLayout'
import OtpInput from '../../components/admin/auth/OtpInput'
import { useTwoFactorLogin } from '../../hooks/useTwoFactor'

/**
 * Second sign-in step for accounts with two-factor: enter the 6-digit code from the
 * authenticator app, or fall back to a recovery code.
 */
export default function TwoFactorChallenge() {
  const location = useLocation()
  const challengeToken: string | undefined = location.state?.challengeToken
  const { mutate: submitCode, isPending } = useTwoFactorLogin()

  const [digits, setDigits] = useState<string[]>(new Array(6).fill(''))
  const [recoveryCode, setRecoveryCode] = useState('')
  const [useRecoveryCode, setUseRecoveryCode] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  // Reaching this page without finishing the password step means starting again
  if (!challengeToken) {
    return <Navigate to="/admin/login" replace />
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setGlobalError(null)

    const code = useRecoveryCode ? recoveryCode.trim() : digits.join('')

    if (!useRecoveryCode && code.length < 6) {
      setGlobalError('Enter all 6 digits from your authenticator app.')
      return
    }
    if (useRecoveryCode && code.length < 6) {
      setGlobalError('Enter one of your recovery codes.')
      return
    }

    submitCode(
      { challengeToken, code },
      {
        onError: (err) => {
          const serverMessage = axios.isAxiosError<{ message?: string }>(err)
            ? err.response?.data?.message
            : undefined
          setGlobalError(serverMessage || 'That code was not accepted. Please try again.')
          setDigits(new Array(6).fill(''))
        },
      }
    )
  }

  return (
    <AuthLayout
      brandTitle="Two-Step Verification"
      brandDescription="Your account is protected with an authenticator app. Enter the current code to finish signing in."
    >
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-heading font-bold text-primary">Enter your code</h1>
        <p className="text-gray-500 text-sm mt-2">
          {useRecoveryCode
            ? 'Enter one of the recovery codes you saved when you switched on two-step verification.'
            : 'Open your authenticator app and enter the 6-digit code for CivicTree Admin.'}
        </p>
      </div>

      {globalError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start space-x-3 text-red-800 text-sm">
          <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-semibold">Verification failed</p>
            <p className="opacity-90">{globalError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {useRecoveryCode ? (
          <div>
            <label htmlFor="recovery-code" className="block text-xs font-semibold text-text-primary/80 uppercase tracking-wider mb-2">
              Recovery code
            </label>
            <input
              id="recovery-code"
              type="text"
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value)}
              disabled={isPending}
              placeholder="XXXXX-XXXXX"
              autoComplete="one-time-code"
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-light-green/45 focus:border-primary"
            />
          </div>
        ) : (
          <OtpInput value={digits} onChange={setDigits} disabled={isPending} />
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 bg-primary hover:bg-secondary active:scale-[0.99] text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          {isPending ? 'Verifying...' : 'Verify and sign in'}
        </button>

        <div className="text-center space-y-2">
          <button
            type="button"
            onClick={() => {
              setUseRecoveryCode((prev) => !prev)
              setGlobalError(null)
            }}
            className="text-xs font-semibold text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            {useRecoveryCode ? 'Use my authenticator app instead' : 'I cannot use my authenticator app'}
          </button>
          <div>
            <Link to="/admin/login" className="text-xs text-gray-500 hover:text-primary transition-colors">
              Back to login
            </Link>
          </div>
        </div>
      </form>
    </AuthLayout>
  )
}
