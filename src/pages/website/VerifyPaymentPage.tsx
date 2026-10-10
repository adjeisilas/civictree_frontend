import { useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppLayout } from '../../components/website/AppLayout';
import { Button } from '../../components/website/ui';
import { CheckCircle2, XCircle, Home, Loader2, Copy } from 'lucide-react';
import { seoConfigs } from '../../config/seo';
import { useVerifyPayment } from '../../hooks/useWebsite';

export const VerifyPaymentPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || searchParams.get('clientReference');
  const checkoutid = searchParams.get('checkoutId') || searchParams.get('checkoutid') || searchParams.get('paymentReference');
  const id = searchParams.get('id');
  
  const { mutate: verifyPayment, data, error, isPending } = useVerifyPayment();
  const hasAttempted = useRef(false);

  const hasParams = !!(orderId || checkoutid || id);

  useEffect(() => {
    if (hasParams && !hasAttempted.current) {
      hasAttempted.current = true;
      verifyPayment({ orderId, checkoutid, id }, {
        onSuccess: (responseData) => {
          if (responseData.status === 'SUCCESS' || responseData.paymentStatus === 'SUCCESS') {
            alert('Payment Successful!');
          }
        }
      });
    }
  }, [hasParams, orderId, checkoutid, id, verifyPayment]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here if desired
  };

  const renderContent = () => {
    if (!hasParams) {
      return (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center text-red-500">
            <XCircle size={40} />
          </div>
          <h2 className="font-heading font-bold text-3xl text-text-primary mb-4">
            Invalid Verification Link
          </h2>
          <p className="font-sans text-base text-text-secondary mb-8">
            We couldn't find the necessary payment references in the URL. Please check your email or SMS for your voucher details, or contact support if you need help.
          </p>
          <Link to="/">
            <Button variant="outline" size="lg" icon={<Home size={18} />}>
              Back to Home
            </Button>
          </Link>
        </div>
      );
    }

    if (isPending || (!data && !error)) {
      return (
        <div className="text-center flex flex-col items-center">
          <Loader2 className="animate-spin text-primary mb-6" size={48} />
          <h2 className="font-heading font-bold text-2xl text-text-primary mb-2">
            Verifying your payment...
          </h2>
          <p className="font-sans text-text-secondary">
            Please wait while we confirm your transaction with the provider.
          </p>
        </div>
      );
    }

    if (error || data?.status === 'FAILED' || data?.paymentStatus === 'FAILED') {
      return (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center text-red-500">
            <XCircle size={40} />
          </div>
          <h2 className="font-heading font-bold text-3xl text-text-primary mb-4">
            Verification Failed
          </h2>
          <p className="font-sans text-base text-text-secondary mb-8">
            {error?.message || "We couldn't verify your payment successfully. If you were charged, please contact our support team with your Order ID."}
          </p>
          <div className="bg-gray-50 p-4 rounded-xl mb-8 inline-block text-left">
            <p className="text-sm text-text-secondary font-sans font-medium mb-1">Your Order ID / Reference:</p>
            <p className="font-mono font-bold text-text-primary">{orderId || data?.orderId || checkoutid || id}</p>
          </div>
          <br />
          <Link to="/">
            <Button variant="outline" size="lg" icon={<Home size={18} />}>
              Back to Home
            </Button>
          </Link>
        </div>
      );
    }

    // Success State
    return (
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center text-success">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="font-heading font-bold text-3xl text-text-primary mb-2">
          Payment Successful!
        </h2>
        <p className="font-sans text-base text-text-secondary mb-8">
          Your payment has been verified. Here are your voucher details. A copy has also been sent to your phone and email.
        </p>

        {data?.voucherDetails && data.voucherDetails.length > 0 && (
          <div className="space-y-4 mb-8">
            {data.voucherDetails.map((voucher, idx) => (
              <div key={idx} className="bg-white border-2 border-border rounded-xl p-5 text-left relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                <h4 className="font-heading font-bold text-lg text-text-primary mb-3">
                  {voucher.examType} Voucher {data.voucherDetails!.length > 1 ? `#${idx + 1}` : ''}
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center group">
                    <div>
                      <p className="text-xs text-text-secondary font-medium mb-1">Serial Number</p>
                      <p className="font-mono font-bold text-text-primary">{voucher.serial}</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(voucher.serial)}
                      className="text-gray-400 hover:text-primary transition-colors p-2"
                      title="Copy Serial"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center group">
                    <div>
                      <p className="text-xs text-text-secondary font-medium mb-1">PIN</p>
                      <p className="font-mono font-bold text-text-primary tracking-widest">{voucher.pin}</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(voucher.pin)}
                      className="text-gray-400 hover:text-primary transition-colors p-2"
                      title="Copy PIN"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/buy-voucher" className="w-full sm:w-auto">
            <Button variant="cta" size="lg" className="w-full">
              Buy Another Voucher
            </Button>
          </Link>
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full" icon={<Home size={18} />}>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <AppLayout seoConfig={{ ...seoConfigs['buy-voucher'], title: 'Verify Payment | CivicTree' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-[70vh] flex flex-col justify-center">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-border p-6 sm:p-10 max-w-xl mx-auto w-full"
        >
          {renderContent()}
        </motion.div>
      </div>
    </AppLayout>
  );
};
