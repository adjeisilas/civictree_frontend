import React, { useState } from 'react'
import { Smartphone } from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'
import axios from 'axios'
import { z } from 'zod'

import AuthLayout from '../../components/admin/layout/AuthLayout'
import { useLogin } from '../../hooks/useAuth'
import { usePWAInstall } from '../../hooks/usePWAInstall'

// Define the validation schema using Zod
const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Please enter your password' }),
})

type LoginFields = z.infer<typeof loginSchema>

export default function Login() {
  const { isInstallable, promptToInstall } = usePWAInstall()
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('pwa_install_dismissed_login') === 'true')

  const location = useLocation()
  const { mutate: loginUser, isPending: isLoading } = useLogin()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFields, string>>>({})
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setGlobalError(null)

    const validation = loginSchema.safeParse({ email, password })

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      })
      return
    }

    loginUser(
      { email, password },
      {
        onError: (err) => {
          // Show what the server said (e.g. account locked, deactivated) rather than
          // axios's generic "Request failed with status code 401"
          const serverMessage = axios.isAxiosError<{ message?: string }>(err)
            ? err.response?.data?.message
            : undefined
          setGlobalError(serverMessage || 'Invalid email or password.')
        },
      }
    )
  }

  return (
    <AuthLayout
      brandTitle="Enterprise Results Checker Portal"
      brandDescription="Securely manage vouchers, view incoming orders, coordinate SMS campaigns, and run reports from a unified, enterprise dashboard."
    >
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-heading font-bold text-primary">Welcome Back</h1>
        <p className="text-gray-500 text-sm mt-1">Sign in with your administrator credentials</p>
      </div>

      {/* Alerts */}
      {isInstallable && !dismissed && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start justify-between space-x-3 text-amber-900 text-sm animate-fade-in">
          <div className="flex items-start space-x-3">
            <Smartphone className="w-5 h-5 shrink-0 text-gray-400" strokeWidth={1.75} />
            <div>
              <p className="font-semibold text-amber-900">Install CivicTree Admin</p>
              <p className="text-amber-800 opacity-90 text-xs">Add the admin dashboard to your home screen for quick standalone access.</p>
              <button 
                type="button"
                onClick={promptToInstall}
                className="mt-2.5 px-3.5 py-1.5 bg-[#dfba60] text-primary hover:brightness-105 active:scale-95 font-bold rounded-lg text-xs transition-all shadow-sm cursor-pointer"
              >
                Install Now
              </button>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => {
              setDismissed(true)
              localStorage.setItem('pwa_install_dismissed_login', 'true')
            }}
            className="text-amber-600 hover:text-amber-900 transition-colors cursor-pointer shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      {location.state?.resetSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start space-x-3 text-emerald-800 text-sm">
          <svg className="w-5 h-5 text-success shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-semibold text-emerald-800">Password Reset Successful</p>
            <p className="opacity-90 text-emerald-700">Your new credentials are active. Please sign in below.</p>
          </div>
        </div>
      )}
      {globalError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start space-x-3 text-red-800 text-sm animate-shake">
          <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-semibold">Authentication Failed</p>
            <p className="opacity-90">{globalError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-text-primary/80 mb-2">
            Email Address
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

        {/* Password Field */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="password" className="block text-xs font-semibold text-text-primary/80">
              Password
            </label>
            <Link to="/admin/forgot-password" className="text-xs text-secondary hover:text-primary font-medium hover:underline transition-colors">
              Forgot Password?
            </Link>
          </div>
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

        {/* Remember Me */}
        <div className="flex items-center">
          <input
            id="remember_me"
            type="checkbox"
            className="w-4.5 h-4.5 text-primary focus:ring-light-green border-gray-300 rounded-md transition-all duration-200 cursor-pointer"
          />
          <label htmlFor="remember_me" className="ml-2 text-xs font-semibold text-gray-500 select-none cursor-pointer">
            Remember this device
          </label>
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
              <span>Verifying credentials...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
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
