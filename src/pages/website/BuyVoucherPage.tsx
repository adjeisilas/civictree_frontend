import { useReducer, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '../../components/website/AppLayout';
import { Button } from '../../components/website/ui';
import type { ExamType } from '../../types/website';
import { seoConfigs } from '../../config/seo';
import { apiErrorMessage } from '../../utils/apiError';
import { CheckCircle2, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

import { useInitiatePurchase, usePublicVoucherConfigs } from '../../hooks/useWebsite';

const phoneRegex = /^0[0-9]{9}$/;

const STEPS = [
  { num: 1, label: 'Customer' },
  { num: 2, label: 'Voucher' },
] as const;

const EXAM_OPTIONS: { value: ExamType; label: string }[] = [
  { value: 'BECE', label: 'BECE' },
  { value: 'WASSCE_NOVDEC', label: 'WASSCE / NOVDEC' },
];

interface CheckoutState {
  step: 1 | 2;
  name: string;
  phone: string;
  exam: ExamType | null;
  quantity: number;
}

type Action =
  | { type: 'SET_STEP'; payload: 1 | 2 }
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_PHONE'; payload: string }
  | { type: 'SET_EXAM'; payload: ExamType }
  | { type: 'SET_QUANTITY'; payload: number }
  | { type: 'RESET' };

const checkoutReducer = (state: CheckoutState, action: Action): CheckoutState => {
  switch (action.type) {
    case 'SET_STEP': return { ...state, step: action.payload };
    case 'SET_NAME': return { ...state, name: action.payload };
    case 'SET_PHONE': return { ...state, phone: action.payload };
    case 'SET_EXAM': return { ...state, exam: action.payload };
    case 'SET_QUANTITY': return { ...state, quantity: action.payload };
    case 'RESET': return { step: 1, name: '', phone: '', exam: null, quantity: 1 };
    default: return state;
  }
};

const stepVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

export const BuyVoucherPage = () => {
  const [state, dispatch] = useReducer(checkoutReducer, {
    step: 1,
    name: '',
    phone: '',
    exam: null,
    quantity: 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState<string | null>(null);
  const { mutate: initiatePurchase, isPending: isLoading } = useInitiatePurchase();

  const { data: config } = usePublicVoucherConfigs();

  const unitPrice = state.exam === 'WASSCE_NOVDEC'
    ? (config?.wassceNovdecPrice ?? 89.99)
    : (config?.becePrice ?? 45.99);
  const total = unitPrice * state.quantity;

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    const nameRegex = /^[A-Za-z'-]+(\s+[A-Za-z'-]+)+$/;
    if (!state.name.trim()) {
      e.name = 'Full name is required';
    } else if (/\d/.test(state.name)) {
      e.name = 'Name should not contain numbers';
    } else if (!nameRegex.test(state.name.trim())) {
      e.name = 'Please enter your full name (first and last name)';
    }
    if (!state.phone.trim()) e.phone = 'Phone number is required';
    else if (!phoneRegex.test(state.phone)) e.phone = 'Enter a valid 10-digit Ghana number (e.g. 0243456789)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!state.exam) e.exam = 'Please select an exam type';
    if (state.quantity < 1) e.quantity = 'Quantity must be at least 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    let valid = false;
    if (state.step === 1) valid = validateStep1();
    else if (state.step === 2) valid = validateStep2();

    if (!valid) return;

    if (state.step < 2) {
      dispatch({ type: 'SET_STEP', payload: (state.step + 1) as 1 | 2 });
      setErrors({});
    } else {
      handlePayNow();
    }
  };

  const handleBack = () => {
    if (state.step > 1) {
      dispatch({ type: 'SET_STEP', payload: (state.step - 1) as 1 | 2 });
      setErrors({});
    }
  };

  const handlePayNow = () => {
    if (!state.exam) return;
    initiatePurchase(
      {
        customerName: state.name,
        phoneNumber: state.phone,
        voucherType: state.exam,
        quantity: state.quantity,
        channel: 'WEB',
      },
      {
        onSuccess: (response) => {
          if (response.checkoutUrl) {
            window.location.href = response.checkoutUrl;
          } else {
            alert('Payment Successful!');
            setIsSuccess(true);
          }
        },
        onError: (error: unknown) => {
          const apiMessage = apiErrorMessage(error, 'Failed to initiate order. Please try again.');
          setErrors({ submit: apiMessage });
          setErrorModalMessage(apiMessage);
        }
      }
    );
  };

  const goToStep = (s: 1 | 2) => {
    if (s <= state.step) {
      dispatch({ type: 'SET_STEP', payload: s });
      setErrors({});
    }
  };

  const handleReset = () => {
    dispatch({ type: 'RESET' });
    setErrors({});
    setIsSuccess(false);
  };

  if (isSuccess) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center text-success">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="font-heading font-bold text-4xl text-text-primary mb-4">
              Payment Successful!
            </h2>
            <p className="font-sans text-lg text-text-secondary mb-8">
              Your exam voucher has been processed. Check your email and SMS for details.
            </p>
            <div className="glass-card p-6 mb-8 text-left max-w-md mx-auto">
              <div className="space-y-3 font-sans text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Name</span>
                  <span className="font-semibold text-text-primary">{state.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Phone</span>
                  <span className="font-semibold text-text-primary">{state.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Exam</span>
                  <span className="font-semibold text-text-primary">
                    {state.exam === 'WASSCE_NOVDEC' ? 'WASSCE/NOVDEC' : state.exam}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Quantity</span>
                  <span className="font-semibold text-text-primary">{state.quantity}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-border">
                  <span className="text-text-primary font-bold">Total</span>
                  <span className="font-heading font-bold text-primary text-lg">
                    GHS {total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div className="glass-card p-6 mb-8 text-left max-w-md mx-auto border border-border/80 bg-primary/5 rounded-2xl">
              <h4 className="font-heading font-bold text-sm text-primary mb-2">Instructions to Check Your Results:</h4>
              <p className="font-sans text-xs text-text-secondary leading-relaxed mb-3">
                Visit the official WAEC online portal to check your results using the Serial and PIN delivered to you:
              </p>
              <div className="font-sans text-xs space-y-2 pt-2 border-t border-border/50">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-text-primary">WASSCE Direct:</span>
                  <a href="https://ghana.waecdirect.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">ghana.waecdirect.org</a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-text-primary">BECE eResults:</span>
                  <a href="https://eresults.waecgh.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">eresults.waecgh.org</a>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="primary" size="lg" onClick={handleReset}>
                Purchase Another
              </Button>
              <a href="/">
                <Button variant="outline" size="lg">
                  Back to Home
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout seoConfig={seoConfigs['buy-voucher']}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-28 lg:pb-10">

        {/* Mobile back button — hidden on desktop */}
        <div className="lg:hidden mb-4">
          {state.step === 1 ? (
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-sans font-medium text-text-secondary hover:text-primary transition-colors"
            >
              <ChevronLeft size={18} />
              Back
            </a>
          ) : (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-sm font-sans font-medium text-text-secondary hover:text-primary transition-colors"
            >
              <ChevronLeft size={18} />
              Back
            </button>
          )}
        </div>

        <h1 className="font-heading font-bold text-4xl text-text-primary text-center mb-8">
          Buy Voucher
        </h1>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-10">
          {STEPS.map((s, idx) => (
            <div key={s.num} className="flex items-center">
              <button
                type="button"
                onClick={() => goToStep(s.num)}
                className="flex flex-col items-center group"
              >
                <motion.div
                  animate={{
                    scale: s.num === state.step ? 1 : 0.95,
                  }}
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    s.num === state.step
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : s.num < state.step
                        ? 'bg-primary/15 text-primary'
                        : 'bg-gray-100 text-gray-400'
                  } ${s.num <= state.step ? 'cursor-pointer hover:ring-2 hover:ring-primary/40' : 'cursor-not-allowed'}`}
                >
                  {s.num < state.step ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    s.num
                  )}
                </motion.div>
                <span
                  className={`text-xs mt-1.5 font-sans font-medium transition-colors ${
                    s.num === state.step
                      ? 'text-primary'
                      : s.num < state.step
                        ? 'text-text-secondary'
                        : 'text-gray-400'
                  }`}
                >
                  {s.label}
                </span>
              </button>
              {idx < STEPS.length - 1 && (
                <div
                  className={`w-12 sm:w-20 h-0.5 mx-2 sm:mx-3 rounded transition-colors duration-300 ${
                    s.num < state.step ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Desktop: two columns */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left: Step Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={state.step}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {/* ---- Step 1: Customer ---- */}
                {state.step === 1 && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-border p-6 sm:p-8">
                      <h2 className="font-heading font-bold text-2xl text-text-primary mb-6">
                        Customer Details
                      </h2>
                      <div className="space-y-5">
                        <div>
                          <label className="block font-sans font-semibold text-sm text-text-primary mb-1.5">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Enter your full name"
                            value={state.name}
                            onChange={(e) => {
                              dispatch({ type: 'SET_NAME', payload: e.target.value });
                              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                            }}
                            className={`w-full px-4 py-3 rounded-xl border font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary transition ${
                              errors.name ? 'border-red-400 focus:ring-red-400' : 'border-border'
                            }`}
                          />
                          {errors.name && (
                            <p className="text-red-500 text-xs mt-1.5 font-sans">{errors.name}</p>
                          )}
                        </div>
                        <div>
                          <label className="block font-sans font-semibold text-sm text-text-primary mb-1.5">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            placeholder="0243456789"
                            value={state.phone}
                            onChange={(e) => {
                              dispatch({ type: 'SET_PHONE', payload: e.target.value });
                              if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                            }}
                            className={`w-full px-4 py-3 rounded-xl border font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary transition ${
                              errors.phone ? 'border-red-400 focus:ring-red-400' : 'border-border'
                            }`}
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-xs mt-1.5 font-sans">{errors.phone}</p>
                          )}
                          <p className="text-gray-400 text-xs mt-1.5 font-sans">
                            Enter a valid 10-digit Ghana number starting with 0
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Desktop buttons */}
                    <div className="hidden lg:flex justify-end">
                      <Button variant="cta" size="lg" onClick={handleNext} icon={<ChevronRight size={18} />}>
                        Next Step
                      </Button>
                    </div>
                  </div>
                )}

                {/* ---- Step 2: Voucher ---- */}
                {state.step === 2 && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-border p-6 sm:p-8">
                      <h2 className="font-heading font-bold text-2xl text-text-primary mb-6">
                        Select Voucher
                      </h2>
                      {/* Exam Cards */}
                      <div className="mb-6">
                        <label className="block font-sans font-semibold text-sm text-text-primary mb-3">
                          Exam Type <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-3 sm:gap-4">
                          {EXAM_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                dispatch({ type: 'SET_EXAM', payload: opt.value });
                                if (errors.exam) setErrors((prev) => ({ ...prev, exam: '' }));
                              }}
                              className={`p-4 rounded-xl border-2 font-sans font-bold text-sm sm:text-base transition-all duration-200 ${
                                state.exam === opt.value
                                  ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                  : 'border-border text-text-secondary hover:border-primary/40 hover:bg-gray-50'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        {errors.exam && (
                          <p className="text-red-500 text-xs mt-1.5 font-sans">{errors.exam}</p>
                        )}
                      </div>
                      {/* Quantity */}
                      <div>
                        <label className="block font-sans font-semibold text-sm text-text-primary mb-3">
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              if (state.quantity > 1) {
                                dispatch({ type: 'SET_QUANTITY', payload: state.quantity - 1 });
                              }
                            }}
                            disabled={state.quantity <= 1}
                            className="w-11 h-11 rounded-xl border-2 border-border flex items-center justify-center text-text-primary hover:border-primary hover:bg-primary/5 transition disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Minus size={18} />
                          </button>
                          <span className="w-16 text-center font-heading font-bold text-2xl text-text-primary">
                            {state.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => dispatch({ type: 'SET_QUANTITY', payload: state.quantity + 1 })}
                            className="w-11 h-11 rounded-xl border-2 border-border flex items-center justify-center text-text-primary hover:border-primary hover:bg-primary/5 transition"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                        {errors.quantity && (
                          <p className="text-red-500 text-xs mt-1.5 font-sans">{errors.quantity}</p>
                        )}
                      </div>
                      {/* Price preview inside card */}
                      {state.exam && (
                        <div className="mt-6 pt-6 border-t border-border">
                          <div className="flex justify-between text-sm font-sans text-text-secondary mb-1">
                            <span>Unit Price</span>
                            <span className="font-semibold text-text-primary">
                              GHS {unitPrice.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between font-sans font-bold text-lg">
                            <span>Subtotal</span>
                            <span className="text-primary">GHS {total.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Desktop buttons */}
                    <div className="hidden lg:flex justify-between items-center mt-8">
                      <Button variant="outline" size="lg" onClick={handleBack} icon={<ChevronLeft size={18} />}>
                        Back
                      </Button>
                      <div className="flex flex-col items-end">
                        <Button variant="cta" size="lg" onClick={handleNext} loading={isLoading} icon={!isLoading ? <ChevronRight size={18} /> : undefined}>
                          {isLoading ? 'Processing...' : 'Pay Now'}
                        </Button>
                        {errors.submit && (
                          <p className="text-red-500 text-xs mt-2 font-sans">{errors.submit}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}


              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Order Summary (desktop only) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-28">
              <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
                <h3 className="font-heading font-bold text-lg text-text-primary mb-5">
                  Order Summary
                </h3>
                <div className="space-y-3 font-sans text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Name</span>
                    <span className="font-semibold text-text-primary truncate ml-2">
                      {state.name || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Phone</span>
                    <span className="font-semibold text-text-primary truncate ml-2">
                      {state.phone || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Exam</span>
                    <span className="font-semibold text-text-primary truncate ml-2">
                      {state.exam ? (state.exam === 'WASSCE_NOVDEC' ? 'WASSCE/NOVDEC' : state.exam) : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Quantity</span>
                    <span className="font-semibold text-text-primary">{state.quantity || '—'}</span>
                  </div>
                  <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                    <span className="font-heading font-bold text-base text-text-primary">Total</span>
                    <span className="font-heading font-bold text-xl text-primary">
                      GHS {total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-border px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs font-sans text-text-secondary">Total</p>
              <p className="font-heading font-bold text-xl text-primary">GHS {total.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {state.step === 1 ? (
              <a href="/">
                <Button variant="outline" size="md" icon={<ChevronLeft size={16} />}>
                  Back
                </Button>
              </a>
            ) : (
              <Button variant="outline" size="md" onClick={handleBack} icon={<ChevronLeft size={16} />}>
                Back
              </Button>
            )}
            <Button
              variant="cta"
              size="md"
              onClick={handleNext}
              loading={state.step === 2 && isLoading}
              icon={state.step < 2 ? <ChevronRight size={16} /> : undefined}
            >
              {state.step === 2 ? (isLoading ? 'Processing' : 'Pay Now') : 'Next'}
            </Button>
          </div>
          {errors.submit && (
            <div className="w-full text-center mt-2">
              <p className="text-red-500 text-xs font-sans">{errors.submit}</p>
            </div>
          )}
        </div>
      </div>

      {/* Error Popup Modal */}
      <AnimatePresence>
        {errorModalMessage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-border rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative"
            >
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-500 mb-5 mx-auto">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-xl font-heading font-bold text-center text-text-primary mb-2">Purchase Failed</h3>
              <p className="text-sm font-sans text-center text-text-secondary mb-8">{errorModalMessage}</p>
              <Button variant="cta" size="lg" className="w-full" onClick={() => setErrorModalMessage(null)}>
                Dismiss
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};
