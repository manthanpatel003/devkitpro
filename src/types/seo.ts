export interface SEOConfig {
  siteName: string
  siteUrl: string
  defaultTitle: string
  titleTemplate: string
  defaultDescription: string
  defaultKeywords: string[]
  author: {
    name: string
    url: string
    social: {
      twitter?: string
      github?: string
      linkedin?: string
    }
  }
  openGraph: {
    type: string
    locale: string
    siteName: string
    images: {
      url: string
      width: number
      height: number
      alt: string
    }[]
  }
  twitter: {
    handle: string
    site: string
    cardType: string
  }
  verification: {
    google?: string
    bing?: string
    yandex?: string
  }
}

export interface PageSEO {
  title: string
  description: string
  keywords?: string[]
  canonical?: string
  noindex?: boolean
  nofollow?: boolean
  openGraph?: {
    title?: string
    description?: string
    image?: string
    url?: string
    type?: string
  }
  twitter?: {
    title?: string
    description?: string
    image?: string
  }
  structuredData?: any[]
}

export interface BreadcrumbItem {
  name: string
  item: string
}

export interface StructuredDataConfig {
  '@context': string
  '@type': string
  [key: string]: any
}

export interface FAQItem {
  question: string
  answer: string
}

export interface HowToStep {
  name: string
  text: string
  image?: string
  url?: string
}
