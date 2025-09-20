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

    // Check if URL is accessible
    const startTime = Date.now()
    let response: Response
    let responseTime: number
    let status: number
    let statusText: string
    let headers: Record<string, string> = {}
    let error: string | null = null

    try {
      response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WebsiteMonitor/1.0)',
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })
      
      responseTime = Date.now() - startTime
      status = response.status
      statusText = response.statusText
      
      // Get response headers
      response.headers.forEach((value, key) => {
        headers[key] = value
      })
    } catch (err) {
      responseTime = Date.now() - startTime
      status = 0
      statusText = 'Connection failed'
      error = err instanceof Error ? err.message : 'Unknown error'
    }

    // Determine if site is up
    const isUp = status >= 200 && status < 400
    const isDown = status >= 400 || status === 0

    // Get additional information
    const server = headers['server'] || 'Unknown'
    const contentType = headers['content-type'] || 'Unknown'
    const contentLength = headers['content-length'] || 'Unknown'
    const lastModified = headers['last-modified'] || 'Unknown'
    const expires = headers['expires'] || 'Unknown'
    const cacheControl = headers['cache-control'] || 'Unknown'

    // Check for security headers
    const securityHeaders = {
      'strict-transport-security': headers['strict-transport-security'] || 'Not set',
      'x-frame-options': headers['x-frame-options'] || 'Not set',
      'x-content-type-options': headers['x-content-type-options'] || 'Not set',
      'x-xss-protection': headers['x-xss-protection'] || 'Not set',
      'content-security-policy': headers['content-security-policy'] || 'Not set',
      'referrer-policy': headers['referrer-policy'] || 'Not set',
      'permissions-policy': headers['permissions-policy'] || 'Not set'
    }

    // Calculate security score
    const securityScore = Object.values(securityHeaders).filter(header => header !== 'Not set').length
    const maxSecurityScore = Object.keys(securityHeaders).length
    const securityPercentage = Math.round((securityScore / maxSecurityScore) * 100)

    // Performance analysis
    const performance = {
      responseTime,
      isFast: responseTime < 1000,
      isSlow: responseTime > 3000,
      grade: responseTime < 500 ? 'A' : responseTime < 1000 ? 'B' : responseTime < 2000 ? 'C' : 'D'
    }

    // SSL/TLS information
    const sslInfo = {
      isHttps: parsedUrl.protocol === 'https:',
      hasSsl: headers['strict-transport-security'] ? true : false,
      sslGrade: parsedUrl.protocol === 'https:' ? 'A' : 'F'
    }

    const result = {
      url: parsedUrl.href,
      status,
      statusText,
      isUp,
      isDown,
      responseTime,
      server,
      contentType,
      contentLength,
      lastModified,
      expires,
      cacheControl,
      securityHeaders,
      securityScore,
      securityPercentage,
      performance,
      sslInfo,
      error,
      timestamp: new Date().toISOString(),
      checkedAt: new Date().toLocaleString()
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Website monitor error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}