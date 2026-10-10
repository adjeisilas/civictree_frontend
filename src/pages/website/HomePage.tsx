import { AppLayout } from '../../components/website/AppLayout';
import {
  HeroSection,
  HowItWorksSection,
  UssdHowItWorks,
  FAQSection,
  CTABannerSection,
} from '../../components/website/sections';
import { faqs } from '../../data/faqs';
import { seoConfigs } from '../../config/seo';

export const HomePage = () => {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <AppLayout
      seoConfig={{
        ...seoConfigs.home,
        schema: faqSchema,
      }}
    >
      <HeroSection />
      <HowItWorksSection />
      <UssdHowItWorks />
      <FAQSection />
      <CTABannerSection />
    </AppLayout>
  );
};
