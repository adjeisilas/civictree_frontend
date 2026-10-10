import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, BookOpen, GraduationCap, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';
import { AppLayout } from '../../components/website/AppLayout';
import { seoConfigs } from '../../config/seo';
import { Link } from 'react-router-dom';

export const PortalsPage: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 70,
        damping: 15,
      },
    },
  };

  return (
    <AppLayout seoConfig={seoConfigs.portals}>
      {/* Premium Hero Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1a3319] to-[#346231] text-white py-16 md:py-24">
        {/* Decorative Grid Mesh / Background Circles */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white opacity-5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#ebc56b] opacity-10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-sans font-medium text-[#ebc56b] hover:text-white transition-colors duration-300 mb-6 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Home
            </Link>
            <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl mb-6 tracking-wide">
              Official WAEC Results Portals
            </h1>
            <p className="font-sans text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Quickly and securely check your results. Select the portal matching your examination type and use the Serial and PIN delivered to you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Portals Content */}
      <section className="py-16 bg-[#F8FAF8] min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
          >
            {/* WASSCE / NOVDEC Card */}
            <motion.div
              variants={cardVariants}
              className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex flex-col justify-between hover:shadow-2xl hover:border-primary/20 transition-all duration-300"
            >
              <div className="p-8 md:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-[#ffeade] flex items-center justify-center text-[#371f0d] shadow-inner">
                    <GraduationCap size={28} className="text-primary" />
                  </div>
                  <span className="px-3.5 py-1.5 bg-[#ffeade] text-[#371f0d] text-xs font-semibold rounded-full uppercase tracking-wider font-sans">
                    Senior High / Private
                  </span>
                </div>

                <h2 className="font-heading font-bold text-2xl md:text-3xl text-[#371f0d] mb-4">
                  WASSCE / NOVDEC Portal
                </h2>
                <p className="font-sans text-text-secondary mb-6 leading-relaxed">
                  The official West African Examinations Council portal for WASSCE school candidates and private candidates (NOVDEC).
                </p>

                <div className="border-t border-gray-100 pt-6 mt-6">
                  <h3 className="font-sans font-bold text-[#371f0d] text-sm uppercase tracking-wider mb-4">
                    Steps to Check Your Results:
                  </h3>
                  <ul className="space-y-3 font-sans text-text-secondary text-sm">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#00A36C] shrink-0 mt-0.5" />
                      <span>Visit the official WASSCE result checking website.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#00A36C] shrink-0 mt-0.5" />
                      <span>Enter your 10-digit Index Number.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#00A36C] shrink-0 mt-0.5" />
                      <span>Select the Type of Examination (e.g., WASSCE School or Private).</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#00A36C] shrink-0 mt-0.5" />
                      <span>Select your Examination Year.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#00A36C] shrink-0 mt-0.5" />
                      <span>Enter the Voucher Serial and PIN from your SMS or screen receipt.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-8 md:p-10 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 text-xs text-text-secondary font-sans">
                  <ShieldAlert size={16} className="text-amber-500 shrink-0" />
                  <span>Verify exam details before submitting.</span>
                </div>
                <a
                  href="https://ghana.waecdirect.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary-hover text-white font-sans font-bold rounded-xl shadow-md transition-all duration-300"
                >
                  Go to WASSCE Portal
                  <ExternalLink size={16} />
                </a>
              </div>
            </motion.div>

            {/* BECE Card */}
            <motion.div
              variants={cardVariants}
              className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex flex-col justify-between hover:shadow-2xl hover:border-primary/20 transition-all duration-300"
            >
              <div className="p-8 md:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-[#ffeade] flex items-center justify-center text-[#371f0d] shadow-inner">
                    <BookOpen size={28} className="text-primary" />
                  </div>
                  <span className="px-3.5 py-1.5 bg-[#ffeade] text-[#371f0d] text-xs font-semibold rounded-full uppercase tracking-wider font-sans">
                    Junior High School
                  </span>
                </div>

                <h2 className="font-heading font-bold text-2xl md:text-3xl text-[#371f0d] mb-4">
                  BECE Results Portal
                </h2>
                <p className="font-sans text-text-secondary mb-6 leading-relaxed">
                  The official WAEC eresults website dedicated to checking Basic Education Certificate Examination results.
                </p>

                <div className="border-t border-gray-100 pt-6 mt-6">
                  <h3 className="font-sans font-bold text-[#371f0d] text-sm uppercase tracking-wider mb-4">
                    Steps to Check Your Results:
                  </h3>
                  <ul className="space-y-3 font-sans text-text-secondary text-sm">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#00A36C] shrink-0 mt-0.5" />
                      <span>Visit the official BECE eresults checking portal.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#00A36C] shrink-0 mt-0.5" />
                      <span>Enter your 10-digit Index Number.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#00A36C] shrink-0 mt-0.5" />
                      <span>Confirm your index number by re-entering it.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#00A36C] shrink-0 mt-0.5" />
                      <span>Select the Examination Type (e.g. BECE School or Private).</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#00A36C] shrink-0 mt-0.5" />
                      <span>Enter your Exam Year and the Voucher Details.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-8 md:p-10 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 text-xs text-text-secondary font-sans">
                  <ShieldAlert size={16} className="text-amber-500 shrink-0" />
                  <span>BECE results use school codes.</span>
                </div>
                <a
                  href="https://eresults.waecgh.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary-hover text-white font-sans font-bold rounded-xl shadow-md transition-all duration-300"
                >
                  Go to BECE Portal
                  <ExternalLink size={16} />
                </a>
              </div>
            </motion.div>
          </motion.div>

          {/* Additional Support Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 bg-[#ffeade]/50 border border-[#ebc56b]/30 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="space-y-2">
              <h3 className="font-heading font-bold text-xl text-[#371f0d]">
                Haven't bought your result checker voucher yet?
              </h3>
              <p className="font-sans text-text-secondary text-sm md:text-base">
                Get your checker serial number and security PIN instantly via Mobile Money or debit card on CivicTree.
              </p>
            </div>
            <Link
              to="/buy-voucher"
              className="shrink-0 inline-flex items-center justify-center px-6 py-3.5 bg-[#ebc56b] hover:bg-[#ffeade] text-[#371f0d] font-sans font-bold rounded-xl shadow-md transition-all duration-300 border border-[#ebc56b]"
            >
              Buy Voucher Now
            </Link>
          </motion.div>
        </div>
      </section>
    </AppLayout>
  );
};
