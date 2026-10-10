import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionWrapper } from '../ui';
import { faqs } from '../../../data/faqs';

export const FAQSection: React.FC = () => {
  const [openId, setOpenId] = useState<number | null>(0);

  return (
    <SectionWrapper>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-heading font-bold text-5xl md:text-6xl text-text-primary mb-4">
            Frequently Asked Questions
          </h2>
          <p className="font-sans text-lg text-text-secondary">
            Find answers to common questions about our voucher service
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.05, delayChildren: 0.1 }}
        >
          <AnimatePresence mode="wait">
            {faqs.map((faq) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <motion.button
                  onClick={() =>
                    setOpenId(openId === faq.id ? null : faq.id)
                  }
                  className="w-full text-left p-6 rounded-2xl glass-card hover:shadow-lg transition-shadow duration-300"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-heading font-semibold text-lg text-text-primary pr-8">
                      {faq.question}
                    </h3>
                    <motion.div
                      animate={{
                        rotate: openId === faq.id ? 180 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-primary"
                    >
                      ▼
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {openId === faq.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="font-sans text-text-secondary pt-4 border-t border-border/30 mt-4">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="font-sans text-text-secondary mb-4">
            Still have questions?{' '}
            <a
              href="/contact"
              className="text-primary font-semibold hover:underline"
            >
              Contact our support team
            </a>
          </p>
        </motion.div>
      </div>
    </SectionWrapper>
  );
};
