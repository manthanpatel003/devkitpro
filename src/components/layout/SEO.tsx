import { Metadata } from 'next'

export interface SEOProps {
  title?: string
  description?: string
  canonical?: string
  openGraph?: {
    title?: string
    description?: string
    url?: string
    type?: 'website' | 'article' | 'profile'
    images?: Array<{
      url: string
      width?: number
      height?: number
      alt?: string
      type?: string
    }>
    siteName?: string
    locale?: string
  }
  twitter?: {
    card?: 'summary' | 'summary_large_image' | 'app' | 'player'
    site?: string
    creator?: string
    title?: string
    description?: string
    images?: string[]
  }
  jsonLd?: Record<string, any>
  noindex?: boolean
  nofollow?: boolean
  keywords?: string[]
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
}

/**
 * SEO Component - Comprehensive SEO management for all pages
 *
 * Features:
 * - Dynamic title and description
 * - Canonical URL management
 * - Open Graph and Twitter Card support
 * - JSON-LD structured data
 * - Robots meta tags
 * - Keywords and author metadata
 * - Article-specific metadata
 *
 * Usage:
 * <SEO
 *   title="Page Title"
 *   description="Page description"
 *   canonical="/page-url"
 *   openGraph={{ title: "OG Title", description: "OG Description" }}
 *   jsonLd={{ "@context": "https://schema.org", "@type": "WebPage" }}
 * />
 */
export function SEO({
  title,
  description,
  canonical,
  openGraph,
  twitter,
  jsonLd,
  noindex = false,
  nofollow = false,
  keywords = [],
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
}: SEOProps) {
  const baseUrl = 'https://ultimate-tools-suite.vercel.app'
  const fullCanonical = canonical ? `${baseUrl}${canonical}` : baseUrl
  const fullTitle = title
    ? `${title} | Ultimate Tools Suite`
    : 'Ultimate Tools Suite - 35+ Free Online Tools'
  const fullDescription =
    description ||
    'Professional-grade online tools for developers, designers, and businesses. 35+ free tools including IP checker, SSL analyzer, SEO tools, code formatter, and much more.'

  // Default Open Graph data
  const defaultOpenGraph = {
    title: openGraph?.title || fullTitle,
    description: openGraph?.description || fullDescription,
    url: openGraph?.url || fullCanonical,
    type: openGraph?.type || 'website',
    siteName: openGraph?.siteName || 'Ultimate Tools Suite',
    locale: openGraph?.locale || 'en_US',
    images: openGraph?.images || [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Ultimate Tools Suite - Professional Online Tools',
        type: 'image/png',
      },
    ],
  }

  // Default Twitter data
  const defaultTwitter = {
    card: twitter?.card || 'summary_large_image',
    site: twitter?.site || '@ultimate_tools',
    creator: twitter?.creator || '@ultimate_tools',
    title: twitter?.title || fullTitle,
    description: twitter?.description || fullDescription,
    images: twitter?.images || [`${baseUrl}/og-image.png`],
  }

  // Robots meta content
  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow',
    'max-snippet:-1',
    'max-image-preview:large',
    'max-video-preview:-1',
  ].join(', ')

  return (
    <>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={keywords.join(', ')} />
      {author && <meta name="author" content={author} />}

      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonical} />

      {/* Robots */}
      <meta name="robots" content={robotsContent} />

      {/* Open Graph */}
      <meta property="og:title" content={defaultOpenGraph.title} />
      <meta property="og:description" content={defaultOpenGraph.description} />
      <meta property="og:url" content={defaultOpenGraph.url} />
      <meta property="og:type" content={defaultOpenGraph.type} />
      <meta property="og:site_name" content={defaultOpenGraph.siteName} />
      <meta property="og:locale" content={defaultOpenGraph.locale} />

      {/* Open Graph Images */}
      {defaultOpenGraph.images.map((image, index) => (
        <React.Fragment key={index}>
          <meta property="og:image" content={image.url} />
          {image.width && <meta property="og:image:width" content={image.width.toString()} />}
          {image.height && <meta property="og:image:height" content={image.height.toString()} />}
          {image.alt && <meta property="og:image:alt" content={image.alt} />}
          {image.type && <meta property="og:image:type" content={image.type} />}
        </React.Fragment>
      ))}

      {/* Article-specific Open Graph */}
      {defaultOpenGraph.type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content={defaultTwitter.card} />
      <meta name="twitter:site" content={defaultTwitter.site} />
      <meta name="twitter:creator" content={defaultTwitter.creator} />
      <meta name="twitter:title" content={defaultTwitter.title} />
      <meta name="twitter:description" content={defaultTwitter.description} />
      {defaultTwitter.images.map((image, index) => (
        <meta key={index} name="twitter:image" content={image} />
      ))}

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd, null, 2),
          }}
        />
      )}

      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#3B82F6" />
      <meta name="color-scheme" content="light dark" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Ultimate Tools Suite" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
    </>
  )
}

// Helper function to generate page-specific metadata
export function generatePageMetadata({
  title,
  description,
  canonical,
  openGraph,
  twitter,
  jsonLd,
  noindex = false,
  nofollow = false,
  keywords = [],
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
}: SEOProps): Metadata {
  const baseUrl = 'https://ultimate-tools-suite.vercel.app'
  const fullCanonical = canonical ? `${baseUrl}${canonical}` : baseUrl
  const fullTitle = title
    ? `${title} | Ultimate Tools Suite`
    : 'Ultimate Tools Suite - 35+ Free Online Tools'
  const fullDescription =
    description ||
    'Professional-grade online tools for developers, designers, and businesses. 35+ free tools including IP checker, SSL analyzer, SEO tools, code formatter, and much more.'

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: keywords.length > 0 ? keywords : undefined,
    authors: author ? [{ name: author }] : undefined,
    alternates: {
      canonical: fullCanonical,
    },
    robots: {
      index: !noindex,
      follow: !nofollow,
      nocache: false,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: openGraph?.title || fullTitle,
      description: openGraph?.description || fullDescription,
      url: openGraph?.url || fullCanonical,
      type: openGraph?.type || 'website',
      siteName: openGraph?.siteName || 'Ultimate Tools Suite',
      locale: openGraph?.locale || 'en_US',
      images: openGraph?.images || [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'Ultimate Tools Suite - Professional Online Tools',
          type: 'image/png',
        },
      ],
      ...(openGraph?.type === 'article' && {
        publishedTime,
        modifiedTime,
        authors: author ? [author] : undefined,
        section,
        tags,
      }),
    },
    twitter: {
      card: twitter?.card || 'summary_large_image',
      site: twitter?.site || '@ultimate_tools',
      creator: twitter?.creator || '@ultimate_tools',
      title: twitter?.title || fullTitle,
      description: twitter?.description || fullDescription,
      images: twitter?.images || [`${baseUrl}/og-image.png`],
    },
    other: {
      'theme-color': '#3B82F6',
      'color-scheme': 'light dark',
      'format-detection': 'telephone=no',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': 'Ultimate Tools Suite',
      'mobile-web-app-capable': 'yes',
      'msapplication-TileColor': '#2563eb',
      'msapplication-config': '/browserconfig.xml',
    },
  }
}
// Import React for JSX
import React from 'react'
