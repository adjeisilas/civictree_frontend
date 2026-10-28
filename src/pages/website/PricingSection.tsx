import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { ExamType } from '../../types/website';
import { SectionWrapper, GlassCard, Button, Badge } from '../../components/website/ui';
import { VOUCHER_TYPES, voucherTypeLabel, resolvePublicPrice } from '../../config/voucherTypes';
import { BookOpen, CheckCircle2, CircleAlert } from 'lucide-react';

import { usePublicVoucherConfigs } from '../../hooks/useWebsite';

const TABS: { key: ExamType; label: string }[] = VOUCHER_TYPES.map((v) => ({
  key: v.type,
  label: v.displayName,
}));

/** Marketing copy per type. Prices come from the API; these are only fallbacks. */
const PRODUCT_INFO: Record<ExamType, { description: string; fallbackPrice: number }> = {
  WASSCE_NOVDEC: {
    description: 'Complete WASSCE / NOVDEC exam package with study materials',
    fallbackPrice: 89.99,
  },
  BECE: {
    description: 'Access to BECE exam resources and instant voucher delivery',
    fallbackPrice: 45.99,
  },
  CTVET_NABTEX: {
    description: 'CTVET / NABTEX technical and vocational results checker, delivered instantly',
    fallbackPrice: 45.99,
  },
};

export const PricingSection = () => {
  const { data: config } = usePublicVoucherConfigs();
  const [activeTab, setActiveTab] = useState<ExamType>(TABS[0].key);

  // A type with no price set yet resolves to null rather than falling through to
  // a marketing fallback, which would advertise a figure the backend never charges
  const resolvedPrice = resolvePublicPrice(config, activeTab);
  const isUnpriced = resolvedPrice === null;
  const live = config?.types?.find((t) => t.type === activeTab);

  const info = PRODUCT_INFO[activeTab];

  const currentVoucher = {
    examType: activeTab,
    priceGHS: resolvedPrice ?? info.fallbackPrice,
    isUnpriced,
    isLowStock: live?.hasReachedLimit ?? false,
    description: info.description,
    title: voucherTypeLabel(activeTab),
  };

  return (
    <SectionWrapper gradient>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-heading font-bold text-5xl md:text-6xl text-text-primary mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="font-sans text-lg text-text-secondary max-w-2xl mx-auto">
            Choose your exam and get instant access to quality study materials
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-white rounded-2xl p-1.5 shadow-sm border border-border">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-6 sm:px-10 py-3 rounded-xl font-sans font-bold text-sm sm:text-base transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'text-white'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="pricing-tab-bg"
                    className="absolute inset-0 bg-primary rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
          >
            <GlassCard className="p-8 sm:p-10 relative max-w-lg mx-auto">
              {currentVoucher.examType === 'WASSCE_NOVDEC' && (
                <div className="absolute -top-3 right-6">
                  <Badge variant="primary">Most Popular</Badge>
                </div>
              )}

              {currentVoucher.isLowStock && (
                <div className="mb-6 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-xs font-sans font-semibold text-yellow-800 flex items-center gap-2">
                    <CircleAlert size={18} className="text-yellow-600" />
                    Limited stock available — order now
                  </p>
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                  <BookOpen size={28} />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-2xl text-text-primary">
                    {currentVoucher.title}
                  </h3>
                  <p className="font-sans text-sm text-text-secondary">
                    {currentVoucher.description}
                  </p>
                </div>
              </div>

              <div className="mb-6 py-6 border-y border-border text-center">
                <p className="text-5xl font-heading font-bold text-primary">
                  GHS {currentVoucher.priceGHS.toFixed(2)}
                </p>
                <p className="text-xs font-sans text-text-secondary mt-1">One-time payment</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  'Instant Delivery',
                  'No Expiry Date',
                  '24/7 Support',
                  'Mobile & Web Access',
                ].map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <span className="text-success flex-shrink-0 mt-0.5">
                      <CheckCircle2 size={16} />
                    </span>
                    <span className="font-sans text-sm text-text-primary">{feature}</span>
                  </div>
                ))}
              </div>

              <Link to="/buy-voucher" className="block">
                <Button variant="cta" size="lg" className="w-full">
                  Buy Now
                </Button>
              </Link>
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      </div>
    </SectionWrapper>
  );
};
