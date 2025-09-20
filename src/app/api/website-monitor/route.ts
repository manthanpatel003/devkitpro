import { NextRequest, NextResponse } from 'next/server'

interface MonitorRequest {
  url: string
  timeout?: number
}

interface MonitorResponse {
  success: boolean
  url: string
  status: 'online' | 'offline' | 'error'
  statusCode?: number
  responseTime: number
  headers?: Record<string, string>
  performance: {
    dns: number
    connect: number
    ssl?: number
    ttfb: number // Time to First Byte
    download: number
    total: number
  }
  metadata: {
    title?: string
    description?: string
    contentType?: string
    contentLength?: number
    server?: string
    powerBy?: string
    lastModified?: string
    charset?: string
  }
  security: {
    https: boolean
    hsts: boolean
    csp: boolean
    xFrame: boolean
    xss: boolean
    grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
  }
  lighthouse?: {
    performance: number
    accessibility: number
    bestPractices: number
    seo: number
  }
  error?: string
}

export async function POST(req: NextRequest): Promise<NextResponse<MonitorResponse>> {
  try {
    const { url, timeout = 10000 }: MonitorRequest = await req.json()

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          url: '',
          status: 'error' as const,
          responseTime: 0,
          performance: {
            dns: 0,
            connect: 0,
            ttfb: 0,
            download: 0,
            total: 0,
          },
          metadata: {},
          security: {
            https: false,
            hsts: false,
            csp: false,
            xFrame: false,
            xss: false,
            grade: 'F' as const,
          },
          error: 'URL is required',
        },
        { status: 400 }
      )
    }

    // Ensure URL has protocol
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`

    const startTime = Date.now()
    const performanceStart = performance.now()

    try {
      // Use AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(cleanUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WebsiteMonitor/1.0; +https://devtools-hub.com)',
        },
      })

      clearTimeout(timeoutId)
      const endTime = Date.now()
      const responseTime = endTime - startTime

      // Get response text for analysis
      const html = await response.text()
      const performanceEnd = performance.now()
      const totalTime = performanceEnd - performanceStart

      // Extract metadata from HTML
      const metadata = extractMetadata(html, response)

      // Analyze security headers
      const security = analyzeSecurityHeaders(response.headers, cleanUrl)

      // Simulate performance metrics (in a real app, you'd use more sophisticated timing)
      const performance_metrics = {
        dns: Math.round(totalTime * 0.1),
        connect: Math.round(totalTime * 0.15),
        ssl: cleanUrl.startsWith('https') ? Math.round(totalTime * 0.1) : undefined,
        ttfb: Math.round(totalTime * 0.4),
        download: Math.round(totalTime * 0.25),
        total: Math.round(totalTime),
      }

      // Generate basic Lighthouse-style scores
      const lighthouse = generateLighthouseScores(html, response.headers, security)

      return NextResponse.json({
        success: true,
        url: cleanUrl,
        status: response.ok ? ('online' as const) : ('error' as const),
        statusCode: response.status,
        responseTime,
        headers: Object.fromEntries(response.headers.entries()),
        performance: performance_metrics,
        metadata,
        security,
        lighthouse,
      })
    } catch (fetchError: any) {
      const responseTime = Date.now() - startTime

      return NextResponse.json({
        success: false,
        url: cleanUrl,
        status: 'offline' as const,
        responseTime,
        performance: {
          dns: 0,
          connect: 0,
          ttfb: 0,
          download: 0,
          total: responseTime,
        },
        metadata: {},
        security: {
          https: cleanUrl.startsWith('https'),
          hsts: false,
          csp: false,
          xFrame: false,
          xss: false,
          grade: 'F' as const,
        },
        error: fetchError.name === 'AbortError' ? 'Request timeout' : fetchError.message,
      })
    }
  } catch (error: any) {
    console.error('Website Monitor Error:', error)

    return NextResponse.json(
      {
        success: false,
        url: '',
        status: 'error' as const,
        responseTime: 0,
        performance: {
          dns: 0,
          connect: 0,
          ttfb: 0,
          download: 0,
          total: 0,
        },
        metadata: {},
        security: {
          https: false,
          hsts: false,
          csp: false,
          xFrame: false,
          xss: false,
          grade: 'F' as const,
        },
        error: `Monitor check failed: ${error.message}`,
      },
      { status: 500 }
    )
  }
}

function extractMetadata(html: string, response: Response) {
  const metadata: any = {}

  try {
    // Extract title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
    if (titleMatch) {
      metadata.title = titleMatch[1].trim().substring(0, 200)
    }

    // Extract meta description
    const descMatch = html.match(
      /<meta[^>]+name=['""]description['""][^>]+content=['""]([^'"]*)['""][^>]*>/i
    )
    if (descMatch) {
      metadata.description = descMatch[1].trim().substring(0, 300)
    }

    // Extract charset
    const charsetMatch = html.match(/<meta[^>]+charset=['""]?([^'">\s]+)/i)
    if (charsetMatch) {
      metadata.charset = charsetMatch[1]
    }

    // Get headers info
    metadata.contentType = response.headers.get('content-type') || 'unknown'
    metadata.contentLength = parseInt(response.headers.get('content-length') || '0')
    metadata.server = response.headers.get('server')
    metadata.powerBy = response.headers.get('x-powered-by')
    metadata.lastModified = response.headers.get('last-modified')
  } catch (error) {
    console.error('Metadata extraction error:', error)
  }

  return metadata
}

function analyzeSecurityHeaders(headers: Headers, url: string) {
  const security = {
    https: url.startsWith('https'),
    hsts: !!headers.get('strict-transport-security'),
    csp: !!headers.get('content-security-policy'),
    xFrame: !!headers.get('x-frame-options'),
    xss: !!headers.get('x-xss-protection'),
    grade: 'F' as 'A+' | 'A' | 'B' | 'C' | 'D' | 'F',
  }

  // Calculate security grade
  let score = 0
  if (security.https) score += 30
  if (security.hsts) score += 20
  if (security.csp) score += 25
  if (security.xFrame) score += 15
  if (security.xss) score += 10

  if (score >= 90) security.grade = 'A+'
  else if (score >= 80) security.grade = 'A'
  else if (score >= 70) security.grade = 'B'
  else if (score >= 60) security.grade = 'C'
  else if (score >= 50) security.grade = 'D'
  else security.grade = 'F'

  return security
}

function generateLighthouseScores(html: string, headers: Headers, security: any) {
  // Simulate Lighthouse scoring based on basic checks
  let performance = 85
  let accessibility = 80
  let bestPractices = 75
  let seo = 70

  // Performance factors
  if (html.length > 100000) performance -= 10 // Large HTML
  if (headers.get('cache-control')) performance += 5
  if (headers.get('content-encoding')?.includes('gzip')) performance += 5

  // Accessibility factors
  if (html.includes('alt=')) accessibility += 10
  if (html.includes('aria-')) accessibility += 5
  if (html.includes('<h1')) accessibility += 5

  // Best practices (based on security)
  bestPractices = Math.min(
    95,
    bestPractices + (security.grade === 'A+' ? 20 : security.grade === 'A' ? 15 : 0)
  )

  // SEO factors
  if (html.includes('<title>')) seo += 10
  if (html.includes('meta name="description"')) seo += 10
  if (html.includes('<h1>')) seo += 5
  if (html.includes('og:')) seo += 5

  return {
    performance: Math.min(100, Math.max(0, performance)),
    accessibility: Math.min(100, Math.max(0, accessibility)),
    bestPractices: Math.min(100, Math.max(0, bestPractices)),
    seo: Math.min(100, Math.max(0, seo)),
  }
}

// Handle CORS for development
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
