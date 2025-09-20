import { SEOConfig } from '@/types/seo'
import { SITE_CONFIG } from './constants'

export const seoConfig: SEOConfig = {
  siteName: SITE_CONFIG.name,
  siteUrl: SITE_CONFIG.url,
  defaultTitle: 'Free Developer Tools & Utilities - DevTools Hub',
  titleTemplate: '%s | DevTools Hub',
  defaultDescription:
    'Boost your productivity with 20+ free developer tools and utilities. JSON formatter, IP checker, SEO analyzer, and more. No signup required.',
  defaultKeywords: SITE_CONFIG.keywords,
  author: {
    name: 'DevTools Hub',
    url: SITE_CONFIG.url,
    social: {
      twitter: '@devtools_hub',
      github: 'https://github.com/devtools-hub',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: `${SITE_CONFIG.url}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'DevTools Hub - Free Developer Tools',
      },
    ],
  },
  twitter: {
    handle: '@devtools_hub',
    site: '@devtools_hub',
    cardType: 'summary_large_image',
  },
  verification: {
    google: 'your-google-verification-code',
    bing: 'your-bing-verification-code',
  },
}

export const generateToolSEO = (
  toolName: string,
  toolDescription: string,
  toolKeywords: string[]
) => {
  return {
    title: `Free ${toolName} Online Tool | DevTools Hub`,
    description: `${toolDescription}. Fast, secure, and completely free. No registration required.`,
    keywords: [...toolKeywords, 'free', 'online', 'tool', 'developer'],
    openGraph: {
      title: `${toolName} - Free Online Tool`,
      description: toolDescription,
      type: 'website',
      image: `${seoConfig.siteUrl}/tools/${toolName.toLowerCase().replace(/\s+/g, '-')}-og.png`,
    },
    twitter: {
      title: `${toolName} - Free Online Tool`,
      description: toolDescription,
    },
  }
}

export const generateStructuredData = {
  website: () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    description: seoConfig.defaultDescription,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${seoConfig.siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    author: {
      '@type': 'Organization',
      name: seoConfig.author.name,
      url: seoConfig.author.url,
    },
  }),

  organization: () => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    logo: `${seoConfig.siteUrl}/logo.png`,
    description: seoConfig.defaultDescription,
    foundingDate: '2024',
    sameAs: [seoConfig.author.social.twitter, seoConfig.author.social.github],
  }),

  webApplication: (toolName: string, toolDescription: string, toolUrl: string) => ({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: toolName,
    description: toolDescription,
    url: toolUrl,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    permissions: 'browser',
    isAccessibleForFree: true,
    author: {
      '@type': 'Organization',
      name: seoConfig.siteName,
      url: seoConfig.siteUrl,
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }),

  breadcrumbList: (items: Array<{ name: string; url: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),

  faq: (faqs: Array<{ question: string; answer: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }),

  howTo: (name: string, description: string, steps: Array<{ name: string; text: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to use ${name}`,
    description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  }),
}

export const getCanonicalUrl = (path: string = '') => {
  return `${seoConfig.siteUrl}${path}`
}

export const generateMetaTags = (seo: any) => {
  const tags = []

  // Basic meta tags
  if (seo.title) tags.push({ name: 'title', content: seo.title })
  if (seo.description) tags.push({ name: 'description', content: seo.description })
  if (seo.keywords) tags.push({ name: 'keywords', content: seo.keywords.join(', ') })

  // Open Graph tags
  if (seo.openGraph) {
    const og = seo.openGraph
    if (og.title) tags.push({ property: 'og:title', content: og.title })
    if (og.description) tags.push({ property: 'og:description', content: og.description })
    if (og.image) tags.push({ property: 'og:image', content: og.image })
    if (og.url) tags.push({ property: 'og:url', content: og.url })
    if (og.type) tags.push({ property: 'og:type', content: og.type })
  }

  // Twitter tags
  if (seo.twitter) {
    const twitter = seo.twitter
    tags.push({ name: 'twitter:card', content: 'summary_large_image' })
    if (twitter.title) tags.push({ name: 'twitter:title', content: twitter.title })
    if (twitter.description)
      tags.push({ name: 'twitter:description', content: twitter.description })
    if (twitter.image) tags.push({ name: 'twitter:image', content: twitter.image })
  }

  return tags
}
