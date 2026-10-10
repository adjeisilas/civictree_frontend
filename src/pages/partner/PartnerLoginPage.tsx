import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { apiErrorMessage } from '../../utils/apiError'
import { useNavigate } from 'react-router-dom'
import { usePartnerStore } from '../../stores/partnerStore'
import { apiClient } from '../../lib/apiClient'
import { ENDPOINTS } from '../../services/endpoints'

export default function PartnerLoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, partnerLogin } = usePartnerStore()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/partner/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const [email, setEmail] = useState('partners@apexcap.gh')
  const [password, setPassword] = useState('password123')
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!email || !password) {
      setErrorMessage('Please enter both email address and password.')
      return
    }

    setIsLoading(true)

    try {
      const response = await apiClient.post(ENDPOINTS.PARTNER.LOGIN, { email, password })
      
      // Expected response shape from the backend: { token: '...', user: { id, email, ... } }
      // Adapt if the shape is nested in { data: ... }
      const token = response.data.token || response.data.data?.token
      const user = response.data.user || response.data.data?.user
      const refreshToken = response.data.data?.refreshToken ?? null

      if (token && user) {
        partnerLogin(token, user, refreshToken)
        navigate('/partner/dashboard')
      } else {
        setErrorMessage('Invalid response from server. Missing token or user profile.')
      }
    } catch (error: unknown) {
      console.error('Partner login error:', error)
      setErrorMessage(apiErrorMessage(error, 'Authentication failed. Please check your credentials and try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d260c] relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <Helmet>
        <title>Stakeholder & Partner Login — CivicTree</title>
      </Helmet>

      {/* Decorative Gradient Mesh Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(223,186,96,0.18),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(26,92,24,0.35),transparent_50%)]" />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/20"
      >
        {/* Header / Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#153e14] p-2.5 mx-auto mb-4 shadow-lg flex items-center justify-center">
            <img src="/logo.png" alt="CivicTree Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-tight">
            Revenue Partner Portal
          </h1>
          <p className="text-xs text-gray-500 mt-1.5">
            Access your global revenue-share metrics, live sales feeds, and settlements.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Partner Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. partner@firm.com"
              required
              className="w-full px-4 py-3 text-sm bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#153e14] focus:ring-2 focus:ring-[#153e14]/15 transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Password
              </label>
              <a
                href="mailto:support@civictreegh.com?subject=Partner%20Password%20Reset"
                className="text-[11px] text-[#153e14] font-semibold hover:underline"
              >
                Forgot Password?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 text-sm bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#153e14] focus:ring-2 focus:ring-[#153e14]/15 transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#153e14] transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.01 10.01 0 015.71-2.29c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 text-xs text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#153e14] focus:ring-[#153e14] border-gray-300"
              />
              <span>Remember session</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-[#153e14] to-[#205e1e] hover:from-[#113210] hover:to-[#1a4c18] text-[#dfba60] text-sm font-bold rounded-xl shadow-lg transition-all transform active:scale-[0.99] disabled:opacity-60 flex items-center justify-center space-x-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <svg className="w-5 h-5 animate-spin text-[#dfba60]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Authenticating Partner...</span>
              </>
            ) : (
              <span>Sign In to Partner Portal →</span>
            )}
          </button>
        </form>


      </motion.div>
    </div>
  )
}
