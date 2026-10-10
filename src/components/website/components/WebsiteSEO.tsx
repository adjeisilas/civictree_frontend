import { Helmet } from 'react-helmet-async'
import type { SEOConfig } from '../../../config/seo'
import { siteConfig } from '../../../config/seo'

interface WebsiteSEOProps {
  config: SEOConfig
}

export const WebsiteSEO: React.FC<WebsiteSEOProps> = ({ config }) => {
  const fullTitle = config.title.includes('CivicTree')
    ? config.title
    : `${config.title} | ${siteConfig.name}`

  const fullDescription = config.description || siteConfig.description
  const canonicalUrl = `${siteConfig.url}${config.canonical || '/'}`
  const ogImageUrl = config.ogImage
    ? `${siteConfig.url}${config.ogImage}`
    : `${siteConfig.url}${siteConfig.logo}`

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}${siteConfig.logo}`,
    description: fullDescription,
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
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: fullDescription,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteConfig.url,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: config.title,
        item: canonicalUrl,
      },
    ],
  }

  const faqSchema =
    config.structuredData?.type === 'faq' ? config.structuredData.data : null
  const customSchema = config.schema

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={config.keywords?.join(', ')} />
      {config.noindex ? <meta name="robots" content="noindex, nofollow" /> : <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />}

      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={config.ogType || 'website'} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:locale" content="en_GH" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={ogImageUrl} />

      <meta name="author" content={siteConfig.name} />
      <meta name="geo.region" content="GH" />
      <meta name="geo.placename" content="Accra, Ghana" />

      <html lang="en" dir="ltr" />

      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      {customSchema && (
        <script type="application/ld+json">
          {JSON.stringify(customSchema)}
        </script>
      )}
      {faqSchema && (
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      )}
    </Helmet>
  )
}
