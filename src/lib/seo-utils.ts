import { Tool } from '@/types'
import type { Metadata } from 'next'

export function generateToolMetadata(tool: Tool): Metadata {
  const baseUrl = 'https://ultimate-tools-suite.vercel.app'
  const toolUrl = `${baseUrl}${tool.path}`

  return {
    title: tool.name,
    description: tool.description,
    keywords: [
      ...tool.keywords,
      'online tool',
      'free tool',
      'developer tool',
      'web tool',
      'utility',
      'converter',
      'formatter',
      'generator',
      'analyzer',
      'checker',
      'validator',
    ],
    authors: [{ name: 'Ultimate Tools Suite', url: baseUrl }],
    creator: 'Ultimate Tools Suite',
    publisher: 'Ultimate Tools Suite',
    applicationName: 'Ultimate Tools Suite',
    category: 'Technology',
    classification: 'Developer Tools',
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: tool.path,
    },
    openGraph: {
      title: tool.name,
      description: tool.description,
      type: 'website',
      url: toolUrl,
      siteName: 'Ultimate Tools Suite',
      images: [
        {
          url: `/og-tools/${tool.id}.png`,
          width: 1200,
          height: 630,
          alt: `${tool.name} - Ultimate Tools Suite`,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@ultimate_tools',
      creator: '@ultimate_tools',
      title: tool.name,
      description: tool.description,
      images: [`/og-tools/${tool.id}.png`],
    },
    robots: {
      index: true,
      follow: true,
    },
    other: {
      'tool-category': tool.category?.id || 'utility',
      'tool-featured': tool.featured ? 'true' : 'false',
      'tool-popular': tool.popular ? 'true' : 'false',
      'tool-new': tool.new ? 'true' : 'false',
    },
  }
}

export function generatePageMetadata(
  title: string,
  description: string,
  keywords: string[] = [],
  path: string = '/',
  image?: string
): Metadata {
  const baseUrl = 'https://ultimate-tools-suite.vercel.app'
  const pageUrl = `${baseUrl}${path}`

  return {
    title,
    description,
    keywords: [
      ...keywords,
      'online tools',
      'developer tools',
      'free tools',
      'web tools',
      'utilities',
    ],
    authors: [{ name: 'Ultimate Tools Suite', url: baseUrl }],
    creator: 'Ultimate Tools Suite',
    publisher: 'Ultimate Tools Suite',
    applicationName: 'Ultimate Tools Suite',
    category: 'Technology',
    classification: 'Developer Tools',
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: pageUrl,
      siteName: 'Ultimate Tools Suite',
      images: [
        {
          url: image || '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${title} - Ultimate Tools Suite`,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@ultimate_tools',
      creator: '@ultimate_tools',
      title,
      description,
      images: [image || '/og-image.png'],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export function generateStructuredData(tool: Tool) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    description: tool.description,
    url: `https://ultimate-tools-suite.vercel.app${tool.path}`,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Organization',
      name: 'Ultimate Tools Suite',
      url: 'https://ultimate-tools-suite.vercel.app',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ultimate Tools Suite',
      url: 'https://ultimate-tools-suite.vercel.app',
    },
    keywords: tool.keywords.join(', '),
    isAccessibleForFree: true,
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    softwareVersion: '1.0',
    datePublished: '2024-01-01',
    dateModified: new Date().toISOString().split('T')[0],
  }
}

export function generateBreadcrumbStructuredData(tool: Tool) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://ultimate-tools-suite.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tools',
        item: 'https://ultimate-tools-suite.vercel.app/tools',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tool.category?.name || 'Utilities',
        item: `https://ultimate-tools-suite.vercel.app/tools?category=${
          tool.category?.id || 'utility'
        }`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: tool.name,
        item: `https://ultimate-tools-suite.vercel.app${tool.path}`,
      },
    ],
  }
}

export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Ultimate Tools Suite',
    url: 'https://ultimate-tools-suite.vercel.app',
    logo: 'https://ultimate-tools-suite.vercel.app/logo.png',
    description:
      'Professional-grade online tools for developers, designers, and businesses. 35+ free tools including IP checker, SSL analyzer, SEO tools, code formatter, and much more.',
    foundingDate: '2024',
    sameAs: ['https://github.com/ultimate-tools-suite', 'https://twitter.com/ultimate_tools'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@ultimate-tools-suite.com',
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
    },
  }
}

export function generateWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Ultimate Tools Suite',
    url: 'https://ultimate-tools-suite.vercel.app',
    description:
      'Professional-grade online tools for developers, designers, and businesses. 35+ free tools including IP checker, SSL analyzer, SEO tools, code formatter, and much more.',
    publisher: {
      '@type': 'Organization',
      name: 'Ultimate Tools Suite',
      url: 'https://ultimate-tools-suite.vercel.app',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://ultimate-tools-suite.vercel.app/tools?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }
}
