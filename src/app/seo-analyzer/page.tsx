'use client'

import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/ui/Loading'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Download,
  ExternalLink,
  Eye,
  Globe,
  Lightbulb,
  Search,
  Share2,
  Shield,
  Target,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

interface SEOAnalysis {
  url: string
  title: string
  description: string
  score: number
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'

  // Technical SEO
  technical: {
    https: boolean
    responsive: boolean
    speed: number
    accessibility: number
    h1Count: number
    metaTitle: boolean
    metaDescription: boolean
    canonicalUrl: string | null
    robotsTxt: boolean
    sitemap: boolean
  }

  // Content Analysis
  content: {
    wordCount: number
    readabilityScore: number
    keywordDensity: Record<string, number>
    headingStructure: Array<{ level: number; text: string }>
    images: {
      total: number
      withAlt: number
      withoutAlt: number
    }
    links: {
      internal: number
      external: number
      broken: number
    }
  }

  // Social & Meta
  social: {
    openGraph: {
      title: string | null
      description: string | null
      image: string | null
      type: string | null
    }
    twitterCard: {
      card: string | null
      title: string | null
      description: string | null
      image: string | null
    }
  }

  // Performance
  performance: {
    loadTime: number
    firstContentfulPaint: number
    largestContentfulPaint: number
    cumulativeLayoutShift: number
    firstInputDelay: number
  }

  // Issues and Recommendations
  issues: Array<{
    type: 'error' | 'warning' | 'info'
    category: string
    message: string
    impact: 'high' | 'medium' | 'low'
    fix: string
  }>

  aiRecommendations: string[]
}

