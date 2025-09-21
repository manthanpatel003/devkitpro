import { NextRequest, NextResponse } from 'next/server'
import * as tls from 'tls'

export async function POST(request: NextRequest) {
  try {
    const { domain } = await request.json()

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
    }

    // Clean domain name
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '')

    const sslData = await checkSSLCertificate(cleanDomain)

    return NextResponse.json(sslData)
  } catch (error) {
    console.error('SSL check error:', error)
    return NextResponse.json({ error: 'Failed to check SSL certificate' }, { status: 500 })
  }
}

function checkSSLCertificate(domain: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      host: domain,
      port: 443,
      rejectUnauthorized: false,
      servername: domain,
    }

    const socket = tls.connect(options, () => {
      try {
        const cert = socket.getPeerCertificate()
        const info = socket.getPeerCertificate(true)

        const now = new Date()
        const validFrom = new Date(cert.valid_from)
        const validTo = new Date(cert.valid_to)
        const daysUntilExpiry = Math.floor(
          (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )

        const sslData = {
          valid: socket.authorized,
          issuer: cert.issuer?.CN || cert.issuer?.O || 'Unknown',
          subject: cert.subject?.CN || cert.subject?.O || 'Unknown',
          validFrom: cert.valid_from,
          validTo: cert.valid_to,
          daysUntilExpiry: daysUntilExpiry,
          algorithm: (cert as any).sigalg || 'Unknown',
          keySize: cert.bits || 0,
          serialNumber: cert.serialNumber || 'Unknown',
          fingerprint: cert.fingerprint || 'Unknown',
          fingerprint256: cert.fingerprint256 || 'Unknown',
          version: (cert as any).version || 'Unknown',
          subjectAltName: cert.subjectaltname || [],
          issuerDetails: {
            country: cert.issuer?.C || 'Unknown',
            organization: cert.issuer?.O || 'Unknown',
            organizationalUnit: cert.issuer?.OU || 'Unknown',
            commonName: cert.issuer?.CN || 'Unknown',
          },
          subjectDetails: {
            country: cert.subject?.C || 'Unknown',
            organization: cert.subject?.O || 'Unknown',
            organizationalUnit: cert.subject?.OU || 'Unknown',
            commonName: cert.subject?.CN || 'Unknown',
          },
          status: daysUntilExpiry > 30 ? 'good' : daysUntilExpiry > 0 ? 'warning' : 'expired',
          error: socket.authorized ? null : 'Certificate verification failed',
        }

        resolve(sslData)
      } catch (error) {
        reject(error)
      } finally {
        socket.end()
      }
    })

    socket.on('error', error => {
      reject(error)
    })

    socket.setTimeout(10000, () => {
      socket.destroy()
      reject(new Error('Connection timeout'))
    })
  })
}
