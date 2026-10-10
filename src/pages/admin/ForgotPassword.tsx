import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { z } from 'zod'
import AuthLayout from '../../components/admin/layout/AuthLayout'
import { useForgotPassword } from '../../hooks/useAuth'

const forgotPasswordSchema = z.object({
  email: z.string().trim().email({ message: 'Please enter a valid email address' }),
})

type ForgotPasswordFields = z.infer<typeof forgotPasswordSchema>

export default function ForgotPassword() {
  const { mutate: requestOtp, isPending: isLoading } = useForgotPassword()
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Partial<Record<keyof ForgotPasswordFields, string>>>({})
  const [globalError, setGlobalError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setGlobalError(null)

    const validation = forgotPasswordSchema.safeParse({ email })

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors
      setErrors({
        email: fieldErrors.email?.[0],
      })
      return
    }

    requestOtp(
      { email: validation.data.email.toLowerCase() },
      {
        onError: (err) => {
          const serverMessage = axios.isAxiosError<{ message?: string }>(err)
            ? err.response?.data?.message
            : undefined
          setGlobalError(serverMessage || 'Could not send a verification code. Please try again later.')
        },
      }
    )
  }

  return (
    <AuthLayout
      brandTitle="Recover Password"
      brandDescription="Verify your identity via a One-Time Password sent to your administrator address to set up a new password credentials block."
    >
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-heading font-bold text-primary">ForgotPassword?</h1>
        <p className="text-gray-500 text-sm mt-1">Provide your email address to receive an verification OTP code</p>
      </div>

      {/* Alerts */}
      {globalError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start space-x-3 text-red-800 text-sm animate-shake">
          <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-semibold">Verification Request Failed</p>
            <p className="opacity-90">{globalError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-text-primary/80 uppercase tracking-wider mb-2">
            Registered Email
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </span>
            <input
              type="text"
              id="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className={`w-full pl-11 pr-4 py-3.5 rounded-xl border bg-gray-50/50 text-sm font-sans focus:outline-none focus:ring-2 transition-all duration-300 ${
                errors.email
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                  : 'border-gray-200 focus:ring-light-green/45 focus:border-primary'
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-600 font-sans flex items-center">
              <span className="mr-1">&bull;</span> {errors.email}
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
              <span>Requesting verification code...</span>
            </>
          ) : (
            <>
              <span>Send OTP Code</span>
              <svg className="w-4 h-4 text-accent transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>

        {/* Back to Login */}
        <div className="text-center mt-4">
          <Link
            to="/admin/login"
            className="text-xs font-semibold text-secondary hover:text-primary transition-colors flex items-center justify-center space-x-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Login</span>
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