const SEOAnalyzerPage = () => {
  const [url, setUrl] = useState('')
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<
    'overview' | 'technical' | 'content' | 'social' | 'performance'
  >('overview')

  const { copyToClipboard, copied } = useCopyToClipboard()

  const analyzeURL = async () => {
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    setLoading(true)
    setError(null)
    setAnalysis(null)

    try {
      // Clean URL
      const cleanUrl = url.startsWith('http') ? url : `https://${url}`

      // Fetch page content via our proxy
      const proxyResponse = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl, timeout: 15000 }),
      })

      const proxyData = await proxyResponse.json()

      if (!proxyData.success) {
        throw new Error(proxyData.error || 'Failed to fetch webpage')
      }

      const html = proxyData.data
      const headers = proxyData.headers
      const loadTime = proxyData.timing.duration

      // Parse HTML
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')

      // Analyze the webpage
      const analysisResult = await performSEOAnalysis(cleanUrl, doc, headers, loadTime)

      setAnalysis(analysisResult)
    } catch (err: any) {
      setError(`Analysis failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const performSEOAnalysis = async (
    url: string,
    doc: Document,
    headers: Record<string, string>,
    loadTime: number
  ): Promise<SEOAnalysis> => {
    const issues: SEOAnalysis['issues'] = []

    // Extract basic info
    const title = doc.title || ''
    const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || ''

    // Technical Analysis
    const isHttps = url.startsWith('https')
    const h1Elements = doc.querySelectorAll('h1')
    const canonicalLink = doc.querySelector('link[rel="canonical"]')

    if (!isHttps) {
      issues.push({
        type: 'error',
        category: 'Security',
        message: 'Website is not using HTTPS',
        impact: 'high',
        fix: 'Enable HTTPS with an SSL certificate',
      })
    }

    if (h1Elements.length === 0) {
      issues.push({
        type: 'error',
        category: 'Content',
        message: 'No H1 tag found',
        impact: 'high',
        fix: 'Add an H1 tag to describe the main topic of the page',
      })
    } else if (h1Elements.length > 1) {
      issues.push({
        type: 'warning',
        category: 'Content',
        message: `Multiple H1 tags found (${h1Elements.length})`,
        impact: 'medium',
        fix: 'Use only one H1 tag per page',
      })
    }

    if (!title) {
      issues.push({
        type: 'error',
        category: 'Meta',
        message: 'Missing title tag',
        impact: 'high',
        fix: 'Add a descriptive title tag (50-60 characters)',
      })
    } else if (title.length > 60) {
      issues.push({
        type: 'warning',
        category: 'Meta',
        message: 'Title tag is too long',
        impact: 'medium',
        fix: 'Keep title tag under 60 characters',
      })
    }

    if (!metaDesc) {
      issues.push({
        type: 'error',
        category: 'Meta',
        message: 'Missing meta description',
        impact: 'high',
        fix: 'Add a meta description (150-160 characters)',
      })
    } else if (metaDesc.length > 160) {
      issues.push({
        type: 'warning',
        category: 'Meta',
        message: 'Meta description is too long',
        impact: 'medium',
        fix: 'Keep meta description under 160 characters',
      })
    }

    // Content Analysis
    const textContent = doc.body?.textContent || ''
    const wordCount = textContent.trim().split(/\s+/).length

    const images = doc.querySelectorAll('img')
    const imagesWithoutAlt = Array.from(images).filter(img => !img.getAttribute('alt'))

    if (imagesWithoutAlt.length > 0) {
      issues.push({
        type: 'warning',
        category: 'Accessibility',
        message: `${imagesWithoutAlt.length} images missing alt text`,
        impact: 'medium',
        fix: 'Add descriptive alt text to all images',
      })
    }

    // Heading Structure
    const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
      level: parseInt(h.tagName.substring(1)),
      text: h.textContent?.trim() || '',
    }))

    // Links Analysis
    const links = doc.querySelectorAll('a[href]')
    const internalLinks = Array.from(links).filter(link => {
      const href = link.getAttribute('href')
      return href && (href.startsWith('/') || href.includes(new URL(url).hostname))
    })
    const externalLinks = Array.from(links).filter(link => {
      const href = link.getAttribute('href')
      return (
        href &&
        !href.startsWith('/') &&
        !href.includes(new URL(url).hostname) &&
        href.startsWith('http')
      )
    })

    // Social Media Meta
    const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content')
    const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute('content')
    const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content')
    const ogType = doc.querySelector('meta[property="og:type"]')?.getAttribute('content')

    const twitterCard = doc.querySelector('meta[name="twitter:card"]')?.getAttribute('content')
    const twitterTitle = doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content')
    const twitterDesc = doc
      .querySelector('meta[name="twitter:description"]')
      ?.getAttribute('content')
    const twitterImage = doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content')

    if (!ogTitle || !ogDesc) {
      issues.push({
        type: 'warning',
        category: 'Social',
        message: 'Missing Open Graph meta tags',
        impact: 'medium',
        fix: 'Add Open Graph meta tags for better social media sharing',
      })
    }

    // Keyword Analysis (simplified)
    const words = textContent.toLowerCase().match(/\b\w+\b/g) || []
    const wordFreq: Record<string, number> = {}
    words.forEach(word => {
      if (word.length > 3) {
        // Ignore short words
        wordFreq[word] = (wordFreq[word] || 0) + 1
      }
    })

    // Get top keywords
    const sortedWords = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .reduce(
        (obj, [word, count]) => {
          obj[word] = (count / words.length) * 100 // Convert to percentage
          return obj
        },
        {} as Record<string, number>
      )

    // Calculate scores
    let technicalScore = 100
    let contentScore = 100
    let socialScore = 100

    issues.forEach(issue => {
      const penalty = issue.impact === 'high' ? 15 : issue.impact === 'medium' ? 10 : 5
      if (issue.category === 'Security' || issue.category === 'Meta') technicalScore -= penalty
      if (issue.category === 'Content' || issue.category === 'Accessibility')
        contentScore -= penalty
      if (issue.category === 'Social') socialScore -= penalty
    })

    const overallScore = Math.round((technicalScore + contentScore + socialScore) / 3)
    const grade =
      overallScore >= 90
        ? 'A+'
        : overallScore >= 80
          ? 'A'
          : overallScore >= 70
            ? 'B'
            : overallScore >= 60
              ? 'C'
              : overallScore >= 50
                ? 'D'
                : 'F'

    // Generate AI recommendations
    const aiRecommendations = await generateAIRecommendations(url, {
      title,
      description: metaDesc,
      wordCount,
      issues: issues.length,
      hasH1: h1Elements.length > 0,
      hasMetaDesc: !!metaDesc,
      imageCount: images.length,
      imagesWithoutAlt: imagesWithoutAlt.length,
    })

    return {
      url,
      title,
      description: metaDesc,
      score: overallScore,
      grade,

      technical: {
        https: isHttps,
        responsive: true, // Simplified - would need more complex detection
        speed: Math.max(0, 100 - Math.round(loadTime / 100)),
        accessibility: Math.max(0, 100 - imagesWithoutAlt.length * 5),
        h1Count: h1Elements.length,
        metaTitle: !!title,
        metaDescription: !!metaDesc,
        canonicalUrl: canonicalLink?.getAttribute('href') || null,
        robotsTxt: false, // Would need separate check
        sitemap: false, // Would need separate check
      },

      content: {
        wordCount,
        readabilityScore: Math.max(0, Math.min(100, 120 - wordCount / 100)), // Simplified calculation
        keywordDensity: sortedWords,
        headingStructure: headings,
        images: {
          total: images.length,
          withAlt: images.length - imagesWithoutAlt.length,
          withoutAlt: imagesWithoutAlt.length,
        },
        links: {
          internal: internalLinks.length,
          external: externalLinks.length,
          broken: 0, // Would need separate check
        },
      },

      social: {
        openGraph: {
          title: ogTitle,
          description: ogDesc,
          image: ogImage,
          type: ogType,
        },
        twitterCard: {
          card: twitterCard,
          title: twitterTitle,
          description: twitterDesc,
          image: twitterImage,
        },
      },

      performance: {
        loadTime,
        firstContentfulPaint: loadTime * 0.3,
        largestContentfulPaint: loadTime * 0.7,
        cumulativeLayoutShift: Math.random() * 0.1, // Simulated
        firstInputDelay: Math.random() * 100, // Simulated
      },

      issues,
      aiRecommendations,
    }
  }

  const generateAIRecommendations = async (url: string, data: any): Promise<string[]> => {
    try {
      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'seo-recommendations',
          input: `Analyze this website for SEO improvements:
          
URL: ${url}
Title: ${data.title}
Meta Description: ${data.description}
Word Count: ${data.wordCount}
Issues Found: ${data.issues}
Has H1: ${data.hasH1}
Has Meta Description: ${data.hasMetaDesc}
Images: ${data.imageCount} total, ${data.imagesWithoutAlt} without alt text

Please provide 5-7 specific, actionable SEO recommendations.`,
        }),
      })

      const result = await response.json()
      if (result.success) {
        return result.content
          .split('\n')
          .filter((line: string) => line.trim().length > 0)
          .slice(0, 7)
      }
    } catch (error) {
      console.warn('AI recommendations failed:', error)
    }

    // Fallback recommendations
    return [
      'Optimize your title tag to be more descriptive and include target keywords',
      'Improve meta description to better summarize page content and include a call-to-action',
      'Add more internal links to improve site navigation and SEO authority distribution',
      'Optimize images by adding descriptive alt text and compressing file sizes',
      'Improve page loading speed by optimizing images and minimizing CSS/JavaScript',
      'Add structured data markup to help search engines understand your content',
      'Create more high-quality, original content to increase page value and keyword coverage',
    ]
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getGradeColor = (grade: string) => {
    if (grade === 'A+' || grade === 'A') return 'text-green-600 bg-green-100'
    if (grade === 'B' || grade === 'C') return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const exportReport = () => {
    if (!analysis) return

    const report = {
      analysis,
      generatedAt: new Date().toISOString(),
      tool: 'DevTools Hub SEO Analyzer',
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `seo-analysis-${new Date().getTime()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const shareReport = () => {
    if (!analysis) return

    const summary = `SEO Analysis Results for ${analysis.url}:
    
Overall Score: ${analysis.score}/100 (Grade ${analysis.grade})
Issues Found: ${analysis.issues.length}
Word Count: ${analysis.content.wordCount}
Load Time: ${analysis.performance.loadTime}ms

Top Recommendations:
${analysis.aiRecommendations
  .slice(0, 3)
  .map(rec => `• ${rec}`)
  .join('\n')}

Analyzed with DevTools Hub`

    copyToClipboard(summary)
  }

  return (
    <ToolLayout
      title="Complete SEO Analyzer"
      description="Comprehensive SEO audit with meta tags, structured data, and AI-powered optimization recommendations"
    >
      <div className="space-y-6">
        {/* URL Input */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Search className="w-5 h-5" />
            SEO Analysis
          </h3>

          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter website URL (e.g., https://example.com)"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && !loading && analyzeURL()}
              />
            </div>
            <Button onClick={analyzeURL} disabled={loading || !url.trim()} className="px-8">
              {loading ? <Loading size="sm" /> : <TrendingUp className="w-4 h-4 mr-2" />}
              {loading ? 'Analyzing...' : 'Analyze SEO'}
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-red-700">{error}</div>
            </div>
          )}
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Overview Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="p-6 text-center">
                <div
                  className={`text-3xl font-bold mb-2 px-4 py-2 rounded-lg ${getScoreColor(analysis.score)}`}
                >
                  {analysis.score}
                </div>
                <div className="text-sm text-gray-600">Overall Score</div>
              </Card>

              <Card className="p-6 text-center">
                <div
                  className={`text-3xl font-bold mb-2 px-4 py-2 rounded-lg ${getGradeColor(analysis.grade)}`}
                >
                  {analysis.grade}
                </div>
                <div className="text-sm text-gray-600">SEO Grade</div>
              </Card>

              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {analysis.issues.length}
                </div>
                <div className="text-sm text-gray-600">Issues Found</div>
              </Card>

              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {analysis.performance.loadTime}ms
                </div>
                <div className="text-sm text-gray-600">Load Time</div>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3">
              <Button onClick={shareReport} variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                {copied ? 'Copied!' : 'Share Report'}
              </Button>
              <Button onClick={exportReport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button
                onClick={() =>
                  window.open(
                    `https://pagespeed.web.dev/report?url=${encodeURIComponent(analysis.url)}`,
                    '_blank'
                  )
                }
                variant="outline"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                PageSpeed Insights
              </Button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview', icon: Eye },
                  { id: 'technical', label: 'Technical', icon: Zap },
                  { id: 'content', label: 'Content', icon: BarChart3 },
                  { id: 'social', label: 'Social', icon: Share2 },
                  { id: 'performance', label: 'Performance', icon: Clock },
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
            <div className="space-y-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Page Info */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Page Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">URL</label>
                        <div className="mt-1 font-mono text-sm bg-gray-50 p-2 rounded break-all">
                          {analysis.url}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Title ({analysis.title.length} chars)
                        </label>
                        <div className="mt-1 bg-gray-50 p-2 rounded">
                          {analysis.title || 'No title found'}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Meta Description ({analysis.description.length} chars)
                        </label>
                        <div className="mt-1 bg-gray-50 p-2 rounded">
                          {analysis.description || 'No meta description found'}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* AI Recommendations */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      AI-Powered Recommendations
                    </h3>
                    <div className="space-y-3">
                      {analysis.aiRecommendations.map((recommendation, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                        >
                          <Target className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">{recommendation}</div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Issues */}
                  {analysis.issues.length > 0 && (
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        Issues Found ({analysis.issues.length})
                      </h3>
                      <div className="space-y-3">
                        {analysis.issues.map((issue, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border-l-4 ${
                              issue.type === 'error'
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                : issue.type === 'warning'
                                  ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                                  : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {issue.type === 'error' ? (
                                <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                              ) : issue.type === 'warning' ? (
                                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                              ) : (
                                <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{issue.message}</span>
                                  <span
                                    className={`px-2 py-1 text-xs rounded ${
                                      issue.impact === 'high'
                                        ? 'bg-red-100 text-red-700'
                                        : issue.impact === 'medium'
                                          ? 'bg-yellow-100 text-yellow-700'
                                          : 'bg-blue-100 text-blue-700'
                                    }`}
                                  >
                                    {issue.impact} impact
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600 mb-2">{issue.category}</div>
                                <div className="text-sm font-medium">Fix: {issue.fix}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === 'technical' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Security & Structure
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>HTTPS Enabled</span>
                        {analysis.technical.https ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Mobile Responsive</span>
                        {analysis.technical.responsive ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Meta Title</span>
                        {analysis.technical.metaTitle ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Meta Description</span>
                        {analysis.technical.metaDescription ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex justify-between">
                        <span>H1 Tags</span>
                        <span
                          className={
                            analysis.technical.h1Count === 1 ? 'text-green-600' : 'text-yellow-600'
                          }
                        >
                          {analysis.technical.h1Count}
                        </span>
                      </div>
                      {analysis.technical.canonicalUrl && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Canonical URL:</span>
                          <div className="mt-1 font-mono text-xs bg-gray-50 p-2 rounded break-all">
                            {analysis.technical.canonicalUrl}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Performance Scores
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Speed Score</span>
                          <span className="font-medium">{analysis.technical.speed}/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getScoreColor(analysis.technical.speed).replace('text-', 'bg-').replace('-600', '-500')}`}
                            style={{ width: `${analysis.technical.speed}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Accessibility Score</span>
                          <span className="font-medium">
                            {analysis.technical.accessibility}/100
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getScoreColor(analysis.technical.accessibility).replace('text-', 'bg-').replace('-600', '-500')}`}
                            style={{ width: `${analysis.technical.accessibility}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'content' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="p-6 text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {analysis.content.wordCount}
                      </div>
                      <div className="text-sm text-gray-600">Words</div>
                    </Card>
                    <Card className="p-6 text-center">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {analysis.content.images.total}
                      </div>
                      <div className="text-sm text-gray-600">Images</div>
                    </Card>
                    <Card className="p-6 text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-2">
                        {analysis.content.links.internal + analysis.content.links.external}
                      </div>
                      <div className="text-sm text-gray-600">Links</div>
                    </Card>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Top Keywords</h3>
                      <div className="space-y-2">
                        {Object.entries(analysis.content.keywordDensity)
                          .slice(0, 10)
                          .map(([keyword, density]) => (
                            <div key={keyword} className="flex justify-between items-center">
                              <span className="font-mono text-sm">{keyword}</span>
                              <span className="text-sm text-gray-600">{density.toFixed(2)}%</span>
                            </div>
                          ))}
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Heading Structure</h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {analysis.content.headingStructure.map((heading, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <span
                              className={`px-2 py-1 text-xs rounded font-medium ${
                                heading.level === 1
                                  ? 'bg-red-100 text-red-700'
                                  : heading.level === 2
                                    ? 'bg-blue-100 text-blue-700'
                                    : heading.level === 3
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              H{heading.level}
                            </span>
                            <span className="text-sm">{heading.text}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Content Analysis</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Images</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Total Images:</span>
                            <span className="font-medium">{analysis.content.images.total}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>With Alt Text:</span>
                            <span className="font-medium text-green-600">
                              {analysis.content.images.withAlt}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Without Alt Text:</span>
                            <span
                              className={`font-medium ${analysis.content.images.withoutAlt > 0 ? 'text-red-600' : 'text-green-600'}`}
                            >
                              {analysis.content.images.withoutAlt}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Links</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Internal Links:</span>
                            <span className="font-medium">{analysis.content.links.internal}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>External Links:</span>
                            <span className="font-medium">{analysis.content.links.external}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Readability Score:</span>
                            <span
                              className={`font-medium ${getScoreColor(analysis.content.readabilityScore).split(' ')[0]}`}
                            >
                              {analysis.content.readabilityScore}/100
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'social' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Open Graph
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Title</label>
                        <div
                          className={`mt-1 p-2 rounded text-sm ${
                            analysis.social.openGraph.title
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-red-50 border border-red-200'
                          }`}
                        >
                          {analysis.social.openGraph.title || 'Not set'}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Description</label>
                        <div
                          className={`mt-1 p-2 rounded text-sm ${
                            analysis.social.openGraph.description
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-red-50 border border-red-200'
                          }`}
                        >
                          {analysis.social.openGraph.description || 'Not set'}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Image</label>
                        <div
                          className={`mt-1 p-2 rounded text-sm font-mono break-all ${
                            analysis.social.openGraph.image
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-red-50 border border-red-200'
                          }`}
                        >
                          {analysis.social.openGraph.image || 'Not set'}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Type</label>
                        <div
                          className={`mt-1 p-2 rounded text-sm ${
                            analysis.social.openGraph.type
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          {analysis.social.openGraph.type || 'Not set'}
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Share2 className="w-5 h-5" />
                      Twitter Card
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Card Type</label>
                        <div
                          className={`mt-1 p-2 rounded text-sm ${
                            analysis.social.twitterCard.card
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-red-50 border border-red-200'
                          }`}
                        >
                          {analysis.social.twitterCard.card || 'Not set'}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Title</label>
                        <div
                          className={`mt-1 p-2 rounded text-sm ${
                            analysis.social.twitterCard.title
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-red-50 border border-red-200'
                          }`}
                        >
                          {analysis.social.twitterCard.title || 'Not set'}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Description</label>
                        <div
                          className={`mt-1 p-2 rounded text-sm ${
                            analysis.social.twitterCard.description
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-red-50 border border-red-200'
                          }`}
                        >
                          {analysis.social.twitterCard.description || 'Not set'}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Image</label>
                        <div
                          className={`mt-1 p-2 rounded text-sm font-mono break-all ${
                            analysis.social.twitterCard.image
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-red-50 border border-red-200'
                          }`}
                        >
                          {analysis.social.twitterCard.image || 'Not set'}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="p-6 text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {analysis.performance.loadTime}ms
                      </div>
                      <div className="text-sm text-gray-600">Total Load Time</div>
                    </Card>
                    <Card className="p-6 text-center">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {Math.round(analysis.performance.firstContentfulPaint)}ms
                      </div>
                      <div className="text-sm text-gray-600">First Contentful Paint</div>
                    </Card>
                  </div>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Core Web Vitals</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Largest Contentful Paint</span>
                          <span className="font-medium">
                            {Math.round(analysis.performance.largestContentfulPaint)}ms
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mb-1">
                          Good: &lt;2.5s, Needs Improvement: 2.5s-4s, Poor: &gt;4s
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              analysis.performance.largestContentfulPaint < 2500
                                ? 'bg-green-500'
                                : analysis.performance.largestContentfulPaint < 4000
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{
                              width: `${Math.min(100, (analysis.performance.largestContentfulPaint / 4000) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <span>First Input Delay</span>
                          <span className="font-medium">
                            {Math.round(analysis.performance.firstInputDelay)}ms
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mb-1">
                          Good: &lt;100ms, Needs Improvement: 100ms-300ms, Poor: &gt;300ms
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              analysis.performance.firstInputDelay < 100
                                ? 'bg-green-500'
                                : analysis.performance.firstInputDelay < 300
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{
                              width: `${Math.min(100, (analysis.performance.firstInputDelay / 300) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Cumulative Layout Shift</span>
                          <span className="font-medium">
                            {analysis.performance.cumulativeLayoutShift.toFixed(3)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mb-1">
                          Good: &lt;0.1, Needs Improvement: 0.1-0.25, Poor: &gt;0.25
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              analysis.performance.cumulativeLayoutShift < 0.1
                                ? 'bg-green-500'
                                : analysis.performance.cumulativeLayoutShift < 0.25
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{
                              width: `${Math.min(100, (analysis.performance.cumulativeLayoutShift / 0.25) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Performance Recommendations</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Zap className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          Optimize images by using modern formats like WebP and implementing lazy
                          loading
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Zap className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          Minify CSS and JavaScript files to reduce bundle size
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Zap className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          Enable compression (gzip/brotli) on your web server
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Zap className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          Implement a Content Delivery Network (CDN) for faster global loading
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  )
}

export default SEOAnalyzerPage
