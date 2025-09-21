import { NextRequest, NextResponse } from 'next/server'
import * as tls from 'tls'

interface SSLCheckRequest {
  domain: string
  port?: number
}

interface SSLCheckResponse {
  success: boolean
  domain: string
  port: number
  valid: boolean
  certificate?: {
    subject: Record<string, string>
    issuer: Record<string, string>
    validFrom: string
    validTo: string
    daysUntilExpiry: number
    fingerprint: string
    serialNumber: string
    version: number
    signatureAlgorithm: string
    keySize?: number
    alternativeNames?: string[]
  }
  securityInfo?: {
    protocol: string
    cipher: string
    keyExchange?: string
    grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
    warnings: string[]
    recommendations: string[]
  }
  error?: string
}

export async function POST(req: NextRequest): Promise<NextResponse<SSLCheckResponse>> {
  try {
    const { domain, port = 443 }: SSLCheckRequest = await req.json()

    if (!domain) {
      return NextResponse.json(
        {
          success: false,
          domain: '',
          port: 443,
          valid: false,
          error: 'Domain is required',
        },
        { status: 400 }
      )
    }

    // Clean domain name
    const cleanDomain = domain
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .split(':')[0]

    const sslInfo = await checkSSLCertificate(cleanDomain, port)

    return NextResponse.json(sslInfo)
  } catch (error: any) {
    console.error('SSL Check Error:', error)

    return NextResponse.json(
      {
        success: false,
        domain: '',
        port: 443,
        valid: false,
        error: `SSL check failed: ${error.message}`,
      },
      { status: 500 }
    )
  }
}

function checkSSLCertificate(domain: string, port: number): Promise<SSLCheckResponse> {
  return new Promise(resolve => {
    const timeout = setTimeout(() => {
      resolve({
        success: false,
        domain,
        port,
        valid: false,
        error: 'Connection timeout (10s)',
      })
    }, 10000)

    try {
      const socket = tls.connect(
        port,
        domain,
        {
          servername: domain,
          rejectUnauthorized: false, // We want to analyze even invalid certs
          timeout: 10000,
        },
        () => {
          clearTimeout(timeout)

          try {
            const cert = socket.getPeerCertificate(true)
            const cipher = socket.getCipher()
            const protocol = socket.getProtocol()

            if (!cert || Object.keys(cert).length === 0) {
              socket.end()
              resolve({
                success: false,
                domain,
                port,
                valid: false,
                error: 'No certificate found',
              })
              return
            }

            const now = new Date()
            const validFrom = new Date(cert.valid_from)
            const validTo = new Date(cert.valid_to)
            const daysUntilExpiry = Math.floor(
              (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            )

            // Extract alternative names
            const altNames: string[] = []
            if (cert.subjectaltname) {
              const names = cert.subjectaltname.split(', ')
              names.forEach((name: string) => {
                if (name.startsWith('DNS:')) {
                  altNames.push(name.substring(4))
                }
              })
            }

            // Security analysis
            const warnings: string[] = []
            const recommendations: string[] = []
            let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'A'

            // Check expiry
            if (daysUntilExpiry < 0) {
              warnings.push('Certificate has expired')
              grade = 'F'
            } else if (daysUntilExpiry < 30) {
              warnings.push(`Certificate expires in ${daysUntilExpiry} days`)
              if (grade === 'A') grade = 'B'
            }

            // Check protocol
            if (protocol && protocol.includes('TLSv1.0')) {
              warnings.push('Using outdated TLS 1.0 protocol')
              grade = 'C'
            } else if (protocol && protocol.includes('TLSv1.1')) {
              warnings.push('Using outdated TLS 1.1 protocol')
              if (grade === 'A') grade = 'B'
            }

            // Check cipher
            if (cipher?.name?.includes('RC4')) {
              warnings.push('Using weak RC4 cipher')
              grade = 'F'
            } else if (cipher?.name?.includes('DES')) {
              warnings.push('Using weak DES cipher')
              grade = 'F'
            }

            // Check key size
            let keySize: number | undefined
            if (cert.bits) {
              keySize = cert.bits
              if (keySize < 2048) {
                warnings.push(`Weak key size: ${keySize} bits`)
                grade = 'C'
              }
            }

            // Generate recommendations
            if (daysUntilExpiry < 90) {
              recommendations.push('Renew certificate before expiration')
            }
            if (protocol && !protocol.includes('TLSv1.3')) {
              recommendations.push('Upgrade to TLS 1.3 for better security')
            }
            if (!cert.subjectaltname) {
              recommendations.push('Consider adding Subject Alternative Names')
            }

            const isValid = socket.authorized && daysUntilExpiry > 0

            socket.end()

            resolve({
              success: true,
              domain,
              port,
              valid: isValid,
              certificate: {
                subject: cert.subject ? { ...cert.subject } : {},
                issuer: cert.issuer ? { ...cert.issuer } : {},
                validFrom: cert.valid_from,
                validTo: cert.valid_to,
                daysUntilExpiry,
                fingerprint: cert.fingerprint,
                serialNumber: cert.serialNumber,
                version: (cert as any).version ?? null,
                signatureAlgorithm: (cert as any).sigalg ?? null,
                keySize,
                alternativeNames: altNames,
              },
              securityInfo: {
                protocol: protocol || 'Unknown',
                cipher: cipher?.name || 'Unknown',
                keyExchange: cipher?.standardName || 'Unknown',
                grade,
                warnings,
                recommendations,
              },
            })
          } catch (certError: any) {
            socket.end()
            resolve({
              success: false,
              domain,
              port,
              valid: false,
              error: `Certificate analysis failed: ${certError.message}`,
            })
          }
        }
      )

      socket.on('error', (error: any) => {
        clearTimeout(timeout)
        resolve({
          success: false,
          domain,
          port,
          valid: false,
          error: `Connection failed: ${error.message}`,
        })
      })
    } catch (error: any) {
      clearTimeout(timeout)
      resolve({
        success: false,
        domain,
        port,
        valid: false,
        error: `SSL check failed: ${error.message}`,
      })
    }
  })
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
