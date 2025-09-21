export interface ToolCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  featured?: boolean
}

export interface ToolMetadata {
  title: string
  description: string
  keywords: string[]
  category: 'network' | 'development' | 'seo' | 'data' | 'media' | 'utility' | 'advanced'
  icon: string
  color: string
  featured?: boolean
}

export interface Tool {
  id: string
  name: string
  description: string
  path: string
  keywords: string[]
  icon: string
  category?: {
    id: string
    name: string
    color: string
  }
  popular?: boolean
  featured?: boolean
  new?: boolean
}

export interface AnimationConfig {
  duration?: number
  delay?: number
  easing?: string
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both'
  iterationCount?: number | 'infinite'
}

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  success: boolean
  timestamp?: number
}

export interface LoadingState {
  isLoading: boolean
  progress?: number
  message?: string
}

export interface ErrorState {
  hasError: boolean
  error?: Error | string
  retry?: () => void
}

export interface IPData {
  ip: string
  country?: string
  countryCode?: string
  region?: string
  regionName?: string
  city?: string
  zip?: string
  lat?: number
  lon?: number
  timezone?: string
  isp?: string
  org?: string
  as?: string
  query?: string
}

export interface SSLData {
  valid: boolean
  issuer?: string
  subject?: string
  validFrom?: string
  validTo?: string
  daysUntilExpiry?: number
  algorithm?: string
  keySize?: number
  serialNumber?: string
  fingerprint?: string
}

export interface DNSRecord {
  type: string
  name: string
  value: string
  ttl?: number
  priority?: number
}

export interface SEOData {
  title?: string
  description?: string
  keywords?: string[]
  h1?: string[]
  h2?: string[]
  h3?: string[]
  images?: string[]
  links?: string[]
  wordCount?: number
  readingTime?: number
  score?: number
  recommendations?: string[]
}

export interface HashResult {
  algorithm: string
  hash: string
  input: string
  length: number
}

export interface ConversionResult {
  input: string
  output: string
  format: string
  size?: number
  success: boolean
  error?: string
}

export interface GeneratorOptions {
  length?: number
  includeUppercase?: boolean
  includeLowercase?: boolean
  includeNumbers?: boolean
  includeSymbols?: boolean
  excludeSimilar?: boolean
  excludeAmbiguous?: boolean
}

export interface CodeFormatOptions {
  language: string
  indentSize?: number
  useSpaces?: boolean
  maxLineLength?: number
  preserveComments?: boolean
}

export interface ImageOptimizationOptions {
  quality: number
  format: 'jpeg' | 'png' | 'webp'
  width?: number
  height?: number
  progressive?: boolean
}

export interface QRCodeOptions {
  text: string
  size?: number
  margin?: number
  color?: {
    dark: string
    light: string
  }
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
}

export interface UnitConversion {
  from: string
  to: string
  value: number
  result: number
  category: string
}

export interface TimestampData {
  timestamp: number
  date: string
  iso: string
  unix: number
  utc: string
  local: string
  timezone: string
}

export interface ColorPalette {
  primary: string
  secondary: string
  accent: string
  neutral: string
  complementary: string
  triadic: string[]
  analogous: string[]
  shades: string[]
  tints: string[]
}

export interface TextAnalysis {
  wordCount: number
  characterCount: number
  characterCountNoSpaces: number
  sentenceCount: number
  paragraphCount: number
  averageWordsPerSentence: number
  averageCharactersPerWord: number
  readingTime: number
  speakingTime: number
  fleschScore: number
  keywords: string[]
  sentiment: 'positive' | 'negative' | 'neutral'
  language: string
}

export interface DiffResult {
  added: number
  removed: number
  modified: number
  unchanged: number
  changes: Array<{
    type: 'added' | 'removed' | 'modified' | 'unchanged'
    line: number
    content: string
    oldContent?: string
  }>
}

export interface CronExpression {
  expression: string
  description: string
  nextRun: string[]
  fields: {
    second: string
    minute: string
    hour: string
    day: string
    month: string
    weekday: string
  }
}

export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url: string
  headers?: Record<string, string>
  body?: any
  timeout?: number
}

export interface APIResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  data: any
  duration: number
  size: number
}

export interface SecurityHeaders {
  'Strict-Transport-Security'?: string
  'X-Frame-Options'?: string
  'X-Content-Type-Options'?: string
  'Referrer-Policy'?: string
  'Permissions-Policy'?: string
  'Content-Security-Policy'?: string
  'X-XSS-Protection'?: string
}

export interface WebsiteMonitor {
  url: string
  status: 'up' | 'down' | 'checking'
  responseTime?: number
  statusCode?: number
  lastChecked: string
  uptime: number
  downtime: number
  averageResponseTime: number
}

export interface SpeedTestResult {
  download: number
  upload: number
  ping: number
  jitter: number
  server: string
  timestamp: number
  connection: 'wifi' | 'ethernet' | 'mobile'
}

export interface PortScanResult {
  port: number
  status: 'open' | 'closed' | 'filtered'
  service?: string
  version?: string
  responseTime?: number
}

export interface SocialPreview {
  title: string
  description: string
  image: string
  url: string
  siteName: string
  type: 'website' | 'article' | 'video' | 'music' | 'book'
  twitter?: {
    card: 'summary' | 'summary_large_image' | 'app' | 'player'
    site?: string
    creator?: string
  }
  facebook?: {
    appId?: string
    type: 'website' | 'article' | 'video' | 'music' | 'book'
  }
}

export interface SitemapData {
  url: string
  lastModified: string
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
  images?: string[]
  videos?: string[]
}

export interface CSVData {
  headers: string[]
  rows: string[][]
  totalRows: number
  totalColumns: number
  delimiter: string
  encoding: string
}

export interface XMLData {
  valid: boolean
  formatted: string
  minified: string
  errors?: string[]
  warnings?: string[]
  structure?: any
}

export interface YAMLData {
  valid: boolean
  formatted: string
  minified: string
  errors?: string[]
  warnings?: string[]
  structure?: any
}

export interface MarkdownData {
  html: string
  toc: Array<{
    level: number
    text: string
    id: string
  }>
  wordCount: number
  readingTime: number
  links: string[]
  images: string[]
}

export interface CodeFormatterResult {
  formatted: string
  minified: string
  language: string
  errors: string[]
  warnings: string[]
  statistics: {
    lines: number
    characters: number
    nonWhitespaceCharacters: number
  }
}
