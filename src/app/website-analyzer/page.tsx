'use client'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/ui/Loading'
import { useToast } from '@/components/ui/Toast'
import { TOOLS } from '@/lib/constants'
import { downloadFile, isValidUrl } from '@/lib/utils'
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  Globe,
  Monitor,
  Search,
  Shield,
  Smartphone,
  XCircle,
  Zap,
} from 'lucide-react'
import * as React from 'react'

interface PerformanceMetrics {
  loadTime: number
  domContentLoaded: number
  firstPaint: number
  resourceCount: number
  totalSize: number
  imageCount: number
  scriptCount: number
  stylesheetCount: number
  responseCode: number
  redirects: number
  ssl: boolean
}

interface SEOAnalysis {
  title: string
  titleLength: number
  description: string
  descriptionLength: number
  headings: { [key: string]: number }
  images: number
  imagesWithoutAlt: number
  internalLinks: number
  externalLinks: number
  hasRobotsTxt: boolean
  hasSitemap: boolean
  hasOpenGraph: boolean
  hasTwitterCard: boolean
  hasStructuredData: boolean
}

interface SecurityAnalysis {
  https: boolean
  hsts: boolean
  contentSecurityPolicy: boolean
  xFrameOptions: boolean
  xContentTypeOptions: boolean
  referrerPolicy: boolean
  mixedContent: boolean
  certificateValid: boolean
}

interface AnalysisResult {
  url: string
  performance: PerformanceMetrics
  seo: SEOAnalysis
  security: SecurityAnalysis
  accessibility: {
    score: number
    issues: string[]
  }
  mobile: {
    responsive: boolean
    viewport: boolean
    touchTargets: boolean
  }
  recommendations: string[]
}

