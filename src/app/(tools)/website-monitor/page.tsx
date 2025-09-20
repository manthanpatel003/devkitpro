'use client'

import React, { useState, useEffect } from 'react'
import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/components/ui/Toast'
import { 
  Globe, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Copy,
  ExternalLink,
  AlertTriangle,
  Activity,
  Server
} from 'lucide-react'
import { copyToClipboard, formatBytes, formatDuration } from '@/lib/utils'
import { WebsiteMonitor } from '@/types'

export const metadata: Metadata = {
  title: 'Website Uptime Monitor - Free Website Status Checker',
  description: 'Monitor website availability, response times, and status. Free uptime monitoring tool with detailed analysis.',
  keywords: ['uptime monitor', 'website status', 'website checker', 'uptime checker', 'website monitoring', 'response time'],
  openGraph: {
    title: 'Website Uptime Monitor - Free Website Status Checker',
    description: 'Monitor website availability, response times, and status. Free uptime monitoring tool.',
  },
}

export default function WebsiteMonitorPage() {
  const [url, setUrl] = useState('')
  const [monitorData, setMonitorData] = useState<WebsiteMonitor | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(30) // seconds
  const { success, error: showError } = useToast()

  const checkWebsite = async () => {
    if (!url.trim()) {
      showError('Please enter a website URL')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/website-monitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to check website')
      }

      const data = await response.json()
      setMonitorData(data)
      
      if (data.success) {
        success('Website is up and running!')
      } else {
        showError('Website is down or unreachable')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check website'
      setError(errorMessage)
      showError('Website Check Failed', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh functionality
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (autoRefresh && url.trim()) {
      interval = setInterval(() => {
        checkWebsite()
      }, refreshInterval * 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [autoRefresh, refreshInterval, url])

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
      case 'up':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'down':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'checking':
        return <Clock className="w-5 h-5 text-yellow-500" />
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'down':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'checking':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getResponseTimeColor = (responseTime: number) => {
    if (responseTime < 500) return 'text-green-600'
    if (responseTime < 1000) return 'text-yellow-600'
    if (responseTime < 2000) return 'text-orange-600'
    return 'text-red-600'
  }

  const getResponseTimeLabel = (responseTime: number) => {
    if (responseTime < 500) return 'Excellent'
    if (responseTime < 1000) return 'Good'
    if (responseTime < 2000) return 'Fair'
    return 'Poor'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Website Uptime Monitor
          </h1>
          <p className="text-xl text-gray-600">
            Monitor website availability, response times, and status in real-time
          </p>
        </div>

        {/* Input Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Website Monitor</CardTitle>
            <CardDescription>
              Enter a website URL to check its status and response time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="https://example.com or example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && checkWebsite()}
                  className="flex-1"
                  icon={<Globe className="w-5 h-5" />}
                />
                <Button
                  onClick={checkWebsite}
                  disabled={loading || !url.trim()}
                  className="px-8"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Activity className="w-4 h-4 mr-2" />
                      Check Status
                    </>
                  )}
                </Button>
              </div>
              
              {/* Auto-refresh controls */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Auto-refresh</span>
                </label>
                {autoRefresh && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Every</span>
                    <select
                      value={refreshInterval}
                      onChange={(e) => setRefreshInterval(Number(e.target.value))}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value={10}>10 seconds</option>
                      <option value={30}>30 seconds</option>
                      <option value={60}>1 minute</option>
                      <option value={300}>5 minutes</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading && (
          <Card className="mb-8">
            <CardContent className="py-12">
              <div className="text-center">
                <LoadingSpinner size="lg" text="Checking website status..." />
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="mb-8">
            <CardContent className="py-12">
              <div className="text-center">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Website Check Failed</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={checkWebsite}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {monitorData && (
          <div className="space-y-6">
            {/* Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-blue-600" />
                  Website Status
                </CardTitle>
                <CardDescription>
                  Last checked: {new Date(monitorData.lastChecked).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(monitorData.status)}
                    <div>
                      <div className="text-lg font-semibold">
                        {monitorData.status === 'up' ? 'Website is Online' : 'Website is Offline'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {monitorData.url}
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(monitorData.status)}`}>
                    {monitorData.status.toUpperCase()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-green-600" />
                    Response Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Status Code</span>
                      <span className={`font-medium ${monitorData.statusCode >= 200 && monitorData.statusCode < 300 ? 'text-green-600' : 'text-red-600'}`}>
                        {monitorData.statusCode}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Response Time</span>
                      <span className={`font-medium ${getResponseTimeColor(monitorData.responseTime || 0)}`}>
                        {formatDuration(monitorData.responseTime || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Performance</span>
                      <span className={`font-medium ${getResponseTimeColor(monitorData.responseTime || 0)}`}>
                        {getResponseTimeLabel(monitorData.responseTime || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Content Size</span>
                      <span className="font-medium">
                        {monitorData.size ? formatBytes(monitorData.size) : 'Unknown'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Server className="w-5 h-5 mr-2 text-blue-600" />
                    Server Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Server</span>
                      <span className="font-medium text-right max-w-xs truncate" title={monitorData.headers?.server || 'Unknown'}>
                        {monitorData.headers?.server || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Content Type</span>
                      <span className="font-medium text-right max-w-xs truncate" title={monitorData.headers?.['content-type'] || 'Unknown'}>
                        {monitorData.headers?.['content-type'] || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Powered By</span>
                      <span className="font-medium text-right max-w-xs truncate" title={monitorData.headers?.['x-powered-by'] || 'Unknown'}>
                        {monitorData.headers?.['x-powered-by'] || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Cache Control</span>
                      <span className="font-medium text-right max-w-xs truncate" title={monitorData.headers?.['cache-control'] || 'Unknown'}>
                        {monitorData.headers?.['cache-control'] || 'Unknown'}
                      </span>
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
                    onClick={() => handleCopy(monitorData.url, 'Website URL')}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy URL
                  </Button>
                  <Button
                    onClick={() => handleCopy(monitorData.statusCode?.toString() || '', 'Status Code')}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Status Code
                  </Button>
                  <Button
                    onClick={() => window.open(monitorData.url, '_blank')}
                    variant="outline"
                    size="sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Website
                  </Button>
                  <Button
                    onClick={checkWebsite}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
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
                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                What is Uptime Monitoring?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Uptime monitoring checks if your website is accessible and responding properly. 
                It measures response times, status codes, and availability to ensure your 
                website is performing optimally for users.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                Response Time Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>Excellent:</strong> &lt; 500ms</div>
                <div><strong>Good:</strong> 500ms - 1s</div>
                <div><strong>Fair:</strong> 1s - 2s</div>
                <div><strong>Poor:</strong> &gt; 2s</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}