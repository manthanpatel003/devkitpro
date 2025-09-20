'use client'

import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/ui/Loading'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Copy,
  ExternalLink,
  Globe,
  Info,
  Key,
  Lock,
  Shield,
  ShieldCheck,
  ShieldX,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'

interface SSLCertificate {
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

interface SecurityInfo {
  protocol: string
  cipher: string
  keyExchange?: string
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
  warnings: string[]
  recommendations: string[]
}

interface SSLCheckResult {
  success: boolean
  domain: string
  port: number
  valid: boolean
  certificate?: SSLCertificate
  securityInfo?: SecurityInfo
  error?: string
}

const SSLCheckerPage = () => {
  const [domain, setDomain] = useState('')
  const [port, setPort] = useState('443')
  const [result, setResult] = useState<SSLCheckResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { copyToClipboard, copied } = useCopyToClipboard()

  const checkSSL = async () => {
    if (!domain.trim()) {
      setError('Please enter a domain name')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/ssl-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: domain.trim(),
          port: parseInt(port) || 443,
        }),
      })

      const data: SSLCheckResult = await response.json()
      setResult(data)

      if (!data.success && data.error) {
        setError(data.error)
      }
    } catch (err: any) {
      setError(`Failed to check SSL certificate: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
        return 'text-green-600 bg-green-100 border-green-200'
      case 'A':
        return 'text-green-600 bg-green-100 border-green-200'
      case 'B':
        return 'text-blue-600 bg-blue-100 border-blue-200'
      case 'C':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'D':
        return 'text-orange-600 bg-orange-100 border-orange-200'
      case 'F':
        return 'text-red-600 bg-red-100 border-red-200'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getExpiryStatus = (days: number) => {
    if (days < 0) return { color: 'text-red-600', icon: XCircle, text: 'Expired' }
    if (days < 7) return { color: 'text-red-600', icon: AlertTriangle, text: 'Expires Soon' }
    if (days < 30) return { color: 'text-yellow-600', icon: Clock, text: 'Expires Soon' }
    return { color: 'text-green-600', icon: CheckCircle, text: 'Valid' }
  }

  const copyReport = () => {
    if (!result || !result.certificate) return

    const report = `
SSL Certificate Report for ${result.domain}:${result.port}

Certificate Status: ${result.valid ? 'Valid' : 'Invalid'}
${result.securityInfo ? `Security Grade: ${result.securityInfo.grade}` : ''}

Certificate Details:
- Subject: ${result.certificate.subject.CN || 'N/A'}
- Issuer: ${result.certificate.issuer.CN || result.certificate.issuer.O || 'N/A'}
- Valid From: ${new Date(result.certificate.validFrom).toLocaleDateString()}
- Valid To: ${new Date(result.certificate.validTo).toLocaleDateString()}
- Days Until Expiry: ${result.certificate.daysUntilExpiry}
- Algorithm: ${result.certificate.signatureAlgorithm}
- Key Size: ${result.certificate.keySize || 'N/A'} bits

${
  result.certificate.alternativeNames
    ? `Alternative Names:
${result.certificate.alternativeNames.map(name => `- ${name}`).join('\n')}`
    : ''
}

${
  result.securityInfo?.protocol
    ? `Security Information:
- Protocol: ${result.securityInfo.protocol}
- Cipher: ${result.securityInfo.cipher}
${result.securityInfo.keyExchange ? `- Key Exchange: ${result.securityInfo.keyExchange}` : ''}`
    : ''
}

${
  result.securityInfo?.warnings.length
    ? `Warnings:
${result.securityInfo.warnings.map(warning => `- ${warning}`).join('\n')}`
    : ''
}

${
  result.securityInfo?.recommendations.length
    ? `Recommendations:
${result.securityInfo.recommendations.map(rec => `- ${rec}`).join('\n')}`
    : ''
}
    `.trim()

    copyToClipboard(report)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      checkSSL()
    }
  }

  return (
    <ToolLayout
      title="SSL Certificate Checker"
      description="Analyze SSL certificates, check expiration dates, and validate security configurations"
    >
      <div className="space-y-6">
        {/* Input Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Check SSL Certificate</h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter domain (e.g., google.com)"
                value={domain}
                onChange={e => setDomain(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full"
              />
            </div>
            <div className="w-24">
              <Input
                type="number"
                placeholder="443"
                value={port}
                onChange={e => setPort(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full"
                min="1"
                max="65535"
              />
            </div>
            <Button onClick={checkSSL} disabled={loading || !domain.trim()} className="px-8">
              {loading ? <Loading size="sm" /> : <Shield className="w-4 h-4 mr-2" />}
              {loading ? 'Checking...' : 'Check SSL'}
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-red-700">{error}</div>
            </div>
          )}
        </Card>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Status Overview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Certificate Status</h3>
                {result.certificate && (
                  <Button onClick={copyReport} variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    {copied ? 'Copied!' : 'Copy Report'}
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {/* Validity */}
                <div
                  className={`p-4 rounded-lg border-2 ${
                    result.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {result.valid ? (
                      <ShieldCheck className="w-8 h-8 text-green-600" />
                    ) : (
                      <ShieldX className="w-8 h-8 text-red-600" />
                    )}
                    <div>
                      <div
                        className={`font-semibold ${result.valid ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {result.valid ? 'Valid' : 'Invalid'}
                      </div>
                      <div className="text-sm text-gray-600">Certificate Status</div>
                    </div>
                  </div>
                </div>

                {/* Security Grade */}
                {result.securityInfo && (
                  <div
                    className={`p-4 rounded-lg border-2 ${getGradeColor(result.securityInfo.grade)}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-lg">
                        {result.securityInfo.grade}
                      </div>
                      <div>
                        <div className="font-semibold">Grade {result.securityInfo.grade}</div>
                        <div className="text-sm opacity-75">Security Rating</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expiry Status */}
                {result.certificate && (
                  <div className="p-4 rounded-lg border-2 bg-gray-50 border-gray-200">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const status = getExpiryStatus(result.certificate.daysUntilExpiry)
                        const StatusIcon = status.icon
                        return (
                          <>
                            <StatusIcon className={`w-8 h-8 ${status.color}`} />
                            <div>
                              <div className={`font-semibold ${status.color}`}>
                                {result.certificate.daysUntilExpiry < 0
                                  ? `Expired ${Math.abs(result.certificate.daysUntilExpiry)} days ago`
                                  : `${result.certificate.daysUntilExpiry} days left`}
                              </div>
                              <div className="text-sm text-gray-600">{status.text}</div>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {result.certificate && (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Certificate Details */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Certificate Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Subject (Common Name)
                      </label>
                      <div className="mt-1 font-mono text-sm bg-gray-50 p-2 rounded">
                        {result.certificate.subject.CN || 'N/A'}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Issuer</label>
                      <div className="mt-1 font-mono text-sm bg-gray-50 p-2 rounded">
                        {result.certificate.issuer.CN || result.certificate.issuer.O || 'N/A'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Valid From</label>
                        <div className="mt-1 text-sm">
                          {new Date(result.certificate.validFrom).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Valid To</label>
                        <div className="mt-1 text-sm">
                          {new Date(result.certificate.validTo).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Algorithm</label>
                        <div className="mt-1 text-sm font-mono">
                          {result.certificate.signatureAlgorithm}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Key Size</label>
                        <div className="mt-1 text-sm">
                          {result.certificate.keySize
                            ? `${result.certificate.keySize} bits`
                            : 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Serial Number</label>
                      <div className="mt-1 font-mono text-xs bg-gray-50 p-2 rounded break-all">
                        {result.certificate.serialNumber}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Fingerprint (SHA-1)
                      </label>
                      <div className="mt-1 font-mono text-xs bg-gray-50 p-2 rounded break-all">
                        {result.certificate.fingerprint}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Security Information */}
                <div className="space-y-6">
                  {result.securityInfo && (
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Security Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Protocol:</span>
                          <span className="font-medium">{result.securityInfo.protocol}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cipher Suite:</span>
                          <span className="font-medium text-sm">{result.securityInfo.cipher}</span>
                        </div>
                        {result.securityInfo.keyExchange && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Key Exchange:</span>
                            <span className="font-medium">{result.securityInfo.keyExchange}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Security Grade:</span>
                          <span
                            className={`font-bold px-2 py-1 rounded text-sm ${getGradeColor(result.securityInfo.grade)}`}
                          >
                            {result.securityInfo.grade}
                          </span>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Alternative Names */}
                  {result.certificate.alternativeNames &&
                    result.certificate.alternativeNames.length > 0 && (
                      <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Globe className="w-5 h-5" />
                          Subject Alternative Names
                        </h3>
                        <div className="space-y-2">
                          {result.certificate.alternativeNames.map((name, index) => (
                            <div key={index} className="font-mono text-sm bg-gray-50 p-2 rounded">
                              {name}
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                </div>
              </div>
            )}

            {/* Warnings and Recommendations */}
            {result.securityInfo &&
              (result.securityInfo.warnings.length > 0 ||
                result.securityInfo.recommendations.length > 0) && (
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Warnings */}
                  {result.securityInfo.warnings.length > 0 && (
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-yellow-600">
                        <AlertTriangle className="w-5 h-5" />
                        Security Warnings
                      </h3>
                      <ul className="space-y-2">
                        {result.securityInfo.warnings.map((warning, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  {/* Recommendations */}
                  {result.securityInfo.recommendations.length > 0 && (
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-600">
                        <Info className="w-5 h-5" />
                        Recommendations
                      </h3>
                      <ul className="space-y-2">
                        {result.securityInfo.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}
                </div>
              )}

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(
                      `https://www.ssllabs.com/ssltest/analyze.html?d=${result.domain}`,
                      '_blank'
                    )
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  SSL Labs Test
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(`https://crt.sh/?q=${result.domain}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Certificate Transparency
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(`https://www.whois.net/whois/${result.domain}`, '_blank')
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  WHOIS Lookup
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  )
}

export default SSLCheckerPage
