// Performance monitoring and optimization utilities

export interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  lighthouseScore: number
  bundleSize: number
  imageOptimization: boolean
  codeSplitting: boolean
  caching: boolean
}

export interface WebVitals {
  CLS: number
  FID: number
  FCP: number
  LCP: number
  TTFB: number
}

// Performance monitoring class
export class PerformanceMonitor {
  private metrics: PerformanceMetrics | null = null
  private webVitals: WebVitals | null = null
  private observers: PerformanceObserver[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeMonitoring()
    }
  }

  private initializeMonitoring() {
    // Monitor Core Web Vitals
    this.observeWebVitals()
    
    // Monitor memory usage
    this.observeMemoryUsage()
    
    // Monitor resource loading
    this.observeResourceLoading()
  }

  private observeWebVitals() {
    // First Contentful Paint (FCP)
    this.observeMetric('paint', (entries) => {
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.updateWebVitals('FCP', entry.startTime)
        }
      })
    })

    // Largest Contentful Paint (LCP)
    this.observeMetric('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1]
      this.updateWebVitals('LCP', lastEntry.startTime)
    })

    // First Input Delay (FID)
    this.observeMetric('first-input', (entries) => {
      entries.forEach((entry) => {
        this.updateWebVitals('FID', entry.processingStart - entry.startTime)
      })
    })

    // Cumulative Layout Shift (CLS)
    this.observeMetric('layout-shift', (entries) => {
      let clsValue = 0
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      this.updateWebVitals('CLS', clsValue)
    })

    // Time to First Byte (TTFB)
    this.observeMetric('navigation', (entries) => {
      entries.forEach((entry) => {
        const navigationEntry = entry as PerformanceNavigationTiming
        this.updateWebVitals('TTFB', navigationEntry.responseStart - navigationEntry.requestStart)
      })
    })
  }

  private observeMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      this.metrics = {
        ...this.metrics,
        memoryUsage: memory.usedJSHeapSize / 1024 / 1024, // Convert to MB
      } as PerformanceMetrics
    }
  }

  private observeResourceLoading() {
    this.observeMetric('resource', (entries) => {
      entries.forEach((entry) => {
        const resourceEntry = entry as PerformanceResourceTiming
        
        // Check for slow resources
        if (resourceEntry.duration > 1000) {
          console.warn('Slow resource detected:', resourceEntry.name, resourceEntry.duration + 'ms')
        }
        
        // Check for large resources
        if (resourceEntry.transferSize > 1024 * 1024) { // 1MB
          console.warn('Large resource detected:', resourceEntry.name, resourceEntry.transferSize + ' bytes')
        }
      })
    })
  }

  private observeMetric(type: string, callback: (entries: PerformanceEntry[]) => void) {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries())
      })
      
      observer.observe({ type, buffered: true })
      this.observers.push(observer)
    } catch (error) {
      console.warn(`Failed to observe ${type}:`, error)
    }
  }

  private updateWebVitals(metric: keyof WebVitals, value: number) {
    if (!this.webVitals) {
      this.webVitals = {} as WebVitals
    }
    
    this.webVitals[metric] = value
  }

  public getMetrics(): PerformanceMetrics | null {
    return this.metrics
  }

  public getWebVitals(): WebVitals | null {
    return this.webVitals
  }

  public getPerformanceScore(): number {
    if (!this.webVitals) return 0

    const { CLS, FID, FCP, LCP, TTFB } = this.webVitals
    
    // Calculate score based on Core Web Vitals thresholds
    let score = 100
    
    // CLS scoring (0-0.1 is good, 0.1-0.25 needs improvement, >0.25 is poor)
    if (CLS > 0.25) score -= 30
    else if (CLS > 0.1) score -= 15
    
    // FID scoring (<100ms is good, 100-300ms needs improvement, >300ms is poor)
    if (FID > 300) score -= 30
    else if (FID > 100) score -= 15
    
    // LCP scoring (<2.5s is good, 2.5-4s needs improvement, >4s is poor)
    if (LCP > 4000) score -= 30
    else if (LCP > 2500) score -= 15
    
    // FCP scoring (<1.8s is good, 1.8-3s needs improvement, >3s is poor)
    if (FCP > 3000) score -= 20
    else if (FCP > 1800) score -= 10
    
    // TTFB scoring (<800ms is good, 800-1800ms needs improvement, >1800ms is poor)
    if (TTFB > 1800) score -= 20
    else if (TTFB > 800) score -= 10
    
    return Math.max(0, score)
  }

  public cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Image optimization utilities