export default function WebsiteAnalyzerPage() {
  const [url, setUrl] = React.useState('')
  const [result, setResult] = React.useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const { addToast } = useToast()
  const tool = TOOLS.find(t => t.id === 'website-analyzer')!

  const analyzeWebsite = async () => {
    if (!url.trim()) {
      setError('Please enter a website URL')
      return
    }

    if (!isValidUrl(url)) {
      setError('Please enter a valid URL (including http:// or https://)')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Since we can't actually fetch external websites due to CORS,
      // we'll simulate the analysis with realistic data
      await simulateAnalysis(url)
    } catch (err) {
      setError('Failed to analyze website: ' + (err as Error).message)
      setResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  const simulateAnalysis = async (targetUrl: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Generate realistic mock data
    const mockResult: AnalysisResult = {
      url: targetUrl,
      performance: {
        loadTime: Math.random() * 3000 + 1000, // 1-4 seconds
        domContentLoaded: Math.random() * 2000 + 800,
        firstPaint: Math.random() * 1500 + 500,
        resourceCount: Math.floor(Math.random() * 100) + 20,
        totalSize: Math.random() * 5000000 + 1000000, // 1-6MB
        imageCount: Math.floor(Math.random() * 30) + 5,
        scriptCount: Math.floor(Math.random() * 20) + 3,
        stylesheetCount: Math.floor(Math.random() * 10) + 2,
        responseCode: Math.random() > 0.1 ? 200 : 404,
        redirects: Math.floor(Math.random() * 3),
        ssl: targetUrl.startsWith('https://'),
      },
      seo: {
        title: 'Example Website Title',
        titleLength: Math.floor(Math.random() * 40) + 30,
        description: 'Example meta description for the website',
        descriptionLength: Math.floor(Math.random() * 100) + 120,
        headings: {
          h1: Math.floor(Math.random() * 3) + 1,
          h2: Math.floor(Math.random() * 8) + 2,
          h3: Math.floor(Math.random() * 15) + 3,
        },
        images: Math.floor(Math.random() * 30) + 5,
        imagesWithoutAlt: Math.floor(Math.random() * 10),
        internalLinks: Math.floor(Math.random() * 50) + 10,
        externalLinks: Math.floor(Math.random() * 20) + 3,
        hasRobotsTxt: Math.random() > 0.3,
        hasSitemap: Math.random() > 0.4,
        hasOpenGraph: Math.random() > 0.2,
        hasTwitterCard: Math.random() > 0.5,
        hasStructuredData: Math.random() > 0.6,
      },
      security: {
        https: targetUrl.startsWith('https://'),
        hsts: Math.random() > 0.3,
        contentSecurityPolicy: Math.random() > 0.4,
        xFrameOptions: Math.random() > 0.2,
        xContentTypeOptions: Math.random() > 0.3,
        referrerPolicy: Math.random() > 0.5,
        mixedContent: Math.random() < 0.2,
        certificateValid: targetUrl.startsWith('https://') && Math.random() > 0.1,
      },
      accessibility: {
        score: Math.floor(Math.random() * 40) + 60, // 60-100
        issues: [
          'Some images missing alt text',
          'Low contrast text detected',
          'Form inputs without labels',
        ].filter(() => Math.random() > 0.5),
      },
      mobile: {
        responsive: Math.random() > 0.2,
        viewport: Math.random() > 0.1,
        touchTargets: Math.random() > 0.3,
      },
      recommendations: [],
    }

    // Generate recommendations based on analysis
    if (mockResult.performance.loadTime > 3000) {
      mockResult.recommendations.push(
        'Optimize page load time - consider image compression and minification'
      )
    }
    if (!mockResult.security.https) {
      mockResult.recommendations.push('Enable HTTPS for better security and SEO')
    }
    if (mockResult.seo.titleLength > 60) {
      mockResult.recommendations.push('Shorten page title to under 60 characters for better SEO')
    }
    if (mockResult.seo.imagesWithoutAlt > 0) {
      mockResult.recommendations.push('Add alt text to all images for better accessibility')
    }
    if (!mockResult.mobile.responsive) {
      mockResult.recommendations.push('Make website mobile-responsive for better user experience')
    }

    setResult(mockResult)
    addToast({
      type: 'success',
      title: 'Analysis Complete!',
      description: 'Website analysis completed successfully',
    })
  }

  const getScoreColor = (score: number, reverse = false) => {
    if (reverse) score = 100 - score
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreIcon = (score: number, reverse = false) => {
    if (reverse) score = 100 - score
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (score >= 60) return <AlertCircle className="h-4 w-4 text-yellow-600" />
    return <XCircle className="h-4 w-4 text-red-600" />
  }

  const handleDownload = () => {
    if (!result) return
    const report = JSON.stringify(result, null, 2)
    downloadFile(
      report,
      `website-analysis-${new Date().toISOString().split('T')[0]}.json`,
      'application/json'
    )
  }

  const examples = [
    {
      title: 'Google.com',
      description: "Analyze Google's homepage performance",
      input: 'https://www.google.com',
      action: () => setUrl('https://www.google.com'),
    },
    {
      title: 'GitHub.com',
      description: "Check GitHub's website metrics",
      input: 'https://github.com',
      action: () => setUrl('https://github.com'),
    },
    {
      title: 'Your Website',
      description: 'Enter your own website URL',
      input: 'https://yourwebsite.com',
      action: () => setUrl(''),
    },
  ]

  const tips = [
    'Always test your website on multiple devices and browsers',
    'Aim for a page load time under 3 seconds for better user experience',
    'Optimize images and use modern formats like WebP when possible',
    'Implement HTTPS for better security and SEO rankings',
    'Use structured data to help search engines understand your content',
    'Regular performance monitoring helps catch issues early',
  ]

  return (
    <>
      <Header />
      <main className="flex-1">
        <ToolLayout
          tool={tool}
          result={result ? JSON.stringify(result, null, 2) : null}
          isLoading={isLoading}
          onReset={() => {
            setUrl('')
            setResult(null)
            setError('')
          }}
          onDownload={handleDownload}
          examples={examples}
          tips={tips}
        >
          <div className="space-y-6">
            {/* URL Input */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Website URL</label>
              <div className="flex space-x-2">
                <Input
                  placeholder="https://example.com"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  className="flex-1"
                  error={error}
                  icon={<Globe className="h-4 w-4" />}
                />
                <Button
                  onClick={analyzeWebsite}
                  disabled={isLoading || !url.trim()}
                  loading={isLoading}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Analyze
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <Card>
                <CardContent className="py-12">
                  <Loading text="Analyzing website performance, SEO, and security..." />
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    This may take a few seconds...
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results */}
            {result && (
              <div className="space-y-6">
                {/* Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Analysis Overview
                    </CardTitle>
                    <CardDescription>Analyzed: {result.url}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div
                          className={`text-2xl font-bold ${getScoreColor(
                            result.performance.loadTime,
                            true
                          )}`}
                        >
                          {(result.performance.loadTime / 1000).toFixed(1)}s
                        </div>
                        <div className="text-xs text-muted-foreground">Load Time</div>
                      </div>
                      <div className="text-center">
                        <div
                          className={`text-2xl font-bold ${getScoreColor(
                            result.accessibility.score
                          )}`}
                        >
                          {result.accessibility.score}
                        </div>
                        <div className="text-xs text-muted-foreground">Accessibility</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.floor((result.performance.totalSize / 1024 / 1024) * 10) / 10}MB
                        </div>
                        <div className="text-xs text-muted-foreground">Total Size</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {result.performance.resourceCount}
                        </div>
                        <div className="text-xs text-muted-foreground">Resources</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="h-5 w-5 mr-2" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Load Time</span>
                          <div className="flex items-center space-x-2">
                            {getScoreIcon(result.performance.loadTime, true)}
                            <span
                              className={`font-medium ${getScoreColor(
                                result.performance.loadTime,
                                true
                              )}`}
                            >
                              {(result.performance.loadTime / 1000).toFixed(1)}s
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">DOM Content Loaded</span>
                          <span className="font-medium">
                            {(result.performance.domContentLoaded / 1000).toFixed(1)}s
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">First Paint</span>
                          <span className="font-medium">
                            {(result.performance.firstPaint / 1000).toFixed(1)}s
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">HTTP Status</span>
                          <div className="flex items-center space-x-2">
                            {result.performance.responseCode === 200 ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="font-medium">{result.performance.responseCode}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* SEO Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Search className="h-5 w-5 mr-2" />
                      SEO Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Title Length</span>
                          <div className="flex items-center space-x-2">
                            {getScoreIcon(result.seo.titleLength > 60 ? 30 : 90)}
                            <span
                              className={`font-medium ${getScoreColor(
                                result.seo.titleLength > 60 ? 30 : 90
                              )}`}
                            >
                              {result.seo.titleLength} chars
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Meta Description</span>
                          <div className="flex items-center space-x-2">
                            {getScoreIcon(result.seo.descriptionLength > 160 ? 30 : 90)}
                            <span className="font-medium">
                              {result.seo.descriptionLength} chars
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Images without Alt</span>
                          <div className="flex items-center space-x-2">
                            {getScoreIcon(result.seo.imagesWithoutAlt > 0 ? 30 : 90)}
                            <span className="font-medium">{result.seo.imagesWithoutAlt}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Open Graph</span>
                          <div className="flex items-center space-x-2">
                            {result.seo.hasOpenGraph ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="font-medium">
                              {result.seo.hasOpenGraph ? 'Present' : 'Missing'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Security */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Security Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">HTTPS</span>
                        <div className="flex items-center space-x-2">
                          {result.security.https ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-medium">
                            {result.security.https ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">HSTS</span>
                        <div className="flex items-center space-x-2">
                          {result.security.hsts ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-medium">
                            {result.security.hsts ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">CSP Header</span>
                        <div className="flex items-center space-x-2">
                          {result.security.contentSecurityPolicy ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-medium">
                            {result.security.contentSecurityPolicy ? 'Present' : 'Missing'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">X-Frame-Options</span>
                        <div className="flex items-center space-x-2">
                          {result.security.xFrameOptions ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-medium">
                            {result.security.xFrameOptions ? 'Present' : 'Missing'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Mobile & Accessibility */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Smartphone className="h-5 w-5 mr-2" />
                        Mobile Friendliness
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Responsive Design</span>
                          <div className="flex items-center space-x-2">
                            {result.mobile.responsive ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="font-medium">
                              {result.mobile.responsive ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Viewport Meta Tag</span>
                          <div className="flex items-center space-x-2">
                            {result.mobile.viewport ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="font-medium">
                              {result.mobile.viewport ? 'Present' : 'Missing'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Monitor className="h-5 w-5 mr-2" />
                        Accessibility
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Accessibility Score</span>
                          <div className="flex items-center space-x-2">
                            {getScoreIcon(result.accessibility.score)}
                            <span
                              className={`font-medium ${getScoreColor(result.accessibility.score)}`}
                            >
                              {result.accessibility.score}/100
                            </span>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Issues Found:</span>
                          <ul className="mt-2 space-y-1">
                            {result.accessibility.issues.map((issue, index) => (
                              <li
                                key={index}
                                className="text-muted-foreground flex items-start space-x-2"
                              >
                                <span className="text-red-500 mt-0.5">•</span>
                                <span>{issue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recommendations */}
                {result.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Note about limitations */}
            <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800">
              <CardHeader>
                <CardTitle className="flex items-center text-lg text-yellow-800 dark:text-yellow-200">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Demo Mode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>• This tool currently runs in demo mode with simulated data</p>
                  <p>• In production, this would analyze real websites using external APIs</p>
                  <p>• The analysis covers performance, SEO, security, and accessibility metrics</p>
                  <p>
                    • Real implementation would require server-side processing to bypass CORS
                    limitations
                  </p>
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
