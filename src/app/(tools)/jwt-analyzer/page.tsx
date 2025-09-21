'use client'

import { useState } from 'react'
// Metadata removed - client components cannot export metadata
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { copyToClipboard } from '@/lib/utils'
import { CheckCircle2, Copy, Info, Key, XCircle } from 'lucide-react'

// Metadata removed - client components cannot export metadata

interface JWTResult {
  valid: boolean
  error?: string
  header?: any
  payload?: any
  signature?: string
  algorithm?: string
  issuedAt?: number
  expiresAt?: number
  issuer?: string
  subject?: string
  audience?: string
  isExpired?: boolean
  timeToExpiry?: number
}

export default function JWTAnalyzerPage() {
  const [token, setToken] = useState('')
  const [result, setResult] = useState<JWTResult | null>(null)
  const { success, error: showError } = useToast()

  const decodeJWT = (jwt: string): JWTResult => {
    try {
      const parts = jwt.split('.')
      if (parts.length !== 3) {
        return { valid: false, error: 'Invalid JWT format. Expected 3 parts separated by dots.' }
      }

      const [headerPart, payloadPart, signaturePart] = parts

      // Decode header
      const header = JSON.parse(atob(headerPart.replace(/-/g, '+').replace(/_/g, '/')))

      // Decode payload
      const payload = JSON.parse(atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/')))

      // Extract common claims
      const now = Math.floor(Date.now() / 1000)
      const issuedAt = payload.iat
      const expiresAt = payload.exp
      const isExpired = expiresAt ? now > expiresAt : false
      const timeToExpiry = expiresAt ? Math.max(0, expiresAt - now) : null

      return {
        valid: true,
        header,
        payload,
        signature: signaturePart,
        algorithm: header.alg,
        issuedAt,
        expiresAt,
        issuer: payload.iss,
        subject: payload.sub,
        audience: payload.aud,
        isExpired,
        timeToExpiry: timeToExpiry ?? undefined,
      }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Failed to decode JWT',
      }
    }
  }

  const handleAnalyze = () => {
    if (!token.trim()) {
      showError('Please enter a JWT token')
      return
    }

    const result = decodeJWT(token.trim())
    setResult(result)

    if (result.valid) {
      success('JWT token analyzed successfully!')
    } else {
      showError('Invalid JWT Token', result.error)
    }
  }

  const handleCopy = async (text: string, label: string) => {
    const copySuccess = await copyToClipboard(text)
    if (copySuccess) {
      success(`${label} copied to clipboard!`)
    } else {
      showError('Failed to copy to clipboard')
    }
  }

  const loadExample = () => {
    const exampleToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    setToken(exampleToken)
    const result = decodeJWT(exampleToken)
    setResult(result)
    success('Example JWT loaded!')
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m ${seconds % 60}s`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">JWT Token Analyzer</h1>
          <p className="text-xl text-gray-600">
            Decode and analyze JWT tokens with detailed inspection
          </p>
        </div>

        {/* Input */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="w-5 h-5 mr-2 text-blue-600" />
              JWT Token
            </CardTitle>
            <CardDescription>Paste your JWT token to decode and analyze</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Paste your JWT token here..."
                value={token}
                onChange={e => setToken(e.target.value)}
                className="min-h-[120px] font-mono text-sm"
                rows={5}
              />
              <div className="flex gap-3">
                <Button onClick={handleAnalyze} disabled={!token.trim()}>
                  Analyze Token
                </Button>
                <Button onClick={loadExample} variant="outline">
                  Load Example
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {result.valid ? (
                    <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 mr-2 text-red-600" />
                  )}
                  Analysis Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.valid ? (
                  <div className="space-y-4">
                    {/* Token Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {result.algorithm || 'Unknown'}
                        </div>
                        <div className="text-sm text-blue-600">Algorithm</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {result.isExpired ? 'Expired' : 'Valid'}
                        </div>
                        <div className="text-sm text-green-600">Status</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {result.timeToExpiry ? formatDuration(result.timeToExpiry) : 'N/A'}
                        </div>
                        <div className="text-sm text-purple-600">Time to Expiry</div>
                      </div>
                    </div>

                    {/* Claims */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">Standard Claims</h4>
                        <div className="space-y-1 text-sm">
                          {result.issuer && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Issuer:</span>
                              <span className="font-mono">{result.issuer}</span>
                            </div>
                          )}
                          {result.subject && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Subject:</span>
                              <span className="font-mono">{result.subject}</span>
                            </div>
                          )}
                          {result.audience && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Audience:</span>
                              <span className="font-mono">{result.audience}</span>
                            </div>
                          )}
                          {result.issuedAt && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Issued At:</span>
                              <span className="font-mono">{formatTime(result.issuedAt)}</span>
                            </div>
                          )}
                          {result.expiresAt && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Expires At:</span>
                              <span className="font-mono">{formatTime(result.expiresAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Invalid JWT Token</h3>
                    <p className="text-gray-600">{result.error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Header and Payload */}
            {result.valid && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Header</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
                      {JSON.stringify(result.header, null, 2)}
                    </pre>
                    <Button
                      onClick={() => handleCopy(JSON.stringify(result.header, null, 2), 'Header')}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Header
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payload</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
                      {JSON.stringify(result.payload, null, 2)}
                    </pre>
                    <Button
                      onClick={() => handleCopy(JSON.stringify(result.payload, null, 2), 'Payload')}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Payload
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="w-5 h-5 mr-2 text-blue-600" />
              About JWT Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              JWT (JSON Web Token) is a compact, URL-safe means of representing claims to be
              transferred between two parties. It consists of three parts: Header, Payload, and
              Signature, separated by dots.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
