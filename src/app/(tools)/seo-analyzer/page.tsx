'use client'

import { useState } from 'react'
// Metadata removed - client components cannot export metadata
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { copyToClipboard, downloadFile } from '@/lib/utils'
import { SEOData } from '@/types'
import { AlertTriangle, BarChart3, Copy, Download, Globe, Search, Zap } from 'lucide-react'

// Metadata removed - client components cannot export metadata

export default function SEOAnalyzerPage() {
  const [url, setUrl] = useState('')
  const [seoData, setSeoData] = useState<SEOData | null>(null)
  const [loading, setLoading] = useState(false)
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([])
  const { success, error: showError } = useToast()

  const analyzeSEO = async () => {
    if (!url.trim()) {
      showError('Please enter a website URL')
      return
    }

    setLoading(true)
    setSeoData(null)
    setAiRecommendations([])

    try {
      // Mock SEO analysis - in production, you would fetch the actual webpage
      const mockSeoData: SEOData = {
        title: 'Example Website - Your Trusted Partner',
        description:
          'We provide comprehensive solutions for your business needs with expert guidance and support.',
        keywords: [
          'business solutions',
          'expert guidance',
          'comprehensive support',
          'trusted partner',
        ],
        h1: ['Welcome to Our Website', 'About Our Services'],
        h2: ['Our Solutions', 'Why Choose Us', 'Contact Information'],
        h3: ['Service Details', 'Client Testimonials', 'FAQ'],
        images: ['hero-image.jpg', 'service-1.jpg', 'service-2.jpg'],
        links: ['/about', '/services', '/contact', '/blog'],
        wordCount: 1250,
        readingTime: 5,
        score: 78,
        recommendations: [
          'Add more internal links to improve site structure',
          'Optimize images with alt text and proper sizing',
          'Include more long-tail keywords in content',
          'Add schema markup for better search visibility',
        ],
      }

      setSeoData(mockSeoData)

      // Get AI recommendations
      const aiResponse = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'content-optimize',
          input: url,
        }),
      })

      if (aiResponse.ok) {
        const aiData = await aiResponse.json()
        setAiRecommendations([aiData.content])
      }

      success('SEO analysis completed!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze SEO'
      showError('SEO Analysis Failed', errorMessage)
    } finally {
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Poor'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">SEO Analyzer</h1>
          <p className="text-xl text-gray-600">
            Analyze website SEO with AI-powered recommendations
          </p>
        </div>

        {/* Input */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2 text-blue-600" />
              Website Analysis
            </CardTitle>
            <CardDescription>Enter a website URL to analyze its SEO performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="https://example.com"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="flex-1"
                icon={<Globe className="w-5 h-5" />}
              />
              <Button onClick={analyzeSEO} disabled={loading || !url.trim()} className="px-8">
                {loading ? 'Analyzing...' : 'Analyze SEO'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading && (
          <Card className="mb-6">
            <CardContent className="py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p>Analyzing website SEO...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {seoData && (
          <div className="space-y-6">
            {/* SEO Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  SEO Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl font-bold text-gray-900">{seoData.score}%</div>
                    <div>
                      <div className="text-lg font-semibold">
                        {getScoreLabel(seoData.score || 0)}
                      </div>
                      <div className="text-sm text-gray-600">Overall SEO Performance</div>
                    </div>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-full border text-sm font-medium ${getScoreColor(
                      seoData.score || 0
                    )}`}
                  >
                    {getScoreLabel(seoData.score || 0).toUpperCase()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Title Tag</div>
                      <div className="font-medium text-gray-900">
                        {seoData.title || 'Not found'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Meta Description</div>
                      <div className="text-gray-900">{seoData.description || 'Not found'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Word Count</div>
                      <div className="font-medium text-gray-900">
                        {seoData.wordCount || 0} words
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Reading Time</div>
                      <div className="font-medium text-gray-900">
                        {seoData.readingTime || 0} minutes
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Keywords & Headings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Keywords Found</div>
                      <div className="flex flex-wrap gap-1">
                        {seoData.keywords?.map((keyword, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">
                        H1 Tags ({seoData.h1?.length || 0})
                      </div>
                      <div className="text-sm text-gray-900">
                        {seoData.h1?.join(', ') || 'None found'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">
                        H2 Tags ({seoData.h2?.length || 0})
                      </div>
                      <div className="text-sm text-gray-900">
                        {seoData.h2?.join(', ') || 'None found'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Recommendations */}
            {aiRecommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-purple-600" />
                    AI-Powered Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiRecommendations.map((recommendation, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg"
                      >
                        <Zap className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Manual Recommendations */}
            {seoData.recommendations && seoData.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                    SEO Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {seoData.recommendations.map((recommendation, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg"
                      >
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => handleCopy(url, 'Website URL')}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy URL
                  </Button>
                  <Button
                    onClick={() =>
                      downloadFile(
                        `SEO Analysis Report for ${url}\n\nScore: ${seoData.score}%\nTitle: ${
                          seoData.title
                        }\nDescription: ${seoData.description}\nWord Count: ${
                          seoData.wordCount
                        }\nKeywords: ${seoData.keywords?.join(
                          ', '
                        )}\n\nRecommendations:\n${seoData.recommendations?.join('\n')}`,
                        `seo-analysis-${Date.now()}.txt`,
                        'text/plain'
                      )
                    }
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
