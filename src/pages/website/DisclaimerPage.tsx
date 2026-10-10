import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '../../components/website/AppLayout';
import { SectionWrapper } from '../../components/website/ui';
import { ChevronRight, X } from 'lucide-react';
import { seoConfigs } from '../../config/seo';

export const DisclaimerPage = () => {
  const [showToc, setShowToc] = useState(false);

  const sections = [
    {
      id: 'introduction',
      title: 'Introduction',
      content: (
        <>
          <h3 className="font-heading font-bold text-text-primary mb-2">
            CivicTree E-Voucher Service
          </h3>
          <p className="font-sans text-text-secondary mb-2">
            Official Disclaimer & Guide
          </p>
          <p className="font-sans text-text-secondary">
            CivicTree Enterprise provides a secure and convenient digital platform that enables customers to purchase WAEC Result Checker PINs online.
          </p>
          <p className="font-sans text-text-secondary">
            CivicTree operates as an independent service provider and is not affiliated or associated with WAEC or any educational institution. All vouchers supplied through this platform are sourced directly from authorised vendors and approved distribution channels to ensure authenticity and reliability.
          </p>
        </>
      ),
    },
    {
      id: 'pricing',
      title: 'Pricing',
      content: (
        <p className="font-sans text-text-secondary">
          All listed prices include the official vendor cost plus a service charge to cover transaction processing, maintenance, and operational expenses. Pricing is transparent and may vary based on transaction channel fees.
        </p>
      ),
    },
    {
      id: 'refund-policy',
      title: 'Refund Policy',
      content: (
        <>
          <p className="font-sans text-text-secondary">
            Due to the electronic and irreversible nature of digital vouchers, all sales are final once a PIN has been issued.
          </p>
          <p className="font-sans text-text-secondary">
            Refunds will not be issued for customer input errors, misuse, or shared use of a valid PIN.
          </p>
          <p className="font-sans text-text-secondary">
            Refunds will only be provided if a voucher is verified as invalid from the source before delivery to the customer.
          </p>
        </>
      ),
    },
    {
      id: 'usage-conditions',
      title: 'Usage Conditions',
      content: (
        <ul className="list-disc list-inside space-y-2 font-sans text-text-secondary">
          <li>
            Each WAEC Result Checker PIN:
          </li>
          <li className="pl-4">Is valid for one candidate index number only.</li>
          <li className="pl-4">
            Can be used for a maximum of three (3) result checks.
          </li>
          <li className="pl-4">
            Any attempt to share, resell, or use a voucher across multiple candidates will invalidate the PIN, with no eligibility for refund.
          </li>
        </ul>
      ),
    },
    {
      id: 'purpose-of-service',
      title: 'Purpose of Service',
      content: (
        <>
          <p className="font-sans text-text-secondary">
            The CivicTree E-Voucher Service exists solely to make it faster, safer, and more convenient for customers to purchase official result checker vouchers.
          </p>
          <p className="font-sans text-text-secondary">
            Our platform functions as a digital purchasing channel that helps customers securely obtain vouchers from authorised sources.
          </p>
        </>
      ),
    },
    {
      id: 'user-agreement',
      title: 'User Agreement',
      content: (
        <>
          <p className="font-sans text-text-secondary">
            By continuing to use this service or completing a purchase, you acknowledge and agree to these terms and conditions in full.
          </p>
          <p className="font-sans text-text-secondary">
            If you do not agree, please discontinue use of the service before making a purchase.
          </p>
          <p className="font-sans text-text-secondary font-bold">
            Registered Business: CIVICTREE ENTERPRISE
          </p>
          <p className="font-sans text-text-secondary">
            Contact: gyasireindorf42@gmail.com
          </p>
          <p className="font-sans text-text-secondary">
            WhatsApp: 0556069880
          </p>
        </>
      ),
    },
    {
      id: 'how-to-use-voucher',
      title: 'How to Use Voucher',
      content: (
        <>
          <h3 className="font-heading font-bold text-text-primary mb-4">
            Checking WASSCE Results with Serial Number and PIN
          </h3>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="md:w-1/2 space-y-2">
              <ol className="list-decimal list-inside space-y-2 font-sans text-text-secondary">
                <li>
                  Visit ghana.waecdirect.org
                </li>
                <li>
                  Enter your index number.
                </li>
                <li>
                  Select your examination type — if you wrote the general WASSCE, select WASSCE (School); if you wrote the Private WASSCE, select WASSCE (Private).
                </li>
                <li>
                  Select your examination year.
                </li>
                <li>
                  Enter your date of birth.
                </li>
                <li>
                  Enter the Voucher Serial Number and PIN you were provided on SMS.
                </li>
                <li>
                  Enter your index number and examination year once again and check your results.
                </li>
              </ol>
              <p className="font-sans text-text-secondary mt-4">
                It's important to note that when you select a wrong Examination Year or enter a wrong index number, the checker will be activated and then when you finally enter the correct details, WAEC will prompt you that the checker has already been used. So please enter your correct details carefully.
              </p>
            </div>
            <div className="md:w-1/2">
              <img
                src="/wascce temp.png"
                alt="WASSCE Result Checker Portal"
                className="rounded-lg shadow-md max-w-full h-auto"
              />
            </div>
          </div>

          <h3 className="font-heading font-bold text-text-primary mb-4 mt-8">
            Checking BECE Results with Serial Number and PIN
          </h3>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="md:w-1/2 space-y-2">
              <ol className="list-decimal list-inside space-y-2 font-sans text-text-secondary">
                <li>
                  Visit eresults.waecgh.org
                </li>
                <li>
                  Enter your index number.
                </li>
                <li>
                  Confirm the index number.
                </li>
                <li>
                  Select the Examination Type.
                </li>
                <li>
                  Enter the Exam Year (the year you wrote the Exam).
                </li>
                <li>
                  Enter the Voucher Serial Number and PIN you were provided on SMS.
                </li>
                <li>
                  Click on Submit to check your results.
                </li>
              </ol>
            </div>
            <div className="md:w-1/2">
              <img
                src="/BECE temp.png"
                alt="BECE Result Checker Portal"
                className="rounded-lg shadow-md max-w-full h-auto"
              />
            </div>
          </div>
        </>
      ),
    },
    {
      id: 'extra',
      title: 'Extra',
      content: (
        <>
          <p className="font-sans text-text-secondary">
            It's important to note that when you purchase the voucher using the shortcode, you will receive the voucher via SMS.
          </p>
          <p className="font-sans text-text-secondary font-bold">
            CivicTree is a private seller of WAEC E-Vouchers for checking Examination results ("Result Checkers").
          </p>
          <p className="font-sans text-text-secondary font-bold">
            CivicTree is NOT affiliated with WAEC or any Educational Institution.
          </p>
          <p className="font-sans text-text-secondary font-bold">
            CivicTree is not responsible for the outcome of your results.
          </p>
          <p className="font-sans text-text-secondary">
            In this write-up, "vouchers" and "result checkers" have been used interchangeably. They mean the same thing.
          </p>
        </>
      ),
    },
    {
      id: 'best-wishes',
      title: 'Best Wishes',
      content: (
        <p className="font-sans text-text-secondary font-bold text-center">
          Best Wishes to all our customers !!<br />
          CivicTree Enterprise
        </p>
      ),
    },
  ];



  return (
    <AppLayout seoConfig={seoConfigs.disclaimer}>
      <div>
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#1a3319] py-20 md:py-28">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#346231]/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#ebc56b]/10 rounded-full blur-3xl" />
            <div className="absolute left-[-40px] top-12 grid grid-cols-2 gap-4 opacity-10">
              <div className="w-16 h-16 rounded-full bg-white" />
              <div className="w-16 h-16 rounded-full bg-white" />
              <div className="w-16 h-16 rounded-full bg-white" />
              <div className="w-16 h-16 rounded-full bg-white" />
            </div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#ebc56b]" />
                <span className="text-xs font-semibold uppercase tracking-widest text-[#ebc56b] font-sans">
                  Legal Documentation
                </span>
              </div>
              <h1 className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight">
                Disclaimer
              </h1>
              <p className="font-sans text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
                Please read our terms and conditions carefully before using our services.
                Your continued use constitutes acceptance of these policies.
              </p>
              <div className="mt-8 flex items-center justify-center gap-4 text-sm font-sans text-white/50">
                <span>Last updated: {new Date().toLocaleDateString()}</span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span>CivicTree Enterprise</span>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 w-full overflow-hidden">
            <svg viewBox="0 0 1440 120" className="w-full h-auto" preserveAspectRatio="none">
              <path d="M0,80 C360,120 720,40 1080,80 C1260,100 1380,90 1440,80 L1440,120 L0,120 Z" fill="#F8FAF8" />
            </svg>
          </div>
        </section>

        {/* Content */}
        <SectionWrapper>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Mobile: Single left-edge toggle arrow */}
              <div className="lg:hidden fixed left-2 top-28 z-50">
                <button
                  onClick={() => setShowToc((prev) => !prev)}
                  className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center shadow-xl hover:bg-primary-hover transition-all duration-300"
                  aria-label={showToc ? 'Close menu' : 'Open table of contents'}
                >
                  <motion.div
                    animate={{ rotate: showToc ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronRight size={22} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showToc && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.25 }}
                      className="absolute left-14 top-0 w-56 bg-white rounded-xl shadow-2xl border border-border overflow-hidden"
                    >
                      <div className="p-3 border-b border-border flex items-center justify-between">
                        <span className="font-sans font-semibold text-sm text-text-primary">Contents</span>
                        <button
                          onClick={() => setShowToc(false)}
                          className="text-text-secondary hover:text-primary transition-colors"
                          aria-label="Close menu"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <ul className="p-2 space-y-1">
                        {sections.map((section) => (
                          <li key={section.id}>
                            <a
                              href={`#${section.id}`}
                              onClick={() => setShowToc(false)}
                              className="block w-full text-left px-3 py-2.5 rounded-lg font-sans text-sm text-text-primary hover:bg-bg-secondary hover:text-primary transition-colors"
                            >
                              {section.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Desktop: Table of Contents Sidebar */}
              <motion.div
                className="hidden lg:block lg:col-span-1"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="glass-card p-6 sticky top-24">
                  <h3 className="font-heading font-bold text-lg text-text-primary mb-4">
                    Contents
                  </h3>
                  <ul className="space-y-2">
                    {sections.map((section) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          className="font-sans text-sm text-primary hover:underline transition-colors"
                        >
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* Sections (single render, shared IDs) */}
              <div className="lg:col-span-3 space-y-8">
                {sections.map((section) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-28"
                  >
                    <motion.div
                      className="hidden lg:block"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                    >
                      <h2 className="font-heading font-bold text-3xl text-text-primary mb-4">
                        {section.title}
                      </h2>
                      <div className="font-sans text-lg text-text-secondary leading-relaxed">
                        {section.content}
                      </div>
                    </motion.div>
                    <motion.div
                      className="lg:hidden"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                    >
                      <div className="glass-card p-6">
                        <h2 className="font-heading font-bold text-2xl text-text-primary mb-4">
                          {section.title}
                        </h2>
                        <div className="font-sans text-lg text-text-secondary leading-relaxed">
                          {section.content}
                        </div>
                      </div>
                    </motion.div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </SectionWrapper>
      </div>
    </AppLayout>
  );
};
