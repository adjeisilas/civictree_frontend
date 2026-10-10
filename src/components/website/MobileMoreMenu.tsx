import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, FileText, HelpCircle } from 'lucide-react';

const moreItems = [
  { label: 'Contact', href: '/contact', icon: MessageCircle },
  { label: 'FAQ / Help', href: '/help', icon: HelpCircle },
  { label: 'Disclaimer', href: '/disclaimer', icon: FileText },
  { label: 'Become an Affiliate', href: '/become-affiliate', icon: MessageCircle },
  { label: 'Affiliate Login', href: '/affiliate/login', icon: FileText },
];

interface MobileMoreMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMoreMenu = ({ isOpen, onClose }: MobileMoreMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl p-6 pb-24"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-heading font-bold text-lg text-text-primary">More</span>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-1">
              {moreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-sans text-text-primary hover:bg-bg-secondary transition-colors"
                  >
                    <Icon size={20} className="text-text-secondary" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
