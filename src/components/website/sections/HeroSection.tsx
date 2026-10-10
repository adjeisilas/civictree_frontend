import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const HeroSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = [
    {
      title: "CIVICTREE",
      subtitle: "E-VOUCHER",
      highlight: "*713*5912#",
      ussd: true,
      description: "Dial the code to buy BECE and WASSCE/NOVDEC Checkers",
    },
    {
      title: "BECE & WASSCE/NOVDEC",
      subtitle: "Results Checker",
      highlight: "*713*5912#",
      description: "And follow the prompts to complete your purchase.",
      isButton: true,
    },
    {
      title: "SERIAL and PIN",
      subtitle: "DELIVERED immediately.",
      highlight: "via SMS",
      ussd: true,
      description: "Dial *713*5912# to get your voucher. Serial and PIN delivered via SMS",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slideVariants = {
    enter: { x: -100, opacity: 0 },
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.8 },
    },
    exit: {
      x: 100,
      opacity: 0,
      transition: { duration: 0.5 },
    },
  };

  const h1Variants = {
    hidden: { rotateX: 90, opacity: 0 },
    visible: {
      rotateX: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 80,
        mass: 0.8,
        damping: 15,
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <section className="relative overflow-hidden min-h-[85vh] flex flex-col justify-between bg-[#346231]">
      {/* Left Circle Grid Matrix */}
      <div className="absolute left-[-40px] top-12 sm:left-4 lg:left-12 z-0 pointer-events-none">
        <div className="grid grid-cols-2 gap-4">
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white opacity-15" />
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white opacity-15" />
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white opacity-15" />
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white opacity-15" />
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white opacity-15" />
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white opacity-15" />
        </div>
      </div>

      {/* Right Circle Grid Matrix */}
      <div className="absolute right-[-40px] top-8 sm:right-4 lg:right-16 z-0 pointer-events-none">
        <div className="grid grid-cols-2 gap-4">
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-white opacity-10" />
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-white opacity-10" />
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-white opacity-10" />
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-white opacity-10" />
        </div>
      </div>

      {/* Main Content - Flex Row Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col lg:flex-row items-center justify-between flex-grow py-12">
        {/* Left Column - Sliding Containers */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 text-left lg:pr-12 relative w-full min-h-[280px] sm:min-h-[220px] lg:min-h-[0px]"
        >
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentIndex}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="mb-8 w-full"
            >
              <motion.h1
                variants={h1Variants}
                initial="hidden"
                animate="visible"
                style={{ transformStyle: 'preserve-3d', perspective: 400 }}
                className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-white leading-tight"
              >
                <div className="block">{slides[currentIndex].title}</div>
                <div className="block">{slides[currentIndex].subtitle}</div>
                {slides[currentIndex].isButton ? (
                  <div className="block">
                    <span className="inline-block px-6 py-3 bg-[#ebc56b] text-[#371f0d] font-bold rounded-xl shadow-md text-3xl md:text-4xl lg:text-5xl">
                      {slides[currentIndex].highlight}
                    </span>
                  </div>
                ) : slides[currentIndex].ussd ? (
                  <div className="block mt-2">
                    <span className="inline-block px-5 py-2.5 bg-white/15 text-white font-mono font-bold rounded-xl shadow-md text-2xl md:text-3xl lg:text-4xl tracking-wider border border-white/20">
                      {slides[currentIndex].highlight}
                    </span>
                  </div>
                ) : (
                  <div className={`block ${currentIndex === 0 ? 'text-[#ebc56b]' : ''}`}>
                    {slides[currentIndex].highlight}
                  </div>
                )}
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="font-sans text-lg md:text-xl text-[#F8FAF8]/80 max-w-2xl mt-4"
              >
                {slides[currentIndex].description}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Right Column - CTA Buttons */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-12 lg:mt-0 flex flex-col gap-4 w-full sm:w-auto min-w-[200px]"
        >
          <motion.a
            variants={itemVariants}
            href="/portals"
            className="border-2 border-[#ebc56b] text-[#ebc56b] px-8 py-3.5 font-bold rounded-xl font-sans inline-block shadow-md transition-all duration-300 hover:bg-[#ebc56b] hover:text-[#371f0d] text-center"
          >
            Access Portals
          </motion.a>
          <motion.a
            variants={itemVariants}
            href="/buy-voucher"
            className="px-8 py-3.5 bg-[#ebc56b] text-[#371f0d] font-bold rounded-xl shadow-md transition-all duration-300 hover:bg-[#517643] hover:text-white font-sans inline-block text-center"
          >
            Buy Voucher
          </motion.a>
          <motion.a
            variants={itemVariants}
            href="/pricing"
            className="lg:bg-[#346231] lg:text-white bg-white text-[#346231] px-8 py-3.5 font-bold rounded-xl font-sans inline-block shadow-md transition-all duration-300 hover:bg-[#517643] hover:text-white text-center"
          >
            View Prices
          </motion.a>
        </motion.div>
      </div>

      {/* Asymmetric Wave SVG */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg
          viewBox="0 0 1440 320"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path d="M0,160 C240,320 480,320 720,224 C960,128 1200,-32 1440,32 L1440,320 L0,320 Z" fill="#F8FAF8" />
        </svg>
      </div>
    </section>
  );
};
