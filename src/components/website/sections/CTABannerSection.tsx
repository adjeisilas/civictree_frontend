import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../ui';
import { CheckCircle2 } from 'lucide-react';

/**
 * Fixed scatter for the drifting dots. Derived from the index rather than
 * Math.random so every render draws the same decoration.
 */
const particles = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  size: 2 + ((i * 7) % 5) * 0.8,
  x: (i * 37 + 11) % 100,
  y: (i * 61 + 23) % 100,
  duration: 3 + ((i * 3) % 5) * 0.4,
  delay: ((i * 5) % 8) * 0.25,
}));

export const CTABannerSection: React.FC = () => {

  return (
    <div className="relative overflow-hidden py-20 md:py-32">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #1a3319 0%, #346231 50%, #2d5529 100%)',
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 60% 50%, #ebc56b40 0%, transparent 60%)',
        }}
      />

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-cta/20"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{ y: [-10, 10, -10], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}

      {/* Content */}
      <motion.div
        className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-heading font-bold text-5xl md:text-6xl text-white mb-6">
          Ready to Secure Your Results Checker Voucher Now?
        </h2>

        <div className="hidden lg:block mb-6">
          <span className="inline-block px-5 py-2.5 bg-white/10 text-white font-mono font-bold text-5xl tracking-wider rounded-xl border border-white/20">
            *713*5912#
          </span>
        </div>

        <Link to="/buy-voucher">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="cta"
              size="lg"
              className="inline-block"
            >
              Buy Your Voucher Now →
            </Button>
          </motion.div>
        </Link>

          <motion.div
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-white/90 font-sans text-sm mt-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-white" />
              Instant delivery
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-white" />
              Secure payment
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-white" />
              24/7 support
            </span>
          </motion.div>
      </motion.div>
    </div>
  );
};
