'use client'

import React, { useState, useEffect, useRef } from 'react'
// Metadata removed - client components cannot export metadata
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/components/ui/Toast'
import { 
  Zap, 
  Download, 
  Upload, 
  Clock, 
  Wifi, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Activity,
  Server
} from 'lucide-react'
import { formatBytes, formatDuration } from '@/lib/utils'
import { SpeedTestResult } from '@/types'

// Metadata removed - client components cannot export metadata

export default function SpeedTestPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<SpeedTestResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [testHistory, setTestHistory] = useState<SpeedTestResult[]>([])
  const abortControllerRef = useRef<AbortController | null>(null)
  const { success, error: showError } = useToast()

  // Test data for download/upload tests
  const testSizes = [1, 2, 5, 10, 20] // MB
  const testUrls = [
    'https://httpbin.org/bytes/1048576', // 1MB
    'https://httpbin.org/bytes/2097152', // 2MB
    'https://httpbin.org/bytes/5242880', // 5MB
    'https://httpbin.org/bytes/10485760', // 10MB
    'https://httpbin.org/bytes/20971520' // 20MB
  ]

  const runSpeedTest = async () => {
    setIsRunning(true)
    setError(null)
    setResults(null)
    setProgress(0)
    setCurrentTest('Initializing...')

    try {
      abortControllerRef.current = new AbortController()
      
      // Test ping first
      setCurrentTest('Testing ping...')
      setProgress(10)
      const ping = await testPing()
      
      // Test download speed
      setCurrentTest('Testing download speed...')
      setProgress(30)
      const download = await testDownloadSpeed()
      
      // Test upload speed
      setCurrentTest('Testing upload speed...')
      setProgress(70)
      const upload = await testUploadSpeed()
      
      // Test jitter
      setCurrentTest('Testing jitter...')
      setProgress(90)
      const jitter = await testJitter()
      
      // Determine connection type
      const connection = getConnectionType(download)
      
      const speedTestResult: SpeedTestResult = {
        download: download,
        upload: upload,
        ping: ping,
        jitter: jitter,
        server: 'Speed Test Server',
        timestamp: Date.now(),
        connection: connection
      }
      
      setResults(speedTestResult)
      setTestHistory(prev => [speedTestResult, ...prev.slice(0, 9)]) // Keep last 10 tests
      setProgress(100)
      setCurrentTest('Complete!')
      
      success('Speed test completed successfully!')
      
      // Reset after a delay
      setTimeout(() => {
        setCurrentTest(null)
        setProgress(0)
      }, 2000)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Speed test failed'
      setError(errorMessage)
      showError('Speed Test Failed', errorMessage)
    } finally {
      setIsRunning(false)
      abortControllerRef.current = null
    }
  }

  const testPing = async (): Promise<number> => {
    const startTime = performance.now()
    
    try {
      const response = await fetch('https://httpbin.org/get', {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      })
      
      const endTime = performance.now()
      return Math.round(endTime - startTime)
    } catch (error) {
      return 0
    }
  }

  const testDownloadSpeed = async (): Promise<number> => {
    let totalBytes = 0
    let totalTime = 0
    
    for (let i = 0; i < testSizes.length; i++) {
      if (abortControllerRef.current?.signal.aborted) throw new Error('Test aborted')
      
      const startTime = performance.now()
      
      try {
        const response = await fetch(testUrls[i], {
          signal: AbortSignal.timeout(10000)
        })
        
        if (!response.ok) throw new Error('Download failed')
        
        const blob = await response.blob()
        const endTime = performance.now()
        
        totalBytes += blob.size
        totalTime += endTime - startTime
        
        // Update progress
        setProgress(30 + (i + 1) * 8)
        
      } catch (error) {
        console.warn(`Download test ${i + 1} failed:`, error)
      }
    }
    
    if (totalTime === 0) return 0
    
    // Convert to Mbps
    const bytesPerSecond = (totalBytes * 8) / (totalTime / 1000)
    return Math.round(bytesPerSecond / 1000000 * 100) / 100
  }

  const testUploadSpeed = async (): Promise<number> => {
    let totalBytes = 0
    let totalTime = 0
    
    for (let i = 0; i < testSizes.length; i++) {
      if (abortControllerRef.current?.signal.aborted) throw new Error('Test aborted')
      
      const testData = new ArrayBuffer(testSizes[i] * 1024 * 1024)
      const startTime = performance.now()
      
      try {
        const response = await fetch('https://httpbin.org/post', {
          method: 'POST',
          body: testData,
          signal: AbortSignal.timeout(15000)
        })
        
        if (!response.ok) throw new Error('Upload failed')
        
        const endTime = performance.now()
        
        totalBytes += testData.byteLength
        totalTime += endTime - startTime
        
        // Update progress
        setProgress(70 + (i + 1) * 4)
        
      } catch (error) {
        console.warn(`Upload test ${i + 1} failed:`, error)
      }
    }
    
    if (totalTime === 0) return 0
    
    // Convert to Mbps
    const bytesPerSecond = (totalBytes * 8) / (totalTime / 1000)
    return Math.round(bytesPerSecond / 1000000 * 100) / 100
  }

  const testJitter = async (): Promise<number> => {
    const pings: number[] = []
    
    for (let i = 0; i < 5; i++) {
      if (abortControllerRef.current?.signal.aborted) throw new Error('Test aborted')
      
      const ping = await testPing()
      if (ping > 0) pings.push(ping)
      
      // Small delay between pings
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    if (pings.length < 2) return 0
    
    // Calculate jitter (standard deviation of ping times)
    const avg = pings.reduce((a, b) => a + b, 0) / pings.length
    const variance = pings.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / pings.length
    return Math.round(Math.sqrt(variance) * 100) / 100
  }

  const getConnectionType = (downloadSpeed: number): 'wifi' | 'ethernet' | 'mobile' => {
    if (downloadSpeed > 100) return 'ethernet'
    if (downloadSpeed > 25) return 'wifi'
    return 'mobile'
  }

  const stopTest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsRunning(false)
      setCurrentTest(null)
    }
  }

  const getSpeedRating = (speed: number, type: 'download' | 'upload') => {
    const thresholds = type === 'download' 
      ? [5, 25, 100, 500] // Download thresholds
      : [1, 5, 25, 100]   // Upload thresholds
    
    if (speed >= thresholds[3]) return { label: 'Excellent', color: 'text-green-600' }
    if (speed >= thresholds[2]) return { label: 'Very Good', color: 'text-blue-600' }
    if (speed >= thresholds[1]) return { label: 'Good', color: 'text-yellow-600' }
    if (speed >= thresholds[0]) return { label: 'Fair', color: 'text-orange-600' }
    return { label: 'Poor', color: 'text-red-600' }
  }

  const getPingRating = (ping: number) => {
    if (ping < 20) return { label: 'Excellent', color: 'text-green-600' }
    if (ping < 50) return { label: 'Good', color: 'text-blue-600' }
    if (ping < 100) return { label: 'Fair', color: 'text-yellow-600' }
    return { label: 'Poor', color: 'text-red-600' }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Internet Speed Test
          </h1>
          <p className="text-xl text-gray-600">
            Test your internet connection speed with our free speed test tool
          </p>
        </div>

        {/* Speed Test Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-blue-600" />
              Speed Test
            </CardTitle>
            <CardDescription>
              Click start to test your download, upload, ping, and jitter speeds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              {!isRunning && !results && (
                <div className="py-12">
                  <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Ready to Test Your Speed?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    This test will measure your download speed, upload speed, ping, and jitter
                  </p>
                  <Button
                    onClick={runSpeedTest}
                    size="lg"
                    className="px-8 py-4 text-lg"
                  >
                    <Activity className="w-5 h-5 mr-2" />
                    Start Speed Test
                  </Button>
                </div>
              )}

              {isRunning && (
                <div className="py-12">
                  <LoadingSpinner size="lg" text={currentTest || 'Running speed test...'} />
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div 
                        className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      {progress}% complete
                    </div>
                  </div>
                  <Button
                    onClick={stopTest}
                    variant="outline"
                    className="mt-4"
                  >
                    Stop Test
                  </Button>
                </div>
              )}

              {error && (
                <div className="py-12">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Failed</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <Button onClick={runSpeedTest}>
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Speed Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                  Speed Test Results
                </CardTitle>
                <CardDescription>
                  Test completed at {new Date(results.timestamp).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Download Speed */}
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <Download className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {results.download.toFixed(2)}
                    </div>
                    <div className="text-sm text-blue-600 mb-1">Mbps</div>
                    <div className="text-xs text-gray-600">Download Speed</div>
                    <div className={`text-xs font-medium mt-1 ${getSpeedRating(results.download, 'download').color}`}>
                      {getSpeedRating(results.download, 'download').label}
                    </div>
                  </div>

                  {/* Upload Speed */}
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <Upload className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {results.upload.toFixed(2)}
                    </div>
                    <div className="text-sm text-green-600 mb-1">Mbps</div>
                    <div className="text-xs text-gray-600">Upload Speed</div>
                    <div className={`text-xs font-medium mt-1 ${getSpeedRating(results.upload, 'upload').color}`}>
                      {getSpeedRating(results.upload, 'upload').label}
                    </div>
                  </div>

                  {/* Ping */}
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      {results.ping}
                    </div>
                    <div className="text-sm text-purple-600 mb-1">ms</div>
                    <div className="text-xs text-gray-600">Ping</div>
                    <div className={`text-xs font-medium mt-1 ${getPingRating(results.ping).color}`}>
                      {getPingRating(results.ping).label}
                    </div>
                  </div>

                  {/* Jitter */}
                  <div className="text-center p-6 bg-orange-50 rounded-lg">
                    <Activity className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-orange-600 mb-1">
                      {results.jitter}
                    </div>
                    <div className="text-sm text-orange-600 mb-1">ms</div>
                    <div className="text-xs text-gray-600">Jitter</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {results.jitter < 5 ? 'Stable' : 'Variable'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Connection Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wifi className="w-5 h-5 mr-2 text-blue-600" />
                  Connection Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Connection Type</div>
                    <div className="font-semibold capitalize">{results.connection}</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Server</div>
                    <div className="font-semibold">{results.server}</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Test Time</div>
                    <div className="font-semibold">
                      {new Date(results.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={runSpeedTest}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Run Another Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Test History */}
        {testHistory.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Test History</CardTitle>
              <CardDescription>
                Your recent speed test results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {testHistory.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-600">
                        {new Date(test.timestamp).toLocaleString()}
                      </div>
                      <div className="text-sm font-medium">
                        {test.download.toFixed(2)} Mbps ↓ / {test.upload.toFixed(2)} Mbps ↑
                      </div>
                      <div className="text-sm text-gray-500">
                        {test.ping}ms ping
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {test.connection}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2 text-blue-600" />
                How Speed Tests Work
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Speed tests measure your internet connection by downloading and uploading 
                data to test servers. The results show your actual bandwidth, latency, 
                and connection stability.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="w-5 h-5 mr-2 text-green-600" />
                Speed Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>Download:</strong> 25+ Mbps for HD streaming</div>
                <div><strong>Upload:</strong> 5+ Mbps for video calls</div>
                <div><strong>Ping:</strong> &lt; 50ms for gaming</div>
                <div><strong>Jitter:</strong> &lt; 5ms for stable connections</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}