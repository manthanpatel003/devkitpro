'use client'

import React, { useState } from 'react'
import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { 
  Search, 
  Copy, 
  Download, 
  TrendingUp,
  BarChart3,
  Target
} from 'lucide-react'
import { copyToClipboard, downloadFile } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Keyword Research Tool - Free SEO Keyword Finder',
  description: 'Find relevant keywords for your content. Free keyword research tool with search volume and competition analysis.',
  keywords: ['keyword research', 'SEO keywords', 'keyword finder', 'keyword tool', 'SEO research'],
  openGraph: {
    title: 'Keyword Research Tool - Free SEO Keyword Finder',
    description: 'Find relevant keywords for your content. Free keyword research tool with search volume analysis.',
  },
}

interface KeywordData {
  keyword: string
  searchVolume: number
  competition: 'Low' | 'Medium' | 'High'
  difficulty: number
  cpc: number
  trend: 'up' | 'down' | 'stable'
}

export default function KeywordResearchPage() {
  const [query, setQuery] = useState('')
  const [keywords, setKeywords] = useState<KeywordData[]>([])
  const [loading, setLoading] = useState(false)
  const { success, error: showError } = useToast()

  const researchKeywords = async () => {
    if (!query.trim()) {
      showError('Please enter a keyword to research')
      return
    }

    setLoading(true)
    setKeywords([])

    try {
      // Mock keyword data - in production, you would use a real keyword API
      const mockKeywords: KeywordData[] = [
        {
          keyword: query,
          searchVolume: 12000,
          competition: 'High',
          difficulty: 85,
          cpc: 2.50,
          trend: 'up'
        },
        {
          keyword: `${query} guide`,
          searchVolume: 8500,
          competition: 'Medium',
          difficulty: 65,
          cpc: 1.80,
          trend: 'stable'
        },
        {
          keyword: `${query} tips`,
          searchVolume: 6200,
          competition: 'Medium',
          difficulty: 58,
          cpc: 1.20,
          trend: 'up'
        },
        {
          keyword: `best ${query}`,
          searchVolume: 4500,
          competition: 'High',
          difficulty: 78,
          cpc: 2.10,
          trend: 'stable'
        },
        {
          keyword: `${query} tutorial`,
          searchVolume: 3800,
          competition: 'Low',
          difficulty: 45,
          cpc: 0.90,
          trend: 'up'
        },
        {
          keyword: `how to ${query}`,
          searchVolume: 2900,
          competition: 'Medium',
          difficulty: 52,
          cpc: 1.50,
          trend: 'stable'
        },
        {
          keyword: `${query} for beginners`,
          searchVolume: 2100,
          competition: 'Low',
          difficulty: 38,
          cpc: 0.75,
          trend: 'up'
        },
        {
          keyword: `${query} examples`,
          searchVolume: 1800,
          competition: 'Low',
          difficulty: 42,
          cpc: 0.60,
          trend: 'stable'
        }
      ]

      setKeywords(mockKeywords)
      success(`Found ${mockKeywords.length} related keywords!`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to research keywords'
      setError(errorMessage)
      showError('Keyword Research Failed', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      success(`${label} copied to clipboard!`)
    } else {
      showError('Failed to copy to clipboard')
    }
  }

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'Low':
        return 'text-green-600 bg-green-50'
      case 'Medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'High':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return 'text-green-600'
    if (difficulty < 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
      default:
        return <BarChart3 className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Keyword Research Tool</h1>
          <p className="text-xl text-gray-600">Find relevant keywords for your content</p>
        </div>

        {/* Input */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2 text-blue-600" />
              Keyword Research
            </CardTitle>
            <CardDescription>Enter a keyword to find related terms and analyze their potential</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter a keyword to research..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
                icon={<Target className="w-5 h-5" />}
              />
              <Button
                onClick={researchKeywords}
                disabled={loading || !query.trim()}
                className="px-8"
              >
                {loading ? 'Researching...' : 'Research Keywords'}
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
                <p>Researching keywords...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {keywords.length > 0 && (
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Research Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{keywords.length}</div>
                    <div className="text-sm text-blue-600">Keywords Found</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {keywords.reduce((sum, k) => sum + k.searchVolume, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-green-600">Total Search Volume</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {Math.round(keywords.reduce((sum, k) => sum + k.difficulty, 0) / keywords.length)}
                    </div>
                    <div className="text-sm text-yellow-600">Avg Difficulty</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      ${(keywords.reduce((sum, k) => sum + k.cpc, 0) / keywords.length).toFixed(2)}
                    </div>
                    <div className="text-sm text-purple-600">Avg CPC</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Keywords Table */}
            <Card>
              <CardHeader>
                <CardTitle>Keyword Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Keyword</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Search Volume</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Competition</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Difficulty</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">CPC</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Trend</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {keywords.map((keyword, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{keyword.keyword}</td>
                          <td className="py-3 px-4 text-gray-600">{keyword.searchVolume.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCompetitionColor(keyword.competition)}`}>
                              {keyword.competition}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${getDifficultyColor(keyword.difficulty)}`}>
                              {keyword.difficulty}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">${keyword.cpc.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-1">
                              {getTrendIcon(keyword.trend)}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              onClick={() => handleCopy(keyword.keyword, 'Keyword')}
                              variant="outline"
                              size="sm"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                    onClick={() => handleCopy(keywords.map(k => k.keyword).join('\n'), 'Keywords')}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All Keywords
                  </Button>
                  <Button
                    onClick={() => downloadFile(
                      `Keyword Research Report for "${query}"\n\n${keywords.map(k => `${k.keyword} | Volume: ${k.searchVolume} | Competition: ${k.competition} | Difficulty: ${k.difficulty}% | CPC: $${k.cpc}`).join('\n')}`,
                      `keywords-${Date.now()}.txt`,
                      'text/plain'
                    )}
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