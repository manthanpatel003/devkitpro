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
  XCircle, 
  AlertTriangle, 
  Copy,
  ExternalLink,
  RefreshCw,
  Info,
  Lock,
  Eye,
  Zap
} from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'
import { SecurityHeaders } from '@/types'

export const metadata: Metadata = {
  title: 'Security Headers Analyzer - Free Website Security Checker',
  description: 'Analyze website security headers and get recommendations. Check HSTS, CSP, X-Frame-Options, and other security headers.',
  keywords: ['security headers', 'website security', 'HSTS', 'CSP', 'X-Frame-Options', 'security analysis'],
  openGraph: {
    title: 'Security Headers Analyzer - Free Website Security Checker',
    description: 'Analyze website security headers and get recommendations. Check HSTS, CSP, X-Frame-Options, and other security headers.',
  },
}

interface SecurityAnalysis {
  url: string
  statusCode: number
  securityScore: number
  score: number
  maxScore: number
  headers: SecurityHeaders
  recommendations: string[]
  lastChecked: string
  success: boolean
  error?: string
}

const headerInfo = {
  'Strict-Transport-Security': {
    name: 'Strict Transport Security (HSTS)',
    description: 'Forces HTTPS connections and prevents protocol downgrade attacks',
    importance: 'Critical',
    icon: Lock
  },
  'X-Frame-Options': {
    name: 'X-Frame-Options',
    description: 'Prevents clickjacking attacks by controlling iframe embedding',
    importance: 'High',
    icon: Eye
  },
  'X-Content-Type-Options': {
    name: 'X-Content-Type-Options',
    description: 'Prevents MIME type sniffing attacks',
    importance: 'High',
    icon: Shield
  },
  'Referrer-Policy': {
    name: 'Referrer Policy',
    description: 'Controls how much referrer information is sent with requests',
    importance: 'Medium',
    icon: Info
  },
  'Permissions-Policy': {
    name: 'Permissions Policy',
    description: 'Controls which browser features can be used',
    importance: 'Medium',
    icon: Zap
  },
  'Content-Security-Policy': {
    name: 'Content Security Policy (CSP)',
    description: 'Prevents XSS attacks by controlling resource loading',
    importance: 'Critical',
    icon: Shield
  },
  'X-XSS-Protection': {
    name: 'X-XSS-Protection',
    description: 'Enables XSS filtering in browsers (deprecated, use CSP instead)',
    importance: 'Low',
    icon: AlertTriangle
  }
}

export default function SecurityHeadersPage() {
  const [url, setUrl] = useState('')
  const [analysis, setAnalysis] = useState<SecurityAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { success, error: showError } = useToast()

  const analyzeHeaders = async () => {
    if (!url.trim()) {
      showError('Please enter a website URL')
      return
    }

    setLoading(true)
    setError(null)
    setAnalysis(null)

    try {
      const response = await fetch('/api/security-headers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze security headers')
      }

      const data = await response.json()
      setAnalysis(data)
      
      if (data.success) {
        success(`Security analysis completed! Score: ${data.securityScore}%`)
      } else {
        showError('Failed to analyze security headers', data.error)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze security headers'
      setError(errorMessage)
      showError('Security Analysis Failed', errorMessage)
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Poor'
  }

  const getHeaderStatus = (headerName: string, value: string | null) => {
    if (!value) return { status: 'missing', icon: XCircle, color: 'text-red-500' }
    return { status: 'present', icon: CheckCircle2, color: 'text-green-500' }
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'Critical':
        return 'text-red-600 bg-red-50'
      case 'High':
        return 'text-orange-600 bg-orange-50'
      case 'Medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'Low':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Security Headers Analyzer
          </h1>
          <p className="text-xl text-gray-600">
            Analyze website security headers and get detailed recommendations
          </p>
        </div>

        {/* Input Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Security Headers Analysis</CardTitle>
            <CardDescription>
              Enter a website URL to analyze its security headers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="https://example.com or example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && analyzeHeaders()}
                className="flex-1"
                icon={<Shield className="w-5 h-5" />}
              />
              <Button
                onClick={analyzeHeaders}
                disabled={loading || !url.trim()}
                className="px-8"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Analyze
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
                <LoadingSpinner size="lg" text="Analyzing security headers..." />
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="mb-8">
            <CardContent className="py-12">
              <div className="text-center">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Failed</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={analyzeHeaders}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {analysis && analysis.success && (
          <div className="space-y-6">
            {/* Security Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Security Score
                </CardTitle>
                <CardDescription>
                  Last analyzed: {new Date(analysis.lastChecked).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl font-bold text-gray-900">
                      {analysis.securityScore}%
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {getScoreLabel(analysis.securityScore)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {analysis.score} out of {analysis.maxScore} headers present
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full border text-sm font-medium ${getScoreColor(analysis.securityScore)}`}>
                    {getScoreLabel(analysis.securityScore).toUpperCase()}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      analysis.securityScore >= 80 ? 'bg-green-500' :
                      analysis.securityScore >= 60 ? 'bg-yellow-500' :
                      analysis.securityScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${analysis.securityScore}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Headers */}
            <Card>
              <CardHeader>
                <CardTitle>Security Headers Analysis</CardTitle>
                <CardDescription>
                  Detailed analysis of each security header
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(headerInfo).map(([key, info]) => {
                    const value = analysis.headers[key as keyof SecurityHeaders]
                    const headerStatus = getHeaderStatus(key, value)
                    const Icon = info.icon
                    
                    return (
                      <div key={key} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <Icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {info.name}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImportanceColor(info.importance)}`}>
                                {info.importance}
                              </span>
                              <headerStatus.icon className={`w-4 h-4 ${headerStatus.color}`} />
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {info.description}
                          </p>
                          {value ? (
                            <div className="mt-2">
                              <div className="text-sm font-medium text-gray-700 mb-1">Current Value:</div>
                              <div className="bg-gray-50 p-2 rounded text-sm font-mono break-all">
                                {value}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-red-600 font-medium">
                              Header not present
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                    Recommendations
                  </CardTitle>
                  <CardDescription>
                    Improve your website security by implementing these recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => handleCopy(analysis.url, 'Website URL')}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy URL
                  </Button>
                  <Button
                    onClick={() => handleCopy(analysis.securityScore.toString(), 'Security Score')}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Score
                  </Button>
                  <Button
                    onClick={() => window.open(analysis.url, '_blank')}
                    variant="outline"
                    size="sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Website
                  </Button>
                  <Button
                    onClick={analyzeHeaders}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Re-analyze
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
                Why Security Headers Matter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Security headers provide an additional layer of protection against common 
                web vulnerabilities like XSS, clickjacking, and man-in-the-middle attacks. 
                They help secure your website and protect your users' data.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="w-5 h-5 mr-2 text-green-600" />
                Implementation Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>• Start with critical headers like HSTS and CSP</div>
                <div>• Test headers in staging before production</div>
                <div>• Use security header generators for complex CSP</div>
                <div>• Monitor for false positives after implementation</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}