import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { apiErrorMessage } from '../../utils/apiError'
import { motion } from 'framer-motion'
import { useAffiliateLogin } from '../../hooks/useAffiliates'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof schema>

export default function AffiliateLoginPage() {
  const navigate = useNavigate()
  const [apiError, setApiError] = useState<string | null>(null)
  const { mutate: login, isPending } = useAffiliateLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormData) => {
    setApiError(null)
    login(data, {
      onSuccess: () => {
        navigate('/affiliate/dashboard')
      },
      onError: (err: unknown) => {
        setApiError(apiErrorMessage(err, 'Invalid email or password. Please try again.'))
      },
    })
  }

  return (
    <div className="min-h-screen bg-[#f5f7f4] flex flex-col">
      <Helmet>
        <title>Affiliate Login — Results Checker</title>
        <meta name="description" content="Login to your Results Checker affiliate dashboard to view your USSD code, track sales, and request withdrawals." />
      </Helmet>

      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/logo.png" alt="CivicTree" className="w-8 h-8 object-contain" />
          <span className="font-serif font-bold text-lg text-[#1a5c18]">Results Checker</span>
        </Link>
        <Link to="/become-affiliate" className="text-sm text-[#1a5c18] font-semibold hover:underline">
          New affiliate? Register →
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg border border-gray-100 p-10 w-full max-w-md"
        >
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#1a5c18] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#1a5c18]/20">
              <svg className="w-8 h-8 text-[#dfba60]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-serif font-bold text-gray-900">Affiliate Login</h1>
            <p className="text-gray-400 text-sm mt-1">Access your affiliate dashboard</p>
          </div>

          {/* Error */}
          {apiError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl flex items-center space-x-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
              <input
                {...register('email')}
                type="email"
                id="affiliate-email"
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a5c18] focus:ring-2 focus:ring-[#1a5c18]/10 transition-all"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <input
                {...register('password')}
                type="password"
                id="affiliate-password"
                placeholder="Your password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a5c18] focus:ring-2 focus:ring-[#1a5c18]/10 transition-all"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              id="affiliate-login-btn"
              disabled={isPending}
              className="w-full bg-[#1a5c18] hover:bg-[#154a14] disabled:opacity-60 active:scale-[0.99] text-white text-sm font-semibold py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 mt-2"
            >
              {isPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : <span>Sign In to Dashboard</span>}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Not yet an affiliate?{' '}
            <Link to="/become-affiliate" className="text-[#1a5c18] font-semibold hover:underline">
              Apply now — it's free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
