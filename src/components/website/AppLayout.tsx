import React from 'react';
import { motion } from 'framer-motion';
import { WebsiteSEO } from './components';
import { TopNavbar } from './TopNavbar';
import { BottomNavbar } from './BottomNavbar';
import { Footer } from './Footer';
import { ChatbotWidget } from './chatbot/ChatbotWidget';
import type { SEOConfig } from '../../config/seo';

interface AppLayoutProps {
  children: React.ReactNode;
  seoConfig?: SEOConfig;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, seoConfig }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      {seoConfig && <WebsiteSEO config={seoConfig} />}
      <TopNavbar />
      <motion.main
        className="flex-grow pt-0 md:pt-20 pb-16 md:pb-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {children}
      </motion.main>
      <Footer />
      <BottomNavbar />
      <ChatbotWidget />
    </div>
  );
};
