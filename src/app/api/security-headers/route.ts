import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Fetch the URL and get headers
    let response: Response
    let headers: Record<string, string> = {}
    let error: string | null = null

    try {
      response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SecurityHeadersAnalyzer/1.0)',
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })
      
      // Get response headers
      response.headers.forEach((value, key) => {
        headers[key.toLowerCase()] = value
      })
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error'
    }

    // Analyze security headers
    const securityHeaders = {
      'strict-transport-security': {
        present: !!headers['strict-transport-security'],
        value: headers['strict-transport-security'] || null,
        grade: 'A',
        description: 'Enforces HTTPS connections',
        recommendation: 'Include max-age directive with at least 31536000 seconds (1 year)'
      },
      'x-frame-options': {
        present: !!headers['x-frame-options'],
        value: headers['x-frame-options'] || null,
        grade: 'A',
        description: 'Prevents clickjacking attacks',
        recommendation: 'Use DENY or SAMEORIGIN'
      },
      'x-content-type-options': {
        present: !!headers['x-content-type-options'],
        value: headers['x-content-type-options'] || null,
        grade: 'A',
        description: 'Prevents MIME type sniffing',
        recommendation: 'Set to nosniff'
      },
      'x-xss-protection': {
        present: !!headers['x-xss-protection'],
        value: headers['x-xss-protection'] || null,
        grade: 'B',
        description: 'Enables XSS filtering',
        recommendation: 'Set to 1; mode=block (deprecated in modern browsers)'
      },
      'content-security-policy': {
        present: !!headers['content-security-policy'],
        value: headers['content-security-policy'] || null,
        grade: 'A',
        description: 'Prevents XSS and data injection attacks',
        recommendation: 'Implement a comprehensive CSP policy'
      },
      'referrer-policy': {
        present: !!headers['referrer-policy'],
        value: headers['referrer-policy'] || null,
        grade: 'A',
        description: 'Controls referrer information',
        recommendation: 'Use strict-origin-when-cross-origin'
      },
      'permissions-policy': {
        present: !!headers['permissions-policy'],
        value: headers['permissions-policy'] || null,
        grade: 'A',
        description: 'Controls browser features',
        recommendation: 'Restrict unnecessary permissions'
      },
      'cross-origin-embedder-policy': {
        present: !!headers['cross-origin-embedder-policy'],
        value: headers['cross-origin-embedder-policy'] || null,
        grade: 'A',
        description: 'Controls cross-origin embedding',
        recommendation: 'Use require-corp for enhanced security'
      },
      'cross-origin-opener-policy': {
        present: !!headers['cross-origin-opener-policy'],
        value: headers['cross-origin-opener-policy'] || null,
        grade: 'A',
        description: 'Controls cross-origin window access',
        recommendation: 'Use same-origin for enhanced security'
      },
      'cross-origin-resource-policy': {
        present: !!headers['cross-origin-resource-policy'],
        value: headers['cross-origin-resource-policy'] || null,
        grade: 'A',
        description: 'Controls cross-origin resource access',
        recommendation: 'Use same-origin for enhanced security'
      }
    }

    // Calculate security score
    const presentHeaders = Object.values(securityHeaders).filter(header => header.present).length
    const totalHeaders = Object.keys(securityHeaders).length
    const securityScore = Math.round((presentHeaders / totalHeaders) * 100)

    // Determine overall grade
    let overallGrade = 'F'
    if (securityScore >= 90) overallGrade = 'A'
    else if (securityScore >= 80) overallGrade = 'B'
    else if (securityScore >= 70) overallGrade = 'C'
    else if (securityScore >= 60) overallGrade = 'D'

    // Get missing headers
    const missingHeaders = Object.entries(securityHeaders)
      .filter(([_, header]) => !header.present)
      .map(([name, _]) => name)

    // Get present headers
    const presentHeadersList = Object.entries(securityHeaders)
      .filter(([_, header]) => header.present)
      .map(([name, header]) => ({ name, ...header }))

    // Security recommendations
    const recommendations = []
    
    if (!headers['strict-transport-security']) {
      recommendations.push('Implement Strict-Transport-Security header to enforce HTTPS')
    }
    
    if (!headers['x-frame-options']) {
      recommendations.push('Add X-Frame-Options header to prevent clickjacking')
    }
    
    if (!headers['x-content-type-options']) {
      recommendations.push('Set X-Content-Type-Options to nosniff')
    }
    
    if (!headers['content-security-policy']) {
      recommendations.push('Implement Content-Security-Policy header')
    }
    
    if (!headers['referrer-policy']) {
      recommendations.push('Add Referrer-Policy header to control referrer information')
    }

    // Additional security checks
    const additionalChecks = {
      https: parsedUrl.protocol === 'https:',
      hasServerHeader: !!headers['server'],
      hasXPoweredBy: !!headers['x-powered-by'],
      hasXAspnetVersion: !!headers['x-aspnet-version'],
      hasXGenerator: !!headers['x-generator']
    }

    const result = {
      url: parsedUrl.href,
      securityScore,
      overallGrade,
      presentHeaders: presentHeadersList,
      missingHeaders,
      recommendations,
      additionalChecks,
      error,
      timestamp: new Date().toISOString(),
      analyzedAt: new Date().toLocaleString()
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Security headers analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}