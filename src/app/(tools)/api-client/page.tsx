'use client'

import { useState } from 'react'
// Metadata removed - client components cannot export metadata
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { copyToClipboard, downloadFile, formatDuration } from '@/lib/utils'
import { APIResponse } from '@/types'
import {
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Globe,
  Plus,
  Send,
  Settings,
  Trash2,
  XCircle,
} from 'lucide-react'

// Metadata moved to layout.tsx - client components cannot export metadata

const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
const commonHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: 'Bearer your-token-here',
  'User-Agent': 'API-Client/1.0',
}

export default function APIClientPage() {
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('')
  const [headers, setHeaders] = useState<Record<string, string>>({})
  const [body, setBody] = useState('')
  const [response, setResponse] = useState<APIResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [newHeaderKey, setNewHeaderKey] = useState('')
  const [newHeaderValue, setNewHeaderValue] = useState('')
  const { success, error: showError } = useToast()

  const sendRequest = async () => {
    if (!url.trim()) {
      showError('Please enter a URL')
      return
    }

    setLoading(true)
    setResponse(null)

    try {
      const startTime = Date.now()

      const requestOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      }

      if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
        try {
          requestOptions.body = JSON.stringify(JSON.parse(body))
        } catch {
          requestOptions.body = body
        }
      }

      const res = await fetch(url, requestOptions)
      const endTime = Date.now()
      const duration = endTime - startTime

      const responseHeaders: Record<string, string> = {}
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      let responseData: any
      const contentType = res.headers.get('content-type')

      if (contentType?.includes('application/json')) {
        responseData = await res.json()
      } else {
        responseData = await res.text()
      }

      const apiResponse: APIResponse = {
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        data: responseData,
        duration,
        size: JSON.stringify(responseData).length,
      }

      setResponse(apiResponse)
      success(`Request completed in ${formatDuration(duration)}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Request failed'
      showError('Request Failed', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const addHeader = () => {
    if (newHeaderKey.trim() && newHeaderValue.trim()) {
      setHeaders(prev => ({
        ...prev,
        [newHeaderKey.trim()]: newHeaderValue.trim(),
      }))
      setNewHeaderKey('')
      setNewHeaderValue('')
    }
  }

  const removeHeader = (key: string) => {
    setHeaders(prev => {
      const newHeaders = { ...prev }
      delete newHeaders[key]
      return newHeaders
    })
  }

  const addCommonHeader = (key: string, value: string) => {
    setHeaders(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleCopy = async (text: string, label: string) => {
    const copySuccess = await copyToClipboard(text)
    if (copySuccess) {
      success(`${label} copied to clipboard!`)
    } else {
      showError('Failed to copy to clipboard')
    }
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600'
    if (status >= 300 && status < 400) return 'text-blue-600'
    if (status >= 400 && status < 500) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) return <CheckCircle2 className="w-4 h-4 text-green-500" />
    return <XCircle className="w-4 h-4 text-red-500" />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">REST API Client</h1>
          <p className="text-xl text-gray-600">
            Test REST API endpoints with our free HTTP client tool
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="w-5 h-5 mr-2 text-blue-600" />
                  Request Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Method and URL */}
                  <div className="flex gap-2">
                    <select
                      value={method}
                      onChange={e => setMethod(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {httpMethods.map(m => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <Input
                      placeholder="https://api.example.com/endpoint"
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      className="flex-1"
                      icon={<Globe className="w-5 h-5" />}
                    />
                  </div>

                  {/* Headers */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Headers</label>
                    <div className="space-y-2">
                      {Object.entries(headers).map(([key, value]) => (
                        <div key={key} className="flex gap-2">
                          <Input value={key} readOnly className="flex-1" />
                          <Input value={value} readOnly className="flex-1" />
                          <Button onClick={() => removeHeader(key)} variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Header name"
                          value={newHeaderKey}
                          onChange={e => setNewHeaderKey(e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Header value"
                          value={newHeaderValue}
                          onChange={e => setNewHeaderValue(e.target.value)}
                          className="flex-1"
                        />
                        <Button onClick={addHeader} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Common Headers */}
                    <div className="mt-2">
                      <div className="text-xs text-gray-600 mb-1">Quick add:</div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(commonHeaders).map(([key, value]) => (
                          <Button
                            key={key}
                            onClick={() => addCommonHeader(key, value)}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            {key}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  {['POST', 'PUT', 'PATCH'].includes(method) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Request Body
                      </label>
                      <Textarea
                        placeholder="Enter JSON or text body..."
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        className="min-h-[200px] font-mono text-sm"
                        rows={8}
                      />
                    </div>
                  )}

                  <Button
                    onClick={sendRequest}
                    disabled={loading || !url.trim()}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Request
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Response */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                  Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                {response ? (
                  <div className="space-y-4">
                    {/* Status */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(response.status)}
                        <span className="font-medium">
                          {response.status} {response.statusText}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDuration(response.duration)} • {response.size} bytes
                      </div>
                    </div>

                    {/* Headers */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Response Headers</h4>
                      <div className="max-h-32 overflow-y-auto bg-gray-50 p-3 rounded text-sm">
                        {Object.entries(response.headers).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-1">
                            <span className="font-mono text-gray-600">{key}:</span>
                            <span className="font-mono text-gray-900">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Body */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Response Body</h4>
                      <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto max-h-64">
                        {typeof response.data === 'string'
                          ? response.data
                          : JSON.stringify(response.data, null, 2)}
                      </pre>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          handleCopy(
                            typeof response.data === 'string'
                              ? response.data
                              : JSON.stringify(response.data, null, 2),
                            'Response Body'
                          )
                        }
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Response
                      </Button>
                      <Button
                        onClick={() =>
                          downloadFile(
                            typeof response.data === 'string'
                              ? response.data
                              : JSON.stringify(response.data, null, 2),
                            `response-${Date.now()}.json`,
                            'application/json'
                          )
                        }
                        variant="outline"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Send className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Send a request to see the response</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2 text-blue-600" />
              API Testing Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Common Headers</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Content-Type: application/json</li>
                  <li>• Authorization: Bearer token</li>
                  <li>• Accept: application/json</li>
                  <li>• User-Agent: Your app name</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Status Codes</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• 200-299: Success</li>
                  <li>• 300-399: Redirection</li>
                  <li>• 400-499: Client Error</li>
                  <li>• 500-599: Server Error</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
