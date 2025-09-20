'use client'

import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle,
  Code,
  Copy,
  Download,
  Eye,
  FolderOpen,
  Key,
  Minus,
  Play,
  Plus,
  Save,
  Settings,
  Zap,
} from 'lucide-react'
import { useRef, useState } from 'react'

interface APIRequest {
  id: string
  name: string
  method: string
  url: string
  headers: Record<string, string>
  body: string
  bodyType: 'json' | 'form' | 'raw' | 'none'
  params: Record<string, string>
  auth: {
    type: 'none' | 'bearer' | 'basic' | 'api-key'
    token?: string
    username?: string
    password?: string
    apiKey?: string
    apiKeyHeader?: string
  }
}

interface APIResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  data: string
  timing: {
    duration: number
    start: number
    end: number
  }
  size: number
  redirected: boolean
  url: string
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

const SAMPLE_REQUESTS: APIRequest[] = [
  {
    id: '1',
    name: 'Get User Profile',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/users/1',
    headers: {},
    body: '',
    bodyType: 'none',
    params: {},
    auth: { type: 'none' },
  },
  {
    id: '2',
    name: 'Create Post',
    method: 'POST',
    url: 'https://jsonplaceholder.typicode.com/posts',
    headers: { 'Content-Type': 'application/json' },
    body: '{\n  "title": "My New Post",\n  "body": "This is the content of my post",\n  "userId": 1\n}',
    bodyType: 'json',
    params: {},
    auth: { type: 'none' },
  },
  {
    id: '3',
    name: 'Weather API',
    method: 'GET',
    url: 'https://api.openweathermap.org/data/2.5/weather',
    headers: {},
    body: '',
    bodyType: 'none',
    params: { q: 'London', appid: 'your-api-key' },
    auth: { type: 'none' },
  },
]

