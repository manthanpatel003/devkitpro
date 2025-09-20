import { NextRequest, NextResponse } from 'next/server'

interface ProxyRequest {
  url: string
  method?: string
  headers?: Record<string, string>
  body?: string
  timeout?: number
}

interface ProxyResponse {
  success: boolean
  status: number
  statusText: string
  headers: Record<string, string>
  data: string
  url: string
  redirected: boolean
  finalUrl?: string
  timing: {
    start: number
    end: number
    duration: number
  }
  error?: string
}

export async function POST(req: NextRequest): Promise<NextResponse<ProxyResponse>> {
  const startTime = performance.now()

  try {
    const {
      url,
      method = 'GET',
      headers = {},
      body,
      timeout = 10000,
    }: ProxyRequest = await req.json()

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          data: '',
          url: '',
          redirected: false,
          timing: {
            start: startTime,
            end: performance.now(),
            duration: 0,
          },
          error: 'URL is required',
        },
        { status: 400 }
      )
    }

    // Validate URL
    let targetUrl: URL
    try {
      targetUrl = new URL(url.startsWith('http') ? url : `https://${url}`)
    } catch {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          data: '',
          url: url,
          redirected: false,
          timing: {
            start: startTime,
            end: performance.now(),
            duration: performance.now() - startTime,
          },
          error: 'Invalid URL format',
        },
        { status: 400 }
      )
    }

    // Security: Block internal/private IPs and localhost
    const hostname = targetUrl.hostname.toLowerCase()
    if (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.') ||
      hostname === '::1' ||
      hostname.endsWith('.local')
    ) {
      return NextResponse.json(
        {
          success: false,
          status: 403,
          statusText: 'Forbidden',
          headers: {},
          data: '',
          url: targetUrl.toString(),
          redirected: false,
          timing: {
            start: startTime,
            end: performance.now(),
            duration: performance.now() - startTime,
          },
          error: 'Access to private/internal addresses is not allowed',
        },
        { status: 403 }
      )
    }

    // Prepare request headers
    const requestHeaders: HeadersInit = {
      'User-Agent': 'Mozilla/5.0 (compatible; DevToolsProxy/1.0; +https://devtools-hub.com)',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      DNT: '1',
      Connection: 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      ...headers,
    }

    // Remove hop-by-hop headers
    const hopByHopHeaders = [
      'connection',
      'keep-alive',
      'proxy-authenticate',
      'proxy-authorization',
      'te',
      'trailers',
      'transfer-encoding',
      'upgrade',
    ]

    hopByHopHeaders.forEach(header => {
      delete requestHeaders[header]
    })

    try {
      // Use AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(targetUrl.toString(), {
        method: method.toUpperCase(),
        headers: requestHeaders,
        body: method.toUpperCase() !== 'GET' && method.toUpperCase() !== 'HEAD' ? body : undefined,
        signal: controller.signal,
        redirect: 'follow',
      })

      clearTimeout(timeoutId)
      const endTime = performance.now()

      // Get response data
      const data = await response.text()

      // Extract response headers
      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      return NextResponse.json({
        success: true,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data,
        url: targetUrl.toString(),
        redirected: response.redirected,
        finalUrl: response.url !== targetUrl.toString() ? response.url : undefined,
        timing: {
          start: startTime,
          end: endTime,
          duration: endTime - startTime,
        },
      })
    } catch (fetchError: any) {
      const endTime = performance.now()

      let errorMessage = fetchError.message
      if (fetchError.name === 'AbortError') {
        errorMessage = `Request timeout after ${timeout}ms`
      }

      return NextResponse.json({
        success: false,
        status: 0,
        statusText: 'Network Error',
        headers: {},
        data: '',
        url: targetUrl.toString(),
        redirected: false,
        timing: {
          start: startTime,
          end: endTime,
          duration: endTime - startTime,
        },
        error: errorMessage,
      })
    }
  } catch (error: any) {
    const endTime = performance.now()
    console.error('Proxy Error:', error)

    return NextResponse.json(
      {
        success: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        data: '',
        url: '',
        redirected: false,
        timing: {
          start: startTime,
          end: endTime,
          duration: endTime - startTime,
        },
        error: `Proxy request failed: ${error.message}`,
      },
      { status: 500 }
    )
  }
}

// GET method for simple URL fetching
export async function GET(req: NextRequest): Promise<NextResponse> {
  const url = req.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json(
      {
        error: 'URL parameter is required',
      },
      { status: 400 }
    )
  }

  // Forward to POST method
  return POST(
    new NextRequest(req.url, {
      method: 'POST',
      headers: req.headers,
      body: JSON.stringify({ url }),
    })
  )
}

// Handle CORS for development
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}
