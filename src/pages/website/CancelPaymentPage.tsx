import { motion } from 'framer-motion';
import { AppLayout } from '../../components/website/AppLayout';
import { Button } from '../../components/website/ui';
import { AlertTriangle, ChevronRight, Home } from 'lucide-react';
import { seoConfigs } from '../../config/seo';
import { Link } from 'react-router-dom';

export const CancelPaymentPage = () => {
  return (
    <AppLayout seoConfig={{ ...seoConfigs['buy-voucher'], title: 'Payment Cancelled | CivicTree' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 min-h-[70vh] flex flex-col justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, type: 'spring' }}
          className="bg-white rounded-2xl shadow-sm border border-border p-8 sm:p-12 max-w-lg mx-auto w-full"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
            <AlertTriangle size={40} />
          </div>
          
          <h2 className="font-heading font-bold text-3xl text-text-primary mb-4">
            Payment Cancelled
          </h2>
          
          <p className="font-sans text-base text-text-secondary mb-8">
            You have cancelled the payment process. No charges were made to your account. You can try purchasing a voucher again whenever you're ready.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/buy-voucher" className="w-full sm:w-auto">
              <Button variant="cta" size="lg" className="w-full" icon={<ChevronRight size={18} />}>
                Try Again
              </Button>
            </Link>
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full" icon={<Home size={18} />}>
                Back to Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};
