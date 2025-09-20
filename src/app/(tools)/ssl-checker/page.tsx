'use client'

import React, { useState } from 'react'
import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/components/ui/Toast'
import { 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Key, 
  Building, 
  Copy,
  ExternalLink,
  RefreshCw,
  Info
} from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'
import { SSLData } from '@/types'

export const metadata: Metadata = {
  title: 'SSL Certificate Checker - Free SSL Analysis Tool',
  description: 'Check SSL certificate validity, expiration date, issuer details, and security information for any website. Free SSL certificate analyzer.',
  keywords: ['SSL checker', 'SSL certificate', 'HTTPS', 'security', 'SSL analysis', 'certificate validation'],
  openGraph: {
    title: 'SSL Certificate Checker - Free SSL Analysis Tool',
    description: 'Check SSL certificate validity, expiration date, issuer details, and security information for any website.',
  },
}

export default function SSLCheckerPage() {
  const [domain, setDomain] = useState('')
  const [sslData, setSslData] = useState<SSLData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { success, error: showError } = useToast()

  const checkSSL = async () => {
    if (!domain.trim()) {
      showError('Please enter a domain name')
      return
    }

    setLoading(true)
    setError(null)
    setSslData(null)

    try {
      const response = await fetch('/api/ssl-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain: domain.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to check SSL certificate')
      }

      const data = await response.json()
      setSslData(data)
      success('SSL certificate checked successfully!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check SSL certificate'
      setError(errorMessage)
      showError('SSL Check Failed', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      success(`${label} copied to clipboard!`)
    } else {
      showError('Failed to copy to clipboard')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'expired':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'good':
        return 'Certificate is valid and secure'
      case 'warning':
        return 'Certificate expires soon'
      case 'expired':
        return 'Certificate has expired'
      default:
        return 'Unknown status'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SSL Certificate Checker
          </h1>
          <p className="text-xl text-gray-600">
            Check SSL certificate validity, expiration date, and security information
          </p>
        </div>

        {/* Input Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Check SSL Certificate</CardTitle>
            <CardDescription>
              Enter a domain name to check its SSL certificate details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="example.com or https://example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && checkSSL()}
                className="flex-1"
                icon={<Shield className="w-5 h-5" />}
              />
              <Button
                onClick={checkSSL}
                disabled={loading || !domain.trim()}
                className="px-8"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Check SSL
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading && (
          <Card className="mb-8">
            <CardContent className="py-12">
              <div className="text-center">
                <LoadingSpinner size="lg" text="Checking SSL certificate..." />
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="mb-8">
            <CardContent className="py-12">
              <div className="text-center">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">SSL Check Failed</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={checkSSL}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {sslData && (
          <div className="space-y-6">
            {/* Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Certificate Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(sslData.status || 'unknown')}
                    <div>
                      <div className="text-lg font-semibold">
                        {sslData.valid ? 'Valid Certificate' : 'Invalid Certificate'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {getStatusText(sslData.status || 'unknown')}
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(sslData.status || 'unknown')}`}>
                    {sslData.status?.toUpperCase() || 'UNKNOWN'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificate Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Key className="w-5 h-5 mr-2 text-green-600" />
                    Certificate Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Issuer</span>
                      <span className="font-medium text-right max-w-xs truncate" title={sslData.issuer}>
                        {sslData.issuer || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Subject</span>
                      <span className="font-medium text-right max-w-xs truncate" title={sslData.subject}>
                        {sslData.subject || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Algorithm</span>
                      <span className="font-medium">{sslData.algorithm || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Key Size</span>
                      <span className="font-medium">{sslData.keySize ? `${sslData.keySize} bits` : 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Serial Number</span>
                      <span className="font-mono text-sm">{sslData.serialNumber || 'Unknown'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-blue-600" />
                    Validity Period
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Valid From</span>
                      <span className="font-medium">{sslData.validFrom || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Valid To</span>
                      <span className="font-medium">{sslData.validTo || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Days Until Expiry</span>
                      <span className={`font-medium ${sslData.daysUntilExpiry && sslData.daysUntilExpiry < 30 ? 'text-yellow-600' : sslData.daysUntilExpiry && sslData.daysUntilExpiry < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {sslData.daysUntilExpiry !== undefined ? sslData.daysUntilExpiry : 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Fingerprint</span>
                      <span className="font-mono text-sm">{sslData.fingerprint || 'Unknown'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => handleCopy(sslData.issuer || '', 'Issuer')}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Issuer
                  </Button>
                  <Button
                    onClick={() => handleCopy(sslData.subject || '', 'Subject')}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Subject
                  </Button>
                  <Button
                    onClick={() => handleCopy(sslData.fingerprint || '', 'Fingerprint')}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Fingerprint
                  </Button>
                  <Button
                    onClick={() => window.open(`https://${domain}`, '_blank')}
                    variant="outline"
                    size="sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Website
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                What is SSL?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                SSL (Secure Sockets Layer) is a security protocol that encrypts data 
                transmitted between a web browser and server. It ensures that sensitive 
                information like passwords and credit card details are protected.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                Certificate Warnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                If a certificate is expired or invalid, browsers will show security warnings. 
                Always ensure your SSL certificates are valid and up-to-date to maintain 
                user trust and security.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}