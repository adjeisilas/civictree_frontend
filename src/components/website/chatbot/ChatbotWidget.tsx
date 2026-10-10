import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { ChatbotWindow } from './ChatbotWindow';

export const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const bubbleRef = useRef<HTMLButtonElement>(null);

  if (location.pathname === '/buy-voucher') return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-36 right-4 z-50 w-[92vw] sm:w-[380px] h-[560px] max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-border overflow-hidden md:bottom-24 md:max-h-[80vh]"
          >
            <ChatbotWindow onClose={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        ref={bubbleRef}
        onClick={() => setOpen((p) => !p)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-24 right-5 z-50 md:bottom-5 w-14 h-14 rounded-full bg-[#00A36C] text-white shadow-lg shadow-primary/40 flex items-center justify-center"
      >
        {open ? <X size={24} /> : (
          <div className="relative">
            <MessageSquare size={24} />
            <Sparkles size={12} className="absolute -top-1 -right-1 text-cta fill-cta" />
          </div>
        )}
      </motion.button>
    </>
  );
};
