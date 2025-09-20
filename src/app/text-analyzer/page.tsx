'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { 
  BarChart3,
  FileText,
  Brain,
  Hash,
  TrendingUp,
  Download,
  Zap,
  RotateCcw
} from 'lucide-react'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { motion } from 'framer-motion'

interface TextAnalysis {
  words: number
  characters: number
  sentences: number
  paragraphs: number
  readingTime: string
  readabilityScore: number
  sentimentScore: number
  topKeywords: Array<{ word: string; count: number; percentage: number }>
}

const SAMPLE_TEXT = `The Future of Artificial Intelligence in Web Development

Artificial intelligence is revolutionizing web development. From automated code generation to intelligent user experience optimization, AI tools are becoming indispensable for modern developers.

Key Benefits:
- Faster development cycles
- Improved code quality
- Enhanced user experience
- Reduced testing time

The future is bright for AI-powered development tools!`

const TextAnalyzerPage = () => {
  const [text, setText] = useState('')
  const [analysis, setAnalysis] = useState<TextAnalysis | null>(null)
  const [processing, setProcessing] = useState(false)
  
  const { copyToClipboard } = useCopyToClipboard()

  useEffect(() => {
    if (text.trim()) {
      const timeoutId = setTimeout(() => analyzeText(text), 500)
      return () => clearTimeout(timeoutId)
    } else {
      setAnalysis(null)
    }
  }, [text])

  const analyzeText = (inputText: string) => {
    setProcessing(true)
    
    try {
      const words = inputText.trim().split(/\s+/).filter(w => w.length > 0).length
      const characters = inputText.length
      const sentences = inputText.split(/[.!?]+/).filter(s => s.trim().length > 0).length
      const paragraphs = inputText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length
      
      // Reading time (200 WPM average)
      const readingMinutes = Math.ceil(words / 200)
      const readingTime = readingMinutes < 60 
        ? `${readingMinutes} min`
        : `${Math.floor(readingMinutes / 60)}h ${readingMinutes % 60}m`

      // Simple readability score
      const avgWordsPerSentence = sentences > 0 ? words / sentences : 0
      const readabilityScore = Math.max(0, Math.min(100, 100 - avgWordsPerSentence * 2))

      // Simple sentiment analysis
      const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'best', 'perfect', 'awesome']
      const negativeWords = ['bad', 'terrible', 'hate', 'worst', 'horrible', 'awful', 'disgusting']
      
      const textLower = inputText.toLowerCase()
      const positiveCount = positiveWords.reduce((count, word) => 
        count + (textLower.match(new RegExp(word, 'g')) || []).length, 0)
      const negativeCount = negativeWords.reduce((count, word) => 
        count + (textLower.match(new RegExp(word, 'g')) || []).length, 0)
      
      const sentimentScore = positiveCount - negativeCount

      // Keyword analysis
      const wordList = inputText.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3)
        .filter(word => !['this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'more', 'very', 'what', 'know', 'just', 'first', 'into', 'over', 'think', 'also', 'your', 'work', 'life', 'only', 'can', 'still', 'should', 'after', 'being', 'now', 'made', 'before', 'here', 'through', 'when', 'where', 'much', 'some', 'these', 'many', 'then', 'them', 'well', 'were'].includes(word))

      const wordCount: Record<string, number> = {}
      wordList.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1
      })

      const topKeywords = Object.entries(wordCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 15)
        .map(([word, count]) => ({
          word,
          count,
          percentage: (count / wordList.length) * 100
        }))

      setAnalysis({
        words,
        characters,
        sentences,
        paragraphs,
        readingTime,
        readabilityScore: Math.round(readabilityScore),
        sentimentScore,
        topKeywords
      })
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setProcessing(false)
    }
  }

  const loadSample = () => setText(SAMPLE_TEXT)
  const clearAll = () => { setText(''); setAnalysis(null) }

  const exportAnalysis = () => {
    if (!analysis) return
    const data = { text: text.substring(0, 200) + '...', analysis, timestamp: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `text-analysis-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <ToolLayout
      title="Advanced Text Analyzer"
      description="Comprehensive text analysis including readability, sentiment, keyword density, and SEO metrics"
    >
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Text Input
            </h3>
            <div className="flex gap-2">
              <Button onClick={loadSample} variant="outline" size="sm">
                <Zap className="w-4 h-4 mr-2" />
                Load Sample
              </Button>
              <Button onClick={clearAll} variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here for comprehensive analysis..."
            className="min-h-[300px] text-sm"
          />

          {processing && (
            <div className="mt-4 flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 text-sm">Analyzing text...</span>
            </div>
          )}
        </Card>

        {analysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">{analysis.words}</div>
                <div className="text-sm text-gray-600">Words</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">{analysis.readabilityScore}</div>
                <div className="text-sm text-gray-600">Readability</div>
              </Card>
              <Card className="p-4 text-center">
                <div className={`text-2xl font-bold mb-2 ${analysis.sentimentScore > 0 ? 'text-green-600' : analysis.sentimentScore < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {analysis.sentimentScore > 0 ? '+' : ''}{analysis.sentimentScore}
                </div>
                <div className="text-sm text-gray-600">Sentiment</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">{analysis.readingTime}</div>
                <div className="text-sm text-gray-600">Reading Time</div>
              </Card>
            </div>

            <div className="flex justify-center">
              <Button onClick={exportAnalysis} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Analysis
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Basic Metrics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Characters:</span>
                    <span className="font-medium">{analysis.characters.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Words:</span>
                    <span className="font-medium">{analysis.words.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sentences:</span>
                    <span className="font-medium">{analysis.sentences}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paragraphs:</span>
                    <span className="font-medium">{analysis.paragraphs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reading Time:</span>
                    <span className="font-medium">{analysis.readingTime}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  Top Keywords
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {analysis.topKeywords.map((keyword, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="font-mono text-sm">{keyword.word}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">{keyword.count}</div>
                        <div className="text-xs text-gray-600">{keyword.percentage.toFixed(2)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  )
}

export default TextAnalyzerPage