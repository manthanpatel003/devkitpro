import { NextRequest, NextResponse } from 'next/server'

interface SecurityHeadersRequest {
  url: string
}

interface SecurityHeadersResponse {
  success: boolean
  url: string
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
  score: number
  headers: {
    present: SecurityHeader[]
    missing: SecurityHeader[]
    warnings: SecurityHeader[]
  }
  recommendations: string[]
  summary: {
    total: number
    passed: number
    failed: number
    warnings: number
  }
  error?: string
}

interface SecurityHeader {
  name: string
  value?: string
  status: 'pass' | 'fail' | 'warning' | 'info'
  description: string
  recommendation?: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  moreInfo?: string
}

const SECURITY_HEADERS_CONFIG: Record<string, Omit<SecurityHeader, 'value' | 'status'>> = {
  'strict-transport-security': {
    name: 'HTTP Strict Transport Security (HSTS)',
    description: 'Enforces secure HTTPS connections and prevents protocol downgrade attacks',
    recommendation: 'Add: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
    severity: 'critical',
    moreInfo: 'HSTS tells browsers to only access your site over HTTPS',
  },
  'content-security-policy': {
    name: 'Content Security Policy (CSP)',
    description: 'Prevents XSS attacks by controlling which resources can be loaded',
    recommendation: 'Implement a strict CSP policy to prevent XSS attacks',
    severity: 'critical',
    moreInfo: 'CSP is your best defense against XSS and data injection attacks',
  },
  'x-frame-options': {
    name: 'X-Frame-Options',
    description: 'Prevents your site from being embedded in iframes (clickjacking protection)',
    recommendation: 'Add: X-Frame-Options: DENY or SAMEORIGIN',
    severity: 'high',
    moreInfo: 'Protects against clickjacking attacks',
  },
  'x-content-type-options': {
    name: 'X-Content-Type-Options',
    description: 'Prevents MIME type sniffing attacks',
    recommendation: 'Add: X-Content-Type-Options: nosniff',
    severity: 'medium',
    moreInfo: 'Prevents browsers from interpreting files as different MIME types',
  },
  'referrer-policy': {
    name: 'Referrer Policy',
    description: 'Controls how much referrer information is sent with requests',
    recommendation: 'Add: Referrer-Policy: strict-origin-when-cross-origin',
    severity: 'medium',
    moreInfo: 'Protects user privacy by controlling referrer information',
  },
  'permissions-policy': {
    name: 'Permissions Policy',
    description: 'Controls which browser features can be used',
    recommendation: 'Implement Permissions Policy to control browser features',
    severity: 'medium',
    moreInfo: 'Formerly Feature Policy, controls access to browser APIs',
  },
  'x-xss-protection': {
    name: 'X-XSS-Protection',
    description: 'Legacy XSS protection (superseded by CSP)',
    recommendation: 'Add: X-XSS-Protection: 0 (disable legacy protection, use CSP instead)',
    severity: 'low',
    moreInfo: 'Legacy header, CSP provides better protection',
  },
  'cross-origin-embedder-policy': {
    name: 'Cross-Origin Embedder Policy (COEP)',
    description: 'Prevents loading of cross-origin resources without explicit permission',
    recommendation: 'Consider adding COEP for enhanced security isolation',
    severity: 'low',
    moreInfo: 'Enables cross-origin isolation for better security',
  },
  'cross-origin-opener-policy': {
    name: 'Cross-Origin Opener Policy (COOP)',
    description: 'Isolates your document from cross-origin windows',
    recommendation: 'Add: Cross-Origin-Opener-Policy: same-origin',
    severity: 'low',
    moreInfo: 'Prevents cross-origin windows from accessing your document',
  },
  'cross-origin-resource-policy': {
    name: 'Cross-Origin Resource Policy (CORP)',
    description: 'Controls which origins can include your resources',
    recommendation: 'Consider adding CORP based on your resource sharing needs',
    severity: 'low',
    moreInfo: 'Protects against certain cross-origin attacks',
  },
}

