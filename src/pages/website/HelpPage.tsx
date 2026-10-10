import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '../../components/website/AppLayout';
import { seoConfigs } from '../../config/seo';
import { fetchFaqs, type FaqEntry } from '../../services/chatbot';
import { ChevronDown, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react';

export const HelpPage = () => {
  const [faqs, setFaqs] = useState<FaqEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    fetchFaqs()
      .then((data) => { if (active) setFaqs(data); })
      .catch(() => { if (active) setError('Failed to load FAQs. Please try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);

  // Retrying clears the last failure and bumps the attempt the effect watches
  const load = () => {
    setLoading(true);
    setError('');
    setAttempt((n) => n + 1);
  };

  return (
    <AppLayout seoConfig={seoConfigs.contact}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
            <HelpCircle size={32} className="text-primary" />
          </div>
          <h1 className="font-heading font-bold text-4xl text-text-primary mb-3">
            Frequently Asked Questions
          </h1>
          <p className="font-sans text-text-secondary max-w-lg mx-auto">
            Find answers to common questions about our vouchers and services.
          </p>
        </motion.div>

        {loading && (
          <div className="flex flex-col items-center py-16">
            <RefreshCw size={32} className="text-primary animate-spin mb-4" />
            <p className="font-sans text-text-secondary">Loading FAQs…</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center py-16">
            <AlertCircle size={32} className="text-red-400 mb-4" />
            <p className="font-sans text-red-500 mb-4">{error}</p>
            <button
              onClick={load}
              className="px-5 py-2 rounded-xl bg-primary text-white font-sans text-sm font-semibold hover:bg-primary-hover transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && faqs.length === 0 && (
          <div className="flex flex-col items-center py-16">
            <HelpCircle size={32} className="text-gray-300 mb-4" />
            <p className="font-sans text-text-secondary">No FAQs available at the moment.</p>
          </div>
        )}

        {!loading && !error && faqs.length > 0 && (
          <div className="space-y-3">
            {faqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left font-sans font-semibold text-text-primary hover:bg-bg-secondary transition-colors"
                  >
                    <span className="text-sm sm:text-base pr-4">{faq.question}</span>
                    <ChevronDown
                      size={18}
                      className={`flex-shrink-0 text-text-secondary transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <motion.div
                    initial={false}
                    animate={{
                      height: isOpen ? 'auto' : 0,
                      opacity: isOpen ? 1 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-4 font-sans text-sm text-text-secondary leading-relaxed border-t border-border pt-3">
                      {faq.answer}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
