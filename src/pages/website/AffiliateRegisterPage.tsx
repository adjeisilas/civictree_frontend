import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { apiErrorMessage } from '../../utils/apiError'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { useAffiliateRegister } from '../../hooks/useAffiliates'
import { MIN_PASSWORD_LENGTH } from '../../utils/passwordPolicy'
import type { PaymentMethodType, MomoNetwork, AffiliateApiRegisterPayload } from '../../types/affiliate'

// ─── Schema ──────────────────────────────────────────────────────────────────

const schema = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  location: z.string().min(2, 'Location is required'),
  businessName: z.string().optional(),
  paymentMethod: z.enum(['Mobile Money', 'Bank'] as const),
  momoNetwork: z.enum(['MTN', 'Telecel', 'AirtelTigo'] as const).optional(),
  momoPhone: z.string().optional(),
  momoAccountName: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountName: z.string().optional(),
  password: z.string().min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
})

type FormData = z.infer<typeof schema>

// ─── Component ───────────────────────────────────────────────────────────────

export default function AffiliateRegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const { mutate: registerAffiliate, isPending } = useAffiliateRegister()

  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { paymentMethod: 'Mobile Money' },
  })

  const paymentMethod = useWatch({ control, name: 'paymentMethod' }) as PaymentMethodType

  const goToStep2 = async () => {
    const valid = await trigger(['fullName', 'email', 'phone', 'location', 'password', 'confirmPassword'])
    if (valid) setStep(2)
  }

  const onSubmit = (data: FormData) => {
    setApiError(null)
    const payload: AffiliateApiRegisterPayload = {
      fullName: data.fullName,
      businessName: data.businessName || undefined,
      phoneNumber: data.phone,
      email: data.email,
      location: data.location,
      password: data.password,
      payoutMethod: data.paymentMethod === 'Mobile Money' ? 'MOBILE_MONEY' : 'BANK_ACCOUNT',
      ...(data.paymentMethod === 'Mobile Money'
        ? {
            momoNetwork: data.momoNetwork,
            momoNumber: data.momoPhone,
            momoAccountName: data.momoAccountName,
          }
        : {
            bankName: data.bankName,
            bankAccountNumber: data.bankAccountNumber,
            bankAccountName: data.bankAccountName,
          }),
    }

    registerAffiliate(payload, {
      onSuccess: () => {
        setSubmitted(true)
      },
      onError: (err: unknown) => {
        setApiError(apiErrorMessage(err, 'Failed to submit application. Please try again.'))
      },
    })
  }

  // ─── Success Screen ──────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f5f7f4] flex items-center justify-center p-4">
        <Helmet>
          <title>Application Submitted — Results Checker Affiliate</title>
        </Helmet>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl max-w-md w-full p-10 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 font-serif mb-3">Application Submitted!</h2>
          <p className="text-gray-500 text-sm mb-2 leading-relaxed">
            Your affiliate application is now <span className="font-semibold text-amber-600">Pending Review</span>. Our team will review it shortly.
          </p>
          <p className="text-gray-400 text-xs mb-8">
            Once approved, you'll receive an email with your unique USSD code and login credentials.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-[#1a5c18] hover:bg-[#154a14] text-white text-sm font-semibold py-3 rounded-xl transition-all cursor-pointer"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f7f4] flex flex-col">
      <Helmet>
        <title>Become an Affiliate — Results Checker</title>
        <meta name="description" content="Join the Results Checker affiliate network. Get your unique USSD code and earn commissions on every voucher sold." />
      </Helmet>

      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/logo.png" alt="CivicTree" className="w-8 h-8 object-contain" />
          <span className="font-serif font-bold text-lg text-[#1a5c18]">Results Checker</span>
        </Link>
        <Link to="/affiliate/login" className="text-sm text-[#1a5c18] font-semibold hover:underline">
          Already an affiliate? Login →
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-2xl">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 mb-4">
              <span className="text-amber-600 text-xs font-bold uppercase tracking-wider">Affiliate Program</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Become an Affiliate</h1>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Get your unique USSD code and earn commissions on every voucher sold through your channel.
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8 space-x-3">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-[#1a5c18] text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {step > s ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  ) : s}
                </div>
                <span className={`text-xs font-medium ${step >= s ? 'text-[#1a5c18]' : 'text-gray-400'}`}>
                  {s === 1 ? 'Personal Info' : 'Payment Details'}
                </span>
                {s < 2 && <div className={`w-12 h-0.5 ${step > s ? 'bg-[#1a5c18]' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">
                {/* ─── Step 1: Personal Info ─────────────────────────── */}
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Personal Information</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
                        <input {...register('fullName')} placeholder="e.g. John Mensah" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c18] focus:ring-2 focus:ring-[#1a5c18]/10 transition-all" />
                        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Business Name (Optional)</label>
                        <input {...register('businessName')} placeholder="e.g. JM Sales" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c18] focus:ring-2 focus:ring-[#1a5c18]/10 transition-all" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number *</label>
                        <input {...register('phone')} placeholder="0241234567" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c18] focus:ring-2 focus:ring-[#1a5c18]/10 transition-all" />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address *</label>
                        <input {...register('email')} type="email" placeholder="you@example.com" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c18] focus:ring-2 focus:ring-[#1a5c18]/10 transition-all" />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Location / Region *</label>
                      <input {...register('location')} placeholder="e.g. Accra, Greater Accra" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c18] focus:ring-2 focus:ring-[#1a5c18]/10 transition-all" />
                      {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password *</label>
                        <div className="relative">
                          <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c18] focus:ring-2 focus:ring-[#1a5c18]/10 transition-all pr-10" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm Password *</label>
                        <div className="relative">
                          <input {...register('confirmPassword')} type={showPassword ? 'text' : 'password'} placeholder="Repeat password" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c18] focus:ring-2 focus:ring-[#1a5c18]/10 transition-all pr-10" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                      </div>
                    </div>

                    <button type="button" onClick={goToStep2} className="w-full bg-[#1a5c18] hover:bg-[#154a14] active:scale-[0.99] text-white text-sm font-semibold py-3.5 rounded-xl transition-all cursor-pointer mt-2">
                      Continue to Payment Details →
                    </button>
                  </motion.div>
                )}

                {/* ─── Step 2: Payment Details ───────────────────────── */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Payment Details</h2>
                    <p className="text-xs text-gray-500 -mt-2">How would you like to receive your commission payments?</p>

                    {/* Payment Method Toggle */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">Payment Method *</label>
                      <div className="grid grid-cols-2 gap-3">
                        {(['Mobile Money', 'Bank'] as const).map((method) => (
                          <label key={method} className="cursor-pointer">
                            <input type="radio" {...register('paymentMethod')} value={method} className="sr-only" />
                            <div className={`border-2 rounded-xl p-4 text-center text-sm font-semibold transition-all ${paymentMethod === method ? 'border-[#1a5c18] bg-[#f0faf0] text-[#1a5c18]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                              {method === 'Mobile Money' ? '📱 Mobile Money' : '🏦 Bank Account'}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Money Fields */}
                    {paymentMethod === 'Mobile Money' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Network *</label>
                          <select {...register('momoNetwork')} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c18] bg-white">
                            <option value="">Select network</option>
                            {(['MTN', 'Telecel', 'AirtelTigo'] as MomoNetwork[]).map(n => <option key={n}>{n}</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">MoMo Number *</label>
                            <input {...register('momoPhone')} placeholder="0241234567" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c18] transition-all" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Account Name *</label>
                            <input {...register('momoAccountName')} placeholder="Registered name" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c18] transition-all" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bank Fields */}
                    {paymentMethod === 'Bank' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Bank Name *</label>
                          <input {...register('bankName')} placeholder="e.g. GCB Bank" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c18] transition-all" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Account Number *</label>
                            <input {...register('bankAccountNumber')} placeholder="1234567890" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c18] transition-all" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Account Name *</label>
                            <input {...register('bankAccountName')} placeholder="Registered name" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c18] transition-all" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Info Banner */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex space-x-3">
                      <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-xs font-semibold text-amber-800">Payment details are only used to send your commissions</p>
                        <p className="text-xs text-amber-600 mt-0.5">Your information is kept private and secure.</p>
                      </div>
                    </div>

                    {/* Error Banner */}
                    {apiError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl flex items-center space-x-2">
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{apiError}</span>
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <button type="button" onClick={() => setStep(1)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-3.5 rounded-xl transition-all cursor-pointer">
                        ← Back
                      </button>
                      <button
                        type="submit"
                        disabled={isPending}
                        className="flex-1 bg-[#1a5c18] hover:bg-[#154a14] disabled:opacity-60 active:scale-[0.99] text-white text-sm font-semibold py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2"
                      >
                        {isPending ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <span>Submit Application</span>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/affiliate/login" className="text-[#1a5c18] font-semibold hover:underline">
              Login to your dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
