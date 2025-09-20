import { ADVANCED_TOOLS, TOOL_CATEGORIES as CATEGORIES } from './tools-config'

export const SITE_CONFIG = {
  name: 'DevTools Hub',
  description: 'Free developer tools and utilities to boost your productivity',
  url: 'https://devtools-hub.vercel.app',
  ogImage: '/og-image.png',
  creator: '@devtools_hub',
  keywords: [
    'developer tools',
    'free tools',
    'online utilities',
    'JSON formatter',
    'IP checker',
    'SEO tools',
    'web development',
    'programming tools',
    'developer utilities',
    'online tools',
  ],
}

export const seoConfig = SITE_CONFIG

export const TOOL_CATEGORIES = CATEGORIES
export const TOOLS = ADVANCED_TOOLS

export const NAVIGATION_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Tools', href: '/tools' },
  { name: 'Categories', href: '/categories' },
  { name: 'About', href: '/about' },
]

export const SOCIAL_LINKS = {
  github: 'https://github.com/devtools-hub',
  twitter: 'https://twitter.com/devtools_hub',
  linkedin: 'https://linkedin.com/company/devtools-hub',
}

export const KEYBOARD_SHORTCUTS = {
  search: 'Ctrl+K',
  theme: 'Ctrl+Shift+T',
  favorites: 'Ctrl+Shift+F',
  home: 'Ctrl+Shift+H',
}

export const API_ENDPOINTS = {
  ipify: 'https://api.ipify.org?format=json',
  ipApi: 'http://ip-api.com/json/',
  dnsGoogle: 'https://dns.google/resolve',
  domainsDb: 'https://api.domainsdb.info/v1/domains/search?domain=',
}

export const PERFORMANCE_THRESHOLDS = {
  fcp: 1800, // First Contentful Paint
  lcp: 2500, // Largest Contentful Paint
  fid: 100, // First Input Delay
  cls: 0.1, // Cumulative Layout Shift
}
