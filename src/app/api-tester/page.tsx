'use client'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { TOOLS } from '@/lib/constants'
import { downloadFile, isValidUrl } from '@/lib/utils'
import {
  AlertCircle,
  CheckCircle,
  Copy,
  Download,
  FileText,
  Key,
  Plus,
  Send,
  Settings,
  Trash2,
  XCircle,
  Zap,
} from 'lucide-react'
import * as React from 'react'

interface Header {
  key: string
  value: string
  enabled: boolean
}

interface APIRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
  url: string
  headers: Header[]
  body: string
  timeout: number
}

interface APIResponse {
  status: number
  statusText: string
  headers: { [key: string]: string }
  data: string
  responseTime: number
  size: number
  timestamp: string
}

export default function APITesterPage() {
  const [request, setRequest] = React.useState<APIRequest>({
    method: 'GET',
    url: '',
    headers: [
      { key: 'Content-Type', value: 'application/json', enabled: true },
      { key: 'User-Agent', value: 'DevTools Hub API Tester', enabled: true },
    ],
    body: '',
    timeout: 10000,
  })

  const [response, setResponse] = React.useState<APIResponse | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [activeTab, setActiveTab] = React.useState<'headers' | 'body' | 'auth'>('headers')

  const { addToast } = useToast()
  const tool = TOOLS.find(t => t.id === 'api-tester')!

  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'] as const

  const sendRequest = async () => {
    if (!request.url.trim()) {
      setError('Please enter a URL')
      return
    }

    if (!isValidUrl(request.url)) {
      setError('Please enter a valid URL')
      return
    }

    setIsLoading(true)
    setError('')
    setResponse(null)

    const startTime = Date.now()

    try {
      // Prepare headers
      const headers: { [key: string]: string } = {}
      request.headers
        .filter(h => h.enabled && h.key && h.value)
        .forEach(h => {
          headers[h.key] = h.value
        })

      // Prepare request options
      const options: RequestInit = {
        method: request.method,
        headers,
        signal: AbortSignal.timeout(request.timeout),
      }

      // Add body for methods that support it
      if (['POST', 'PUT', 'PATCH'].includes(request.method) && request.body) {
        options.body = request.body
      }

      // Make the request
      const response = await fetch(request.url, options)
      const endTime = Date.now()
      const responseTime = endTime - startTime

      // Get response data
      const responseText = await response.text()
      const responseHeaders: { [key: string]: string } = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      const apiResponse: APIResponse = {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: responseText,
        responseTime,
        size: new Blob([responseText]).size,
        timestamp: new Date().toISOString(),
      }

      setResponse(apiResponse)

      addToast({
        type: response.ok ? 'success' : 'warning',
        title: `${response.status} ${response.statusText}`,
        description: `Request completed in ${responseTime}ms`,
      })
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Request timed out')
        } else if (err.message.includes('CORS')) {
          setError(
            "CORS error - this API doesn't allow browser requests. Try using a CORS proxy or server-side request."
          )
        } else {
          setError('Request failed: ' + err.message)
        }
      } else {
        setError('Request failed with unknown error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const addHeader = () => {
    setRequest(prev => ({
      ...prev,
      headers: [...prev.headers, { key: '', value: '', enabled: true }],
    }))
  }

  const removeHeader = (index: number) => {
    setRequest(prev => ({
      ...prev,
      headers: prev.headers.filter((_, i) => i !== index),
    }))
  }

  const updateHeader = (index: number, field: keyof Header, value: string | boolean) => {
    setRequest(prev => ({
      ...prev,
      headers: prev.headers.map((header, i) =>
        i === index ? { ...header, [field]: value } : header
      ),
    }))
  }

  const formatJSON = (str: string): string => {
    try {
      return JSON.stringify(JSON.parse(str), null, 2)
    } catch {
      return str
    }
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600'
    if (status >= 300 && status < 400) return 'text-blue-600'
    if (status >= 400 && status < 500) return 'text-orange-600'
    return 'text-red-600'
  }

  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (status >= 300 && status < 400) return <AlertCircle className="h-4 w-4 text-blue-600" />
    return <XCircle className="h-4 w-4 text-red-600" />
  }

  const handleDownload = () => {
    if (!response) return

    const report = {
      request: {
        method: request.method,
        url: request.url,
        headers: request.headers.filter(h => h.enabled),
        body: request.body,
      },
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        responseTime: response.responseTime,
        size: response.size,
        timestamp: response.timestamp,
      },
    }

    downloadFile(JSON.stringify(report, null, 2), 'api-test-results.json', 'application/json')
  }

  const loadExample = (method: string, url: string, body?: string) => {
    setRequest(prev => ({
      ...prev,
      method: method as any,
      url,
      body: body || '',
    }))
  }

  const examples = [
    {
      title: 'JSONPlaceholder GET',
      description: 'Test a simple GET request',
      input: 'GET https://jsonplaceholder.typicode.com/posts/1',
      action: () => loadExample('GET', 'https://jsonplaceholder.typicode.com/posts/1'),
    },
    {
      title: 'POST Request',
      description: 'Test creating a new resource',
      input: 'POST with JSON body',
      action: () =>
        loadExample(
          'POST',
          'https://jsonplaceholder.typicode.com/posts',
          JSON.stringify({ title: 'Test Post', body: 'This is a test', userId: 1 }, null, 2)
        ),
    },
    {
      title: 'Public API',
      description: 'Test a public API endpoint',
      input: 'GET https://api.github.com/users/octocat',
      action: () => loadExample('GET', 'https://api.github.com/users/octocat'),
    },
  ]

  const tips = [
    'Many APIs require authentication - add API keys to headers',
    "Use CORS proxy services for APIs that don't support browser requests",
    'Check API documentation for required headers and request format',
    'Test different HTTP methods to understand API behavior',
    'Save frequently used requests for quick testing',
    'Monitor response times to identify performance issues',
  ]

  return (
    <>
      <Header />
      <main className="flex-1">
        <ToolLayout
          tool={tool}
          result={response ? JSON.stringify(response, null, 2) : null}
          onReset={() => {
            setRequest(prev => ({ ...prev, url: '', body: '' }))
            setResponse(null)
            setError('')
          }}
          onDownload={handleDownload}
          examples={examples}
          tips={tips}
        >
          <div className="space-y-6">
            {/* Request Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="h-5 w-5 mr-2" />
                  Request Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Method and URL */}
                <div className="flex space-x-2">
                  <select
                    value={request.method}
                    onChange={e => setRequest(prev => ({ ...prev, method: e.target.value as any }))}
                    className="px-3 py-2 border rounded-md bg-background text-sm font-medium min-w-[100px]"
                  >
                    {httpMethods.map(method => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                  <Input
                    placeholder="https://api.example.com/endpoint"
                    value={request.url}
                    onChange={e => setRequest(prev => ({ ...prev, url: e.target.value }))}
                    className="flex-1"
                  />
                  <Button onClick={sendRequest} disabled={isLoading || !request.url.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-2 border-b">
                  {[
                    { id: 'headers', label: 'Headers', icon: Settings },
                    { id: 'body', label: 'Body', icon: FileText },
                    { id: 'auth', label: 'Auth', icon: Key },
                  ].map(tab => (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab(tab.id as any)}
                    >
                      {tab.label}
                    </Button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'headers' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Request Headers</label>
                      <Button size="sm" onClick={addHeader}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Header
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {request.headers.map((header, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={header.enabled}
                            onChange={e => updateHeader(index, 'enabled', e.target.checked)}
                            className="rounded"
                          />
                          <Input
                            placeholder="Header name"
                            value={header.key}
                            onChange={e => updateHeader(index, 'key', e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            placeholder="Header value"
                            value={header.value}
                            onChange={e => updateHeader(index, 'value', e.target.value)}
                            className="flex-1"
                          />
                          <Button variant="outline" size="sm" onClick={() => removeHeader(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'body' && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Request Body</label>
                    <Textarea
                      placeholder="Enter request body (JSON, XML, form data, etc.)"
                      value={request.body}
                      onChange={e => setRequest(prev => ({ ...prev, body: e.target.value }))}
                      className="min-h-[150px] font-mono text-sm"
                    />
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          try {
                            const formatted = formatJSON(request.body)
                            setRequest(prev => ({ ...prev, body: formatted }))
                          } catch {
                            addToast({
                              type: 'error',
                              title: 'Invalid JSON',
                              description: 'Could not format as JSON',
                            })
                          }
                        }}
                      >
                        Format JSON
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRequest(prev => ({ ...prev, body: '' }))}
                      >
                        Clear Body
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'auth' && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Authentication</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            const authHeader = request.headers.find(h => h.key === 'Authorization')
                            if (authHeader) {
                              updateHeader(
                                request.headers.indexOf(authHeader),
                                'value',
                                'Bearer YOUR_TOKEN_HERE'
                              )
                            } else {
                              setRequest(prev => ({
                                ...prev,
                                headers: [
                                  ...prev.headers,
                                  {
                                    key: 'Authorization',
                                    value: 'Bearer YOUR_TOKEN_HERE',
                                    enabled: true,
                                  },
                                ],
                              }))
                            }
                          }}
                        >
                          Add Bearer Token
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const authHeader = request.headers.find(h => h.key === 'Authorization')
                            if (authHeader) {
                              updateHeader(
                                request.headers.indexOf(authHeader),
                                'value',
                                'Basic ' + btoa('username:password')
                              )
                            } else {
                              setRequest(prev => ({
                                ...prev,
                                headers: [
                                  ...prev.headers,
                                  {
                                    key: 'Authorization',
                                    value: 'Basic ' + btoa('username:password'),
                                    enabled: true,
                                  },
                                ],
                              }))
                            }
                          }}
                        >
                          Add Basic Auth
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Timeout (ms)</label>
                      <Input
                        type="number"
                        min="1000"
                        max="60000"
                        value={request.timeout}
                        onChange={e =>
                          setRequest(prev => ({ ...prev, timeout: Number(e.target.value) }))
                        }
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Response */}
            {response && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      {getStatusIcon(response.status)}
                      <span className="ml-2">Response</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(response.data)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Response Status */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getStatusColor(response.status)}`}>
                        {response.status}
                      </div>
                      <div className="text-xs text-muted-foreground">Status Code</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {response.responseTime}ms
                      </div>
                      <div className="text-xs text-muted-foreground">Response Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {(response.size / 1024).toFixed(1)}KB
                      </div>
                      <div className="text-xs text-muted-foreground">Response Size</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        {Object.keys(response.headers).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Headers</div>
                    </div>
                  </div>

                  {/* Response Headers */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Response Headers</label>
                    <div className="bg-muted rounded p-3 max-h-40 overflow-y-auto">
                      <div className="space-y-1 text-sm font-mono">
                        {Object.entries(response.headers).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-blue-600">{key}:</span>{' '}
                            <span className="text-muted-foreground">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Response Body */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Response Body</label>
                    <Textarea
                      value={formatJSON(response.data)}
                      readOnly
                      className="min-h-[300px] font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {error && (
              <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
                <CardContent className="py-4">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Quick Test APIs
                </CardTitle>
                <CardDescription>Click to test these public APIs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto p-3 text-left"
                    onClick={() => loadExample('GET', 'https://httpbin.org/get')}
                  >
                    <div className="space-y-1">
                      <div className="font-medium text-sm">HTTPBin GET</div>
                      <div className="text-xs text-muted-foreground">
                        Test GET request with response details
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-3 text-left"
                    onClick={() => loadExample('GET', 'https://jsonplaceholder.typicode.com/users')}
                  >
                    <div className="space-y-1">
                      <div className="font-medium text-sm">JSONPlaceholder Users</div>
                      <div className="text-xs text-muted-foreground">Get list of sample users</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-3 text-left"
                    onClick={() =>
                      loadExample('GET', 'https://api.github.com/repos/microsoft/vscode')
                    }
                  >
                    <div className="space-y-1">
                      <div className="font-medium text-sm">GitHub Repository</div>
                      <div className="text-xs text-muted-foreground">
                        Get VS Code repository info
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-3 text-left"
                    onClick={() =>
                      loadExample('GET', 'https://api.coindesk.com/v1/bpi/currentprice.json')
                    }
                  >
                    <div className="space-y-1">
                      <div className="font-medium text-sm">Bitcoin Price</div>
                      <div className="text-xs text-muted-foreground">Get current Bitcoin price</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </ToolLayout>
      </main>
      <Footer />
    </>
  )
}
