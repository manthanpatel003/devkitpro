'use client'

import React, { useState, useRef } from 'react'
// Metadata removed - client components cannot export metadata
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/components/ui/Toast'
import { 
  Search, 
  Copy, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Shield,
  Server,
  AlertTriangle,
  Play,
  Square
} from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'
import { PortScanResult } from '@/types'

// Metadata removed - client components cannot export metadata

const commonPorts = [
  { port: 21, service: 'FTP', description: 'File Transfer Protocol' },
  { port: 22, service: 'SSH', description: 'Secure Shell' },
  { port: 23, service: 'Telnet', description: 'Telnet Protocol' },
  { port: 25, service: 'SMTP', description: 'Simple Mail Transfer Protocol' },
  { port: 53, service: 'DNS', description: 'Domain Name System' },
  { port: 80, service: 'HTTP', description: 'Hypertext Transfer Protocol' },
  { port: 110, service: 'POP3', description: 'Post Office Protocol' },
  { port: 143, service: 'IMAP', description: 'Internet Message Access Protocol' },
  { port: 443, service: 'HTTPS', description: 'HTTP Secure' },
  { port: 993, service: 'IMAPS', description: 'IMAP over SSL' },
  { port: 995, service: 'POP3S', description: 'POP3 over SSL' },
  { port: 3389, service: 'RDP', description: 'Remote Desktop Protocol' },
  { port: 5432, service: 'PostgreSQL', description: 'PostgreSQL Database' },
  { port: 3306, service: 'MySQL', description: 'MySQL Database' },
  { port: 6379, service: 'Redis', description: 'Redis Database' },
  { port: 27017, service: 'MongoDB', description: 'MongoDB Database' }
]