export class ImageOptimizer {
  static async compressImage(file: File, quality: number = 0.8, maxWidth?: number, maxHeight?: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        let { width, height } = img
        
        // Calculate new dimensions
        if (maxWidth && maxHeight) {
          const aspectRatio = width / height
          if (width > maxWidth) {
            width = maxWidth
            height = width / aspectRatio
          }
          if (height > maxHeight) {
            height = maxHeight
            width = height * aspectRatio
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          'image/jpeg',
          quality
        )
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }
  
  static async convertToWebP(file: File, quality: number = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        
        ctx?.drawImage(img, 0, 0)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to convert to WebP'))
            }
          },
          'image/webp',
          quality
        )
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }
}

// Code splitting utilities
export class CodeSplitter {
  static async loadComponent<T>(importFn: () => Promise<{ default: T }>): Promise<T> {
    try {
      const module = await importFn()
      return module.default
    } catch (error) {
      console.error('Failed to load component:', error)
      throw error
    }
  }
  
  static preloadComponent(importFn: () => Promise<any>): void {
    // Preload the component for faster loading
    importFn().catch(console.error)
  }
}

// Caching utilities
export class CacheManager {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  
  static set(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }
  
  static get(key: string): any | null {
    const item = this.cache.get(key)
    
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  static clear(): void {
    this.cache.clear()
  }
  
  static size(): number {
    return this.cache.size
  }
}

// Bundle analysis
export class BundleAnalyzer {
  static analyzeBundle(): { size: number; chunks: number; modules: number } {
    if (typeof window === 'undefined') {
      return { size: 0, chunks: 0, modules: 0 }
    }
    
    const scripts = document.querySelectorAll('script[src]')
    let totalSize = 0
    let chunkCount = 0
    
    scripts.forEach(script => {
      const src = script.getAttribute('src')
      if (src && src.includes('_next/static/chunks/')) {
        chunkCount++
        // Estimate size (this is approximate)
        totalSize += 50 * 1024 // 50KB per chunk estimate
      }
    })
    
    return {
      size: totalSize,
      chunks: chunkCount,
      modules: scripts.length
    }
  }
}

// Performance recommendations
export class PerformanceRecommendations {
  static getRecommendations(metrics: PerformanceMetrics, webVitals: WebVitals): string[] {
    const recommendations: string[] = []
    
    // Memory usage recommendations
    if (metrics.memoryUsage > 100) {
      recommendations.push('Consider reducing memory usage - current usage is high')
    }
    
    // Bundle size recommendations
    if (metrics.bundleSize > 500) {
      recommendations.push('Bundle size is large - consider code splitting and tree shaking')
    }
    
    // Web Vitals recommendations
    if (webVitals.LCP > 2500) {
      recommendations.push('Largest Contentful Paint is slow - optimize images and critical resources')
    }
    
    if (webVitals.FID > 100) {
      recommendations.push('First Input Delay is high - reduce JavaScript execution time')
    }
    
    if (webVitals.CLS > 0.1) {
      recommendations.push('Cumulative Layout Shift detected - ensure stable layout')
    }
    
    if (webVitals.TTFB > 800) {
      recommendations.push('Time to First Byte is slow - optimize server response time')
    }
    
    // General recommendations
    if (!metrics.imageOptimization) {
      recommendations.push('Enable image optimization for better performance')
    }
    
    if (!metrics.codeSplitting) {
      recommendations.push('Implement code splitting to reduce initial bundle size')
    }
    
    if (!metrics.caching) {
      recommendations.push('Enable caching for static assets')
    }
    
    return recommendations
  }
}

// Initialize performance monitoring
export const performanceMonitor = new PerformanceMonitor()

// Export utilities
export {
  ImageOptimizer,
  CodeSplitter,
  CacheManager,
  BundleAnalyzer,
  PerformanceRecommendations
}