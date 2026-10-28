import React from 'react';
import { motion } from 'framer-motion';
import { SectionWrapper } from '../ui';

interface Step {
  number: 1 | 2 | 3;
  title: string;
  body: string;
  theme: string;
  textColor: string;
}

const paymentMethods = [
  { name: 'MTN MoMo', src: '/mtn-momo.png', alt: 'MTN Mobile Money' },
  { name: 'VodaCash', src: '/vodacash.png', alt: 'Vodafone Cash' },
  { name: 'ATM', src: '/ATM-Logo-01.png', alt: 'ATM Card' },
  { name: 'Visa', src: '/visa card.png', alt: 'Visa Card' },
  { name: 'Mastercard', src: '/Mastercard-logo.svg', alt: 'Mastercard' },
];

export const HowItWorksSection: React.FC = () => {
  const steps: Step[] = [
    {
      number: 1,
      title: 'Select Examination',
      body: 'Choose your exam type (BECE, WASSCE/NOVDEC or CTVET/NABTEX) and select the exact number of vouchers you need.',
      theme: '#ebc56b',
      textColor: '#371f0d',
    },
    {
      number: 2,
      title: 'Make Secure Payment',
      body: 'Authorize payment using your preferred channel: Mobile Money, Card, or Transfer via secure gateways.',
      theme: '#346231',
      textColor: '#FFFFFF',
    },
    {
      number: 3,
      title: 'Instant Delivery',
      body: 'Your official serial NUMBER and security PIN are delivered instantly onto your screen, via SMS, and email.',
      theme: '#00A36C',
      textColor: '#FFFFFF',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <SectionWrapper className="bg-[#F8FAF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16 md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-sans text-sm font-semibold tracking-widest text-primary uppercase mb-3">
            BUY VOUCHER ON THE SITE
          </p>
          <h2 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-text-primary">
            How It Works
          </h2>
        </motion.div>

        <div className="relative">
          <svg
            className="absolute top-[3.5rem] left-0 w-full h-16 pointer-events-none select-none hidden md:block z-0"
            viewBox="0 0 1000 60"
            preserveAspectRatio="none"
          >
            <path
              d="M 166,45 C 280,50 380,50 500,35 C 620,20 720,20 834,45"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="3"
              strokeDasharray="8 8"
              strokeLinecap="round"
            />
          </svg>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {steps.map((step, idx) => (
              <motion.div
                key={step.number}
                variants={itemVariants}
                className={`group ${idx === 1 ? 'md:mt-10' : ''}`}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white shadow-lg mb-6 group-hover:scale-105 transition-transform duration-300"
                    style={{ backgroundColor: step.theme, color: step.textColor }}
                  >
                    {step.number}
                  </div>
                  <h3 className="font-heading font-bold text-2xl text-text-primary mb-3 group-hover:text-[#346231] transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="font-sans text-lg text-text-secondary max-w-md leading-relaxed">
                    {step.body}
                  </p>
                </div>

                {idx === 1 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-5 text-center">
                      Accepted Payment Methods
                    </p>
                    <div className="flex flex-nowrap justify-center items-center gap-3 md:gap-5">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.name}
                          className="w-16 h-10 flex items-center justify-center flex-shrink-0"
                        >
                          <img
                            src={method.src}
                            alt={method.alt}
                            className="max-h-8 max-w-full object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
};