export default function PortScannerPage() {
  const [host, setHost] = useState('')
  const [portRange, setPortRange] = useState('1-1000')
  const [results, setResults] = useState<PortScanResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [scannedPorts, setScannedPorts] = useState(0)
  const [totalPorts, setTotalPorts] = useState(0)
  const abortControllerRef = useRef<AbortController | null>(null)
  const { success, error: showError } = useToast()

  const scanPort = async (host: string, port: number): Promise<PortScanResult> => {
    return new Promise((resolve) => {
      const startTime = Date.now()
      const socket = new WebSocket(`ws://${host}:${port}`)
      
      const timeout = setTimeout(() => {
        socket.close()
        resolve({
          port,
          status: 'closed',
          service: getServiceName(port),
          responseTime: Date.now() - startTime
        })
      }, 3000)

      socket.onopen = () => {
        clearTimeout(timeout)
        socket.close()
        resolve({
          port,
          status: 'open',
          service: getServiceName(port),
          responseTime: Date.now() - startTime
        })
      }

      socket.onerror = () => {
        clearTimeout(timeout)
        resolve({
          port,
          status: 'closed',
          service: getServiceName(port),
          responseTime: Date.now() - startTime
        })
      }
    })
  }

  const getServiceName = (port: number): string => {
    const commonPort = commonPorts.find(p => p.port === port)
    return commonPort?.service || 'Unknown'
  }

  const parsePortRange = (range: string): number[] => {
    if (range.includes('-')) {
      const [start, end] = range.split('-').map(Number)
      const ports = []
      for (let i = start; i <= end; i++) {
        ports.push(i)
      }
      return ports
    } else {
      return [Number(range)]
    }
  }

  const scanPorts = async () => {
    if (!host.trim()) {
      showError('Please enter a host or IP address')
      return
    }

    setLoading(true)
    setError(null)
    setResults([])
    setScanning(true)
    setProgress(0)
    setScannedPorts(0)

    try {
      const cleanHost = host.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')
      const ports = parsePortRange(portRange)
      setTotalPorts(ports.length)

      abortControllerRef.current = new AbortController()
      const results: PortScanResult[] = []

      for (let i = 0; i < ports.length; i++) {
        if (abortControllerRef.current?.signal.aborted) {
          break
        }

        const port = ports[i]
        const result = await scanPort(cleanHost, port)
        results.push(result)

        setScannedPorts(i + 1)
        setProgress(((i + 1) / ports.length) * 100)

        // Small delay to prevent overwhelming the target
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      setResults(results)
      const openPorts = results.filter(r => r.status === 'open')
      success(`Scan completed! Found ${openPorts.length} open ports out of ${ports.length} scanned`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to scan ports'
      setError(errorMessage)
      showError('Port Scan Failed', errorMessage)
    } finally {
      setLoading(false)
      setScanning(false)
      abortControllerRef.current = null
    }
  }

  const stopScan = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setScanning(false)
      setLoading(false)
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'closed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'filtered':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'closed':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'filtered':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const openPorts = results.filter(r => r.status === 'open')
  const closedPorts = results.filter(r => r.status === 'closed')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Port Scanner
          </h1>
          <p className="text-xl text-gray-600">
            Scan open ports on any host or IP address with service detection
          </p>
        </div>

        {/* Input Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Port Scanner</CardTitle>
            <CardDescription>
              Enter a host or IP address and specify the port range to scan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="example.com or 192.168.1.1"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  className="flex-1"
                  icon={<Server className="w-5 h-5" />}
                />
                <Input
                  placeholder="1-1000"
                  value={portRange}
                  onChange={(e) => setPortRange(e.target.value)}
                  className="w-32"
                  icon={<Search className="w-5 h-5" />}
                />
                {!scanning ? (
                  <Button
                    onClick={scanPorts}
                    disabled={loading || !host.trim()}
                    className="px-8"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Scan
                  </Button>
                ) : (
                  <Button
                    onClick={stopScan}
                    variant="outline"
                    className="px-8"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop Scan
                  </Button>
                )}
              </div>
              
              {/* Progress Bar */}
              {scanning && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Scanning ports...</span>
                    <span>{scannedPorts} / {totalPorts}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading && !scanning && (
          <Card className="mb-8">
            <CardContent className="py-12">
              <div className="text-center">
                <LoadingSpinner size="lg" text="Preparing port scan..." />
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="mb-8">
            <CardContent className="py-12">
              <div className="text-center">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Port Scan Failed</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={scanPorts}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {results.length > 0 && (
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Scan Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{openPorts.length}</div>
                    <div className="text-sm text-green-600">Open Ports</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{closedPorts.length}</div>
                    <div className="text-sm text-red-600">Closed Ports</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{results.length}</div>
                    <div className="text-sm text-blue-600">Total Scanned</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">
                      {results.length > 0 ? Math.round((openPorts.length / results.length) * 100) : 0}%
                    </div>
                    <div className="text-sm text-gray-600">Open Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Open Ports */}
            {openPorts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                    Open Ports ({openPorts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {openPorts.map((port, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(port.status)}
                          <div>
                            <div className="font-medium text-gray-900">
                              Port {port.port} - {port.service}
                            </div>
                            <div className="text-sm text-gray-600">
                              Response time: {port.responseTime}ms
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleCopy(port.port.toString(), 'Port Number')}
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Results */}
            <Card>
              <CardHeader>
                <CardTitle>All Results</CardTitle>
                <CardDescription>
                  Complete list of scanned ports and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {results.map((port, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(port.status)}
                        <div>
                          <div className="font-medium text-gray-900">
                            Port {port.port}
                          </div>
                          <div className="text-sm text-gray-600">
                            {port.service} • {port.responseTime}ms
                          </div>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(port.status)}`}>
                        {port.status.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => handleCopy(openPorts.map(p => p.port).join(', '), 'Open Ports')}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Open Ports
                  </Button>
                  <Button
                    onClick={() => handleCopy(results.map(p => `${p.port}:${p.status}`).join('\n'), 'All Results')}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All Results
                  </Button>
                  <Button
                    onClick={scanPorts}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Scan Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Common Ports Reference */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Common Ports Reference</CardTitle>
            <CardDescription>
              Well-known ports and their associated services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {commonPorts.map((port, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">
                      Port {port.port} - {port.service}
                    </div>
                    <div className="text-sm text-gray-600">{port.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}