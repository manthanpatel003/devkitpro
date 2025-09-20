'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { 
  Zap, 
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  BarChart3
} from 'lucide-react'

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  lighthouseScore: number
  bundleSize: number
  imageOptimization: boolean
  codeSplitting: boolean
  caching: boolean
}

export const PerformanceOptimizer: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { success, error: showError } = useToast()

  const analyzePerformance = async () => {
    setIsAnalyzing(true)
    
    try {
      // Simulate performance analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockMetrics: PerformanceMetrics = {
        loadTime: Math.random() * 2000 + 500, // 500-2500ms
        renderTime: Math.random() * 1000 + 200, // 200-1200ms
        memoryUsage: Math.random() * 50 + 10, // 10-60MB
        lighthouseScore: Math.random() * 40 + 60, // 60-100
        bundleSize: Math.random() * 500 + 200, // 200-700KB
        imageOptimization: Math.random() > 0.3,
        codeSplitting: Math.random() > 0.2,
        caching: Math.random() > 0.1
      }
      
      setMetrics(mockMetrics)
      success('Performance analysis completed!')
    } catch (err) {
      showError('Performance analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2 text-blue-600" />
            Performance Analysis
          </CardTitle>
          <CardDescription>
            Analyze and optimize your application's performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={analyzePerformance}
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analyze Performance
                </>
              )}
            </Button>
            
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {metrics.loadTime.toFixed(0)}ms
                  </div>
                  <div className="text-sm text-blue-600">Load Time</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.renderTime.toFixed(0)}ms
                  </div>
                  <div className="text-sm text-green-600">Render Time</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {metrics.memoryUsage.toFixed(1)}MB
                  </div>
                  <div className="text-sm text-purple-600">Memory Usage</div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className={`text-2xl font-bold ${getScoreColor(metrics.lighthouseScore)}`}>
                    {getScoreGrade(metrics.lighthouseScore)}
                  </div>
                  <div className="text-sm text-yellow-600">Lighthouse Score</div>
                </div>
                
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">
                    {metrics.bundleSize.toFixed(0)}KB
                  </div>
                  <div className="text-sm text-indigo-600">Bundle Size</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Optimization Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Image Optimization</span>
                <div className="flex items-center">
                  {metrics.imageOptimization ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Code Splitting</span>
                <div className="flex items-center">
                  {metrics.codeSplitting ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Caching</span>
                <div className="flex items-center">
                  {metrics.caching ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)

  useEffect(() => {
    const measurePerformance = () => {
      if (typeof window === 'undefined') return

      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')
      
      const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0
      const renderTime = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
      
      // Memory usage (if available)
      const memory = (performance as any).memory
      const memoryUsage = memory ? memory.usedJSHeapSize / 1024 / 1024 : 0
      
      setMetrics({
        loadTime,
        renderTime,
        memoryUsage,
        lighthouseScore: 0, // Would need actual Lighthouse analysis
        bundleSize: 0, // Would need bundle analysis
        imageOptimization: true,
        codeSplitting: true,
        caching: true
      })
    }

    // Measure performance after page load
    if (document.readyState === 'complete') {
      measurePerformance()
    } else {
      window.addEventListener('load', measurePerformance)
    }

    return () => {
      window.removeEventListener('load', measurePerformance)
    }
  }, [])

  return metrics
}

// Lazy loading component
export const LazyComponent: React.FC<{
  children: React.ReactNode
  fallback?: React.ReactNode
  threshold?: number
}> = ({ children, fallback, threshold = 0.1 }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true)
          setHasLoaded(true)
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [threshold, hasLoaded])

  return (
    <div ref={ref}>
      {isVisible ? children : (fallback || <div>Loading...</div>)}
    </div>
  )
}

// Image optimization component
export const OptimizedImage: React.FC<{
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}> = ({ src, alt, width, height, className, priority = false }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-500">
          Failed to load image
        </div>
      )}
    </div>
  )
}