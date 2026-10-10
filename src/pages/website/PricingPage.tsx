import { AppLayout } from '../../components/website/AppLayout';
import { PricingSection } from './PricingSection';
import { seoConfigs } from '../../config/seo';

const faqs = [
  {
    q: 'I paid but didn\'t get my PIN. What do I do?',
    a: 'Check your SMS/Email spam folder first. If nothing after 2 mins, click "Resend PIN" on the success page or WhatsApp our support with your transaction ID. We refund if PIN fails.',
  },
  {
    q: 'How many times can I check with one PIN?',
    a: 'WASSCE/NOVDEC: 3 checks per PIN. BECE: 3 checks. After that you\'ll need to buy a new card.',
  },
  {
    q: 'Why is my result showing "Invalid Details"?',
    a: '4 common causes: Wrong Index Number, wrong exam type - School vs Private, wrong year, or results not released yet. Double-check and try again.',
  },
  {
    q: 'Do you store my Index Number or PIN?',
    a: 'No. We\'re just a Seller. Your details go straight to WAEC\'s server. We don\'t save or share student data.',
  },
  {
    q: 'Are the cards genuine WAEC cards?',
    a: 'Yes, 100% original WAEC result checker cards. Each PIN is verified before delivery.',
  },
  {
    q: 'How do I contact support?',
    a: 'WhatsApp: 0556069880 | 055 5466738. Email: gyasireindorf42@gmail.com. Live chat: bottom-right corner. We reply 7am-10pm daily.',
  },
  {
    q: 'Is this website legit?',
    a: 'Yes. We\'re an authorized private sellers. We\'ve delivered 100k+ PINs since 2024.',
  },
  {
    q: 'How do I pay?',
    a: 'MTN MoMo, Telecel Cash, AirtelTigo Money, Debit Card. Payment is instant. No account needed.',
  },
  {
    q: 'What do I get after payment?',
    a: (
      <>
        You'll get a Serial Number + PIN instantly on your screen + via SMS/Email. Copy and use it directly on the official WAEC portals:{' '}
        <a href="https://ghana.waecdirect.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">
          ghana.waecdirect.org
        </a>{' '}
        (for WASSCE/NOVDEC) or{' '}
        <a href="https://eresults.waecgh.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">
          eresults.waecgh.org
        </a>{' '}
        (for BECE) to view your results.
      </>
    ),
  },
];

export const PricingPage = () => {
  return (
    <AppLayout seoConfig={seoConfigs.pricing}>
      <div>
        <PricingSection />

        <section className="bg-bg-secondary">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <h2 className="font-heading font-bold text-4xl text-text-primary mb-12 text-center">
              Pricing Questions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {faqs.map((item, idx) => (
                <div key={idx} className="glass-card p-6">
                  <h3 className="font-heading font-semibold text-text-primary mb-2">
                    {item.q}
                  </h3>
                  <p className="font-sans text-text-secondary text-sm">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};