export async function POST(req: NextRequest): Promise<NextResponse<SecurityHeadersResponse>> {
  try {
    const { url }: SecurityHeadersRequest = await req.json()

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          url: '',
          grade: 'F',
          score: 0,
          headers: { present: [], missing: [], warnings: [] },
          recommendations: [],
          summary: { total: 0, passed: 0, failed: 0, warnings: 0 },
          error: 'URL is required',
        },
        { status: 400 }
      )
    }

    // Ensure URL has protocol
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`

    try {
      // Fetch the URL to get headers
      const response = await fetch(cleanUrl, {
        method: 'HEAD', // Only get headers
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; SecurityHeadersChecker/1.0; +https://devtools-hub.com)',
        },
      })

      const analysis = analyzeSecurityHeaders(response.headers, cleanUrl)

      return NextResponse.json({
        success: true,
        url: cleanUrl,
        ...analysis,
      })
    } catch (fetchError: any) {
      return NextResponse.json({
        success: false,
        url: cleanUrl,
        grade: 'F',
        score: 0,
        headers: { present: [], missing: [], warnings: [] },
        recommendations: ['Unable to fetch headers - site may be unreachable'],
        summary: { total: 0, passed: 0, failed: 0, warnings: 0 },
        error: `Failed to fetch headers: ${fetchError.message}`,
      })
    }
  } catch (error: any) {
    console.error('Security Headers Check Error:', error)

    return NextResponse.json(
      {
        success: false,
        url: '',
        grade: 'F',
        score: 0,
        headers: { present: [], missing: [], warnings: [] },
        recommendations: [],
        summary: { total: 0, passed: 0, failed: 0, warnings: 0 },
        error: `Security headers check failed: ${error.message}`,
      },
      { status: 500 }
    )
  }
}

function analyzeSecurityHeaders(headers: Headers, url: string) {
  const present: SecurityHeader[] = []
  const missing: SecurityHeader[] = []
  const warnings: SecurityHeader[] = []
  const recommendations: string[] = []

  let score = 0
  const isHttps = url.startsWith('https')

  // Check each security header
  Object.entries(SECURITY_HEADERS_CONFIG).forEach(([headerName, config]) => {
    const headerValue = headers.get(headerName)

    if (headerValue) {
      const headerAnalysis = analyzeSpecificHeader(headerName, headerValue, isHttps)
      present.push({
        ...config,
        value: headerValue,
        status: headerAnalysis.status,
        recommendation: headerAnalysis.recommendation,
      })

      if (headerAnalysis.status === 'pass') {
        score += getHeaderScore(headerName)
      } else if (headerAnalysis.status === 'warning') {
        warnings.push({
          ...config,
          value: headerValue,
          status: 'warning',
          recommendation: headerAnalysis.recommendation,
        })
      }
    } else {
      missing.push({
        ...config,
        status: 'fail',
      })
    }
  })

  // Generate specific recommendations
  if (!headers.get('strict-transport-security') && isHttps) {
    recommendations.push('🔴 Critical: Add HSTS header to prevent protocol downgrade attacks')
  }
  if (!headers.get('content-security-policy')) {
    recommendations.push('🔴 Critical: Implement Content Security Policy to prevent XSS attacks')
  }
  if (!headers.get('x-frame-options')) {
    recommendations.push('🟠 High: Add X-Frame-Options to prevent clickjacking')
  }
  if (!headers.get('x-content-type-options')) {
    recommendations.push('🟡 Medium: Add X-Content-Type-Options to prevent MIME sniffing')
  }

  // Additional checks
  const server = headers.get('server')
  if (server && (server.includes('Apache') || server.includes('nginx') || server.includes('IIS'))) {
    recommendations.push('🟡 Consider hiding server information to reduce attack surface')
  }

  const poweredBy = headers.get('x-powered-by')
  if (poweredBy) {
    recommendations.push('🟡 Remove X-Powered-By header to avoid revealing technology stack')
  }

  // Calculate grade
  const maxScore = Object.keys(SECURITY_HEADERS_CONFIG).reduce(
    (total, header) => total + getHeaderScore(header),
    0
  )
  const percentage = (score / maxScore) * 100

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
  if (percentage >= 95) grade = 'A+'
  else if (percentage >= 85) grade = 'A'
  else if (percentage >= 75) grade = 'B'
  else if (percentage >= 65) grade = 'C'
  else if (percentage >= 50) grade = 'D'
  else grade = 'F'

  return {
    grade,
    score: Math.round(percentage),
    headers: { present, missing, warnings },
    recommendations,
    summary: {
      total: Object.keys(SECURITY_HEADERS_CONFIG).length,
      passed: present.filter(h => h.status === 'pass').length,
      failed: missing.length,
      warnings: warnings.length,
    },
  }
}

function analyzeSpecificHeader(headerName: string, value: string, isHttps: boolean) {
  switch (headerName) {
    case 'strict-transport-security':
      if (!isHttps) {
        return { status: 'warning' as const, recommendation: 'HSTS only works over HTTPS' }
      }
      const hasMaxAge = /max-age=(\d+)/.test(value)
      const maxAge = hasMaxAge ? parseInt(value.match(/max-age=(\d+)/)![1]) : 0
      const hasIncludeSubDomains = value.includes('includeSubDomains')
      const hasPreload = value.includes('preload')

      if (maxAge >= 31536000 && hasIncludeSubDomains) {
        return { status: 'pass' as const }
      } else if (maxAge > 0) {
        return {
          status: 'warning' as const,
          recommendation: 'Consider longer max-age and includeSubDomains',
        }
      }
      return { status: 'warning' as const, recommendation: 'Invalid HSTS configuration' }

    case 'content-security-policy':
      if (value.includes("'unsafe-inline'") || value.includes("'unsafe-eval'")) {
        return {
          status: 'warning' as const,
          recommendation: 'Avoid unsafe-inline and unsafe-eval directives',
        }
      }
      if (value === "default-src 'self'") {
        return { status: 'pass' as const }
      }
      return { status: 'pass' as const } // CSP is complex, assume good if present

    case 'x-frame-options':
      if (value.toUpperCase() === 'DENY' || value.toUpperCase() === 'SAMEORIGIN') {
        return { status: 'pass' as const }
      }
      return { status: 'warning' as const, recommendation: 'Use DENY or SAMEORIGIN' }

    case 'x-content-type-options':
      if (value.toLowerCase() === 'nosniff') {
        return { status: 'pass' as const }
      }
      return { status: 'warning' as const, recommendation: 'Should be set to "nosniff"' }

    case 'x-xss-protection':
      if (value === '0') {
        return { status: 'pass' as const } // Recommended to disable in favor of CSP
      }
      return { status: 'warning' as const, recommendation: 'Set to "0" and use CSP instead' }

    default:
      return { status: 'pass' as const }
  }
}

function getHeaderScore(headerName: string): number {
  const scores: Record<string, number> = {
    'strict-transport-security': 30,
    'content-security-policy': 25,
    'x-frame-options': 15,
    'x-content-type-options': 10,
    'referrer-policy': 8,
    'permissions-policy': 5,
    'x-xss-protection': 3,
    'cross-origin-embedder-policy': 2,
    'cross-origin-opener-policy': 1,
    'cross-origin-resource-policy': 1,
  }
  return scores[headerName] || 0
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
