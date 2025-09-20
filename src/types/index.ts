export interface Tool {
  id: string
  name: string
  description: string
  category: ToolCategory
  icon: string
  path: string
  featured?: boolean
  popular?: boolean
  new?: boolean
  keywords: string[]
  usageCount?: number
}

export interface ToolCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

export interface SEOMetadata {
  title: string
  description: string
  keywords: string[]
  openGraph?: {
    title?: string
    description?: string
    image?: string
    type?: string
  }
  twitter?: {
    card?: string
    title?: string
    description?: string
    image?: string
  }
  structuredData?: any
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface IPInfo {
  ip: string
  country?: string
  region?: string
  city?: string
  timezone?: string
  isp?: string
  lat?: number
  lon?: number
}

export interface DNSRecord {
  name: string
  type: number
  TTL: number
  data: string
}

export interface DomainInfo {
  domain: string
  create_date?: string
  update_date?: string
  country?: string
  isDead?: boolean
  A?: string[]
  NS?: string[]
  CNAME?: string[]
  MX?: string[]
  TXT?: string[]
}

export interface HashResult {
  algorithm: string
  hash: string
  input: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  formatted?: string
}

export interface ToolResult {
  success: boolean
  data?: any
  error?: string
  timestamp: number
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  favorites: string[]
  recentTools: string[]
  settings: {
    autoSave: boolean
    showKeyboardShortcuts: boolean
    compactMode: boolean
  }
}

export interface AnimationConfig {
  duration: number
  delay?: number
  easing?: string
  stagger?: number
}

export interface PerformanceMetrics {
  fcp: number // First Contentful Paint
  lcp: number // Largest Contentful Paint
  fid: number // First Input Delay
  cls: number // Cumulative Layout Shift
  ttfb: number // Time to First Byte
}
