export interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  canonical?: string
  ogImage?: string
  ogType?: 'website' | 'article'
  noindex?: boolean
  schema?: Record<string, unknown>
  structuredData?: {
    type: 'organization' | 'webapp' | 'faq' | 'breadcrumb'
    data: Record<string, unknown>
  }
}

export const siteConfig = {
  name: 'CivicTree',
  tagline: "Ghana's Trusted Exam Voucher Platform",
  url: 'https://civictree.com',
  description:
    'Buy WASSCE/NOVDEC and BECE exam checkers instantly via Mobile Money or card. Safe, fast, and affordable exam voucher platform in Ghana.',
  logo: '/logo.png',
  social: {
    facebook: 'https://facebook.com/civictree',
    twitter: 'https://twitter.com/civictree',
    whatsapp: 'https://wa.me/233123456789',
    phone: '+233 123 456 789',
    email: 'gyasireindorf42@gmail.com',
  },
}

export const seoConfigs: Record<string, SEOConfig> = {
  home: {
    title: 'CivicTree - Buy WASSCE/NOVDEC & BECE Exam Checkers Online | Ghana',
    description:
      'Instantly purchase WASSCE/NOVDEC and BECE exam checker pins in Ghana. Secure Mobile Money & card payments with immediate SMS delivery.',
    keywords: [
      'exam checker',
      'WASSCE/NOVDEC checker',
      'BECE checker',
      'buy exam voucher',
      'Ghana exam checker',
      'Mobile Money exam voucher',
      'CivicTree',
    ],
    canonical: '/',
    ogType: 'website',
    ogImage: '/og-home.png',
    structuredData: {
      type: 'organization',
      data: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'CivicTree',
        url: siteConfig.url,
        logo: `${siteConfig.url}${siteConfig.logo}`,
        description: siteConfig.description,
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: siteConfig.social.phone,
          contactType: 'customer support',
          email: siteConfig.social.email,
        },
        sameAs: [
          siteConfig.social.facebook,
          siteConfig.social.twitter,
          siteConfig.social.whatsapp,
        ],
      },
    },
  },
  'buy-voucher': {
    title: 'Buy Exam Voucher - WASSCE/NOVDEC & BECE Checkers | CivicTree Ghana',
    description:
      'Purchase WASSCE/NOVDEC or BECE exam vouchers securely online. Fast delivery via SMS, paid with MTN MoMo, Telecel, AirtelTigo, Visa, or Mastercard.',
    keywords: [
      'buy exam voucher',
      'WASSCE/NOVDEC voucher',
      'BECE voucher',
      'exam checker pin',
      'online exam voucher Ghana',
      'MTN MoMo voucher',
      'Visa exam voucher',
    ],
    canonical: '/buy-voucher',
    ogType: 'website',
    ogImage: '/og-buy-voucher.png',
    noindex: false,
  },
  pricing: {
    title: 'Exam Voucher Pricing - BECE & WASSCE/NOVDEC | CivicTree Ghana',
    description:
      'Transparent and affordable pricing for WASSCE/NOVDEC and BECE exam checkers. No hidden fees. Compare exam voucher prices and features.',
    keywords: [
      'exam voucher price',
      'WASSCE/NOVDEC voucher price',
      'BECE voucher price',
      'affordable exam checker Ghana',
      'CivicTree pricing',
    ],
    canonical: '/pricing',
    ogType: 'website',
    ogImage: '/og-pricing.png',
  },
  about: {
    title: 'About CivicTree - Ghana Exam Voucher Platform | Our Story & Mission',
    description:
      'Learn about CivicTree, Ghana leading exam voucher platform helping over 10,000 students access WASSCE/NOVDEC and BECE checkers instantly since 2023.',
    keywords: [
      'about CivicTree',
      'CivicTree story',
      'exam voucher platform Ghana',
      'Ghana EdTech',
      'exam voucher company Ghana',
      'CivicTree mission',
      'CivicTree team',
    ],
    canonical: '/about',
    ogType: 'website',
    ogImage: '/og-about.png',
  },
  contact: {
    title: 'Contact CivicTree - Ghana Exam Voucher Support | Phone, WhatsApp & Email',
    description:
      'Get in touch with CivicTree support for questions about WASSCE/NOVDEC and BECE exam vouchers. Call, WhatsApp, or email us in Accra, Ghana.',
    keywords: [
      'CivicTree contact',
      'exam voucher support Ghana',
      'WASSCE/NOVDEC support',
      'BECE support Ghana',
      'civictree customer service',
      'exam voucher help Ghana',
    ],
    canonical: '/contact',
    ogType: 'website',
    ogImage: '/og-contact.png',
  },
  terms: {
    title: 'Terms of Service - CivicTree Exam Voucher Platform',
    description:
      'Read the Terms of Service for using CivicTree exam voucher platform. Understand your rights and responsibilities when purchasing exam checkers.',
    keywords: [
      'terms of service',
      'CivicTree terms',
      'exam voucher terms',
      'terms and conditions Ghana',
      'CivicTree legal',
    ],
    canonical: '/terms',
    ogType: 'website',
    ogImage: '/og-terms.png',
    noindex: true,
  },
  privacy: {
    title: 'Privacy Policy - CivicTree Exam Voucher Platform',
    description:
      'CivicTree Privacy Policy. Learn how we collect, use, and protect your personal information when purchasing WASSCE/NOVDEC and BECE exam vouchers.',
    keywords: [
      'privacy policy',
      'CivicTree privacy',
      'exam voucher privacy',
      'data protection Ghana',
      'CivicTree GDPR',
      'personal data CivicTree',
    ],
    canonical: '/privacy',
    ogType: 'website',
    ogImage: '/og-privacy.png',
    noindex: true,
  },
  disclaimer: {
    title: 'Disclaimer - CivicTree Exam Voucher Platform',
    description:
      'CivicTree disclaimer. Important information about our exam voucher services, limitations of liability, and third-party exam board affiliations.',
    keywords: [
      'disclaimer',
      'CivicTree disclaimer',
      'exam voucher disclaimer',
      'WAEC disclaimer',
      'BECE disclaimer',
    ],
    canonical: '/disclaimer',
    ogType: 'website',
    ogImage: '/og-disclaimer.png',
    noindex: true,
  },
  portals: {
    title: 'Official WAEC Results Portals - BECE & WASSCE/NOVDEC | CivicTree Ghana',
    description:
      'Direct links to official WAEC results checker portals. Access the WASSCE/NOVDEC and BECE online systems easily to check your results with CivicTree.',
    keywords: [
      'WAEC portals',
      'WASSCE portal',
      'BECE portal',
      'NOVDEC results portal',
      'check WAEC results online',
      'results checker portal Ghana',
    ],
    canonical: '/portals',
    ogType: 'website',
    ogImage: '/og-portals.png',
  },
}

export const defaultSEO: SEOConfig = {
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: ['exam checker', 'Ghana', 'CivicTree'],
  canonical: '/',
  ogType: 'website',
  ogImage: '/og-home.png',
}