const APIClientPage = () => {
  const [currentRequest, setCurrentRequest] = useState<APIRequest>({
    id: 'new',
    name: 'New Request',
    method: 'GET',
    url: '',
    headers: {},
    body: '',
    bodyType: 'json',
    params: {},
    auth: { type: 'none' },
  })
  const [response, setResponse] = useState<APIResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'auth'>('params')
  const [responseTab, setResponseTab] = useState<'response' | 'headers' | 'raw'>('response')
  const [savedRequests, setSavedRequests] = useState<APIRequest[]>(SAMPLE_REQUESTS)
  const [showSaved, setShowSaved] = useState(false)

  const { copyToClipboard, copied } = useCopyToClipboard()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sendRequest = async () => {
    if (!currentRequest.url.trim()) {
      setError('Please enter a URL')
      return
    }

    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const startTime = performance.now()

      // Build URL with params
      const url = new URL(currentRequest.url)
      Object.entries(currentRequest.params).forEach(([key, value]) => {
        if (key && value) {
          url.searchParams.set(key, value)
        }
      })

      // Build headers
      const headers: Record<string, string> = { ...currentRequest.headers }

      // Add auth headers
      if (currentRequest.auth.type === 'bearer' && currentRequest.auth.token) {
        headers['Authorization'] = `Bearer ${currentRequest.auth.token}`
      } else if (
        currentRequest.auth.type === 'basic' &&
        currentRequest.auth.username &&
        currentRequest.auth.password
      ) {
        const credentials = btoa(`${currentRequest.auth.username}:${currentRequest.auth.password}`)
        headers['Authorization'] = `Basic ${credentials}`
      } else if (
        currentRequest.auth.type === 'api-key' &&
        currentRequest.auth.apiKey &&
        currentRequest.auth.apiKeyHeader
      ) {
        headers[currentRequest.auth.apiKeyHeader] = currentRequest.auth.apiKey
      }

      // Prepare body
      let body: string | FormData | undefined
      if (['POST', 'PUT', 'PATCH'].includes(currentRequest.method)) {
        if (currentRequest.bodyType === 'json' && currentRequest.body) {
          body = currentRequest.body
          if (!headers['Content-Type']) {
            headers['Content-Type'] = 'application/json'
          }
        } else if (currentRequest.bodyType === 'form' && currentRequest.body) {
          const formData = new FormData()
          try {
            const formObj = JSON.parse(currentRequest.body)
            Object.entries(formObj).forEach(([key, value]) => {
              formData.append(key, String(value))
            })
            body = formData
          } catch {
            body = currentRequest.body
            headers['Content-Type'] = 'application/x-www-form-urlencoded'
          }
        } else if (currentRequest.bodyType === 'raw' && currentRequest.body) {
          body = currentRequest.body
        }
      }

      const fetchResponse = await fetch(url.toString(), {
        method: currentRequest.method,
        headers,
        body,
      })

      const endTime = performance.now()
      const responseText = await fetchResponse.text()

      // Calculate response size
      const size = new Blob([responseText]).size

      const apiResponse: APIResponse = {
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        headers: Object.fromEntries(fetchResponse.headers.entries()),
        data: responseText,
        timing: {
          duration: Math.round(endTime - startTime),
          start: startTime,
          end: endTime,
        },
        size,
        redirected: fetchResponse.redirected,
        url: fetchResponse.url,
      }

      setResponse(apiResponse)
    } catch (err: any) {
      setError(`Request failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const addHeader = () => {
    setCurrentRequest(prev => ({
      ...prev,
      headers: { ...prev.headers, '': '' },
    }))
  }

  const updateHeader = (oldKey: string, newKey: string, value: string) => {
    setCurrentRequest(prev => {
      const newHeaders = { ...prev.headers }
      if (oldKey !== newKey) {
        delete newHeaders[oldKey]
      }
      if (newKey) {
        newHeaders[newKey] = value
      }
      return { ...prev, headers: newHeaders }
    })
  }

  const removeHeader = (key: string) => {
    setCurrentRequest(prev => {
      const newHeaders = { ...prev.headers }
      delete newHeaders[key]
      return { ...prev, headers: newHeaders }
    })
  }

  const addParam = () => {
    setCurrentRequest(prev => ({
      ...prev,
      params: { ...prev.params, '': '' },
    }))
  }

  const updateParam = (oldKey: string, newKey: string, value: string) => {
    setCurrentRequest(prev => {
      const newParams = { ...prev.params }
      if (oldKey !== newKey) {
        delete newParams[oldKey]
      }
      if (newKey) {
        newParams[newKey] = value
      }
      return { ...prev, params: newParams }
    })
  }

  const removeParam = (key: string) => {
    setCurrentRequest(prev => {
      const newParams = { ...prev.params }
      delete newParams[key]
      return { ...prev, params: newParams }
    })
  }

  const saveRequest = () => {
    const newRequest = {
      ...currentRequest,
      id: Date.now().toString(),
      name: currentRequest.name || `${currentRequest.method} ${currentRequest.url}`,
    }
    setSavedRequests(prev => [...prev, newRequest])
  }

  const loadRequest = (request: APIRequest) => {
    setCurrentRequest({ ...request })
    setShowSaved(false)
    setResponse(null)
    setError(null)
  }

  const exportRequest = () => {
    const exportData = {
      request: currentRequest,
      response: response,
      timestamp: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `api-request-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const generateCode = (language: string) => {
    const url = new URL(currentRequest.url)
    Object.entries(currentRequest.params).forEach(([key, value]) => {
      if (key && value) url.searchParams.set(key, value)
    })

    const headers = { ...currentRequest.headers }

    if (currentRequest.auth.type === 'bearer' && currentRequest.auth.token) {
      headers['Authorization'] = `Bearer ${currentRequest.auth.token}`
    }

    switch (language) {
      case 'curl':
        let curl = `curl -X ${currentRequest.method} "${url.toString()}"`
        Object.entries(headers).forEach(([key, value]) => {
          curl += ` \\\n  -H "${key}: ${value}"`
        })
        if (currentRequest.body && ['POST', 'PUT', 'PATCH'].includes(currentRequest.method)) {
          curl += ` \\\n  -d '${currentRequest.body}'`
        }
        return curl

      case 'javascript':
        return `fetch('${url.toString()}', {
  method: '${currentRequest.method}',
  headers: ${JSON.stringify(headers, null, 2)},${
    currentRequest.body && ['POST', 'PUT', 'PATCH'].includes(currentRequest.method)
      ? `\n  body: ${JSON.stringify(currentRequest.body)}`
      : ''
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`

      case 'python':
        return `import requests

url = "${url.toString()}"
headers = ${JSON.stringify(headers, null, 2)}${
          currentRequest.body && ['POST', 'PUT', 'PATCH'].includes(currentRequest.method)
            ? `\ndata = ${JSON.stringify(currentRequest.body)}\n\nresponse = requests.${currentRequest.method.toLowerCase()}(url, headers=headers, data=data)`
            : `\n\nresponse = requests.${currentRequest.method.toLowerCase()}(url, headers=headers)`
        }
print(response.json())`

      default:
        return 'Code generation not available for this language'
    }
  }

  const formatResponseData = (data: string) => {
    try {
      const parsed = JSON.parse(data)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return data
    }
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-100'
    if (status >= 300 && status < 400) return 'text-blue-600 bg-blue-100'
    if (status >= 400 && status < 500) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <ToolLayout
      title="REST API Client"
      description="Complete HTTP client for testing APIs with authentication, headers, and response analysis"
    >
      <div className="space-y-6">
        {/* Request Builder */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5" />
              API Request
            </h3>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowSaved(!showSaved)} variant="outline" size="sm">
                <FolderOpen className="w-4 h-4 mr-2" />
                {showSaved ? 'Hide' : 'Show'} Saved
              </Button>
              <Button onClick={saveRequest} variant="outline" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button onClick={exportRequest} variant="outline" size="sm" disabled={!response}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Saved Requests */}
          {showSaved && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <h4 className="font-medium mb-3">Saved Requests</h4>
              <div className="grid gap-2">
                {savedRequests.map(req => (
                  <button
                    key={req.id}
                    onClick={() => loadRequest(req)}
                    className="text-left p-3 bg-white dark:bg-gray-900 rounded border hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          req.method === 'GET'
                            ? 'bg-green-100 text-green-700'
                            : req.method === 'POST'
                              ? 'bg-blue-100 text-blue-700'
                              : req.method === 'PUT'
                                ? 'bg-yellow-100 text-yellow-700'
                                : req.method === 'DELETE'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {req.method}
                      </span>
                      <div>
                        <div className="font-medium">{req.name}</div>
                        <div className="text-sm text-gray-600">{req.url}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* URL and Method */}
          <div className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Request name (optional)"
                value={currentRequest.name}
                onChange={e => setCurrentRequest(prev => ({ ...prev, name: e.target.value }))}
                className="mb-2"
              />
            </div>

            <div className="flex gap-4">
              <select
                value={currentRequest.method}
                onChange={e => setCurrentRequest(prev => ({ ...prev, method: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md font-medium"
              >
                {HTTP_METHODS.map(method => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>

              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter request URL..."
                  value={currentRequest.url}
                  onChange={e => setCurrentRequest(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>

              <Button onClick={sendRequest} disabled={loading || !currentRequest.url.trim()}>
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Request Configuration */}
        <Card className="p-6">
          <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'params', label: 'Params', icon: Settings },
                { id: 'headers', label: 'Headers', icon: Code },
                { id: 'body', label: 'Body', icon: Eye },
                { id: 'auth', label: 'Auth', icon: Key },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'params' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Query Parameters</h4>
                <Button onClick={addParam} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Parameter
                </Button>
              </div>
              {Object.entries(currentRequest.params).map(([key, value], index) => (
                <div key={index} className="flex gap-3 items-center">
                  <Input
                    placeholder="Key"
                    value={key}
                    onChange={e => updateParam(key, e.target.value, value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value"
                    value={value}
                    onChange={e => updateParam(key, key, e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={() => removeParam(key)} variant="outline" size="sm">
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'headers' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Request Headers</h4>
                <Button onClick={addHeader} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Header
                </Button>
              </div>
              {Object.entries(currentRequest.headers).map(([key, value], index) => (
                <div key={index} className="flex gap-3 items-center">
                  <Input
                    placeholder="Header name"
                    value={key}
                    onChange={e => updateHeader(key, e.target.value, value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Header value"
                    value={value}
                    onChange={e => updateHeader(key, key, e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={() => removeHeader(key)} variant="outline" size="sm">
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'body' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <h4 className="font-medium">Request Body</h4>
                <select
                  value={currentRequest.bodyType}
                  onChange={e =>
                    setCurrentRequest(prev => ({ ...prev, bodyType: e.target.value as any }))
                  }
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="none">None</option>
                  <option value="json">JSON</option>
                  <option value="form">Form Data</option>
                  <option value="raw">Raw</option>
                </select>
              </div>

              {currentRequest.bodyType !== 'none' && (
                <Textarea
                  value={currentRequest.body}
                  onChange={e => setCurrentRequest(prev => ({ ...prev, body: e.target.value }))}
                  placeholder={
                    currentRequest.bodyType === 'json'
                      ? '{\n  "key": "value"\n}'
                      : currentRequest.bodyType === 'form'
                        ? '{\n  "field1": "value1",\n  "field2": "value2"\n}'
                        : 'Raw request body'
                  }
                  className="font-mono text-sm"
                  rows={8}
                />
              )}
            </div>
          )}

          {activeTab === 'auth' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Authentication</h4>
                <select
                  value={currentRequest.auth.type}
                  onChange={e =>
                    setCurrentRequest(prev => ({
                      ...prev,
                      auth: { ...prev.auth, type: e.target.value as any },
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="none">No Auth</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="basic">Basic Auth</option>
                  <option value="api-key">API Key</option>
                </select>
              </div>

              {currentRequest.auth.type === 'bearer' && (
                <Input
                  type="text"
                  placeholder="Bearer token"
                  value={currentRequest.auth.token || ''}
                  onChange={e =>
                    setCurrentRequest(prev => ({
                      ...prev,
                      auth: { ...prev.auth, token: e.target.value },
                    }))
                  }
                />
              )}

              {currentRequest.auth.type === 'basic' && (
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="text"
                    placeholder="Username"
                    value={currentRequest.auth.username || ''}
                    onChange={e =>
                      setCurrentRequest(prev => ({
                        ...prev,
                        auth: { ...prev.auth, username: e.target.value },
                      }))
                    }
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={currentRequest.auth.password || ''}
                    onChange={e =>
                      setCurrentRequest(prev => ({
                        ...prev,
                        auth: { ...prev.auth, password: e.target.value },
                      }))
                    }
                  />
                </div>
              )}

              {currentRequest.auth.type === 'api-key' && (
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="text"
                    placeholder="Header name (e.g., X-API-Key)"
                    value={currentRequest.auth.apiKeyHeader || ''}
                    onChange={e =>
                      setCurrentRequest(prev => ({
                        ...prev,
                        auth: { ...prev.auth, apiKeyHeader: e.target.value },
                      }))
                    }
                  />
                  <Input
                    type="text"
                    placeholder="API Key value"
                    value={currentRequest.auth.apiKey || ''}
                    onChange={e =>
                      setCurrentRequest(prev => ({
                        ...prev,
                        auth: { ...prev.auth, apiKey: e.target.value },
                      }))
                    }
                  />
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="p-6 border-red-200 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-red-700 dark:text-red-300">{error}</div>
            </div>
          </Card>
        )}

        {/* Response */}
        {response && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Response
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => copyToClipboard(response.data)}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copied ? 'Copied!' : 'Copy Response'}
                  </Button>
                </div>
              </div>

              {/* Response Info */}
              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 rounded-lg">
                  <div
                    className={`text-lg font-bold px-3 py-1 rounded ${getStatusColor(response.status)}`}
                  >
                    {response.status}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{response.statusText}</div>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {response.timing.duration}ms
                  </div>
                  <div className="text-sm text-gray-600">Duration</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">
                    {(response.size / 1024).toFixed(2)}KB
                  </div>
                  <div className="text-sm text-gray-600">Size</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-lg font-bold">{Object.keys(response.headers).length}</div>
                  <div className="text-sm text-gray-600">Headers</div>
                </div>
              </div>

              {/* Response Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'response', label: 'Response' },
                    { id: 'headers', label: 'Headers' },
                    { id: 'raw', label: 'Raw' },
                  ].map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => setResponseTab(id as any)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        responseTab === id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Response Content */}
              {responseTab === 'response' && (
                <Textarea
                  value={formatResponseData(response.data)}
                  readOnly
                  className="font-mono text-sm min-h-[300px]"
                />
              )}

              {responseTab === 'headers' && (
                <div className="space-y-2">
                  {Object.entries(response.headers).map(([key, value]) => (
                    <div key={key} className="flex gap-4 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="font-medium text-sm w-1/3">{key}:</div>
                      <div className="text-sm font-mono">{value}</div>
                    </div>
                  ))}
                </div>
              )}

              {responseTab === 'raw' && (
                <Textarea
                  value={response.data}
                  readOnly
                  className="font-mono text-sm min-h-[300px]"
                />
              )}
            </Card>
          </motion.div>
        )}

        {/* Code Generation */}
        {currentRequest.url && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Generate Code
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {['curl', 'javascript', 'python'].map(lang => (
                <div key={lang}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium capitalize">{lang}</h4>
                    <Button
                      onClick={() => copyToClipboard(generateCode(lang))}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={generateCode(lang)}
                    readOnly
                    className="font-mono text-xs"
                    rows={8}
                  />
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </ToolLayout>
  )
}

export default APIClientPage
