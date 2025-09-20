'use client'

import React, { useState } from 'react'
import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { 
  GitCompare, 
  Copy, 
  Download,
  FileText,
  Plus,
  Minus
} from 'lucide-react'
import { copyToClipboard, downloadFile } from '@/lib/utils'
import { DiffResult } from '@/types'

export const metadata: Metadata = {
  title: 'Diff Checker - Free Text Comparison Tool',
  description: 'Compare text and code differences. Free diff checker with side-by-side comparison and highlighting.',
  keywords: ['diff checker', 'text comparison', 'code diff', 'file comparison', 'text diff'],
  openGraph: {
    title: 'Diff Checker - Free Text Comparison Tool',
    description: 'Compare text and code differences. Free diff checker with side-by-side comparison.',
  },
}

export default function DiffCheckerPage() {
  const [text1, setText1] = useState('')
  const [text2, setText2] = useState('')
  const [result, setResult] = useState<DiffResult | null>(null)
  const { success, error: showError } = useToast()

  const calculateDiff = (text1: string, text2: string): DiffResult => {
    const lines1 = text1.split('\n')
    const lines2 = text2.split('\n')
    
    const changes: DiffResult['changes'] = []
    let added = 0
    let removed = 0
    let modified = 0
    let unchanged = 0

    const maxLines = Math.max(lines1.length, lines2.length)
    
    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || ''
      const line2 = lines2[i] || ''
      
      if (i >= lines1.length) {
        // Added lines
        changes.push({
          type: 'added',
          line: i + 1,
          content: line2,
          oldContent: ''
        })
        added++
      } else if (i >= lines2.length) {
        // Removed lines
        changes.push({
          type: 'removed',
          line: i + 1,
          content: line1,
          oldContent: ''
        })
        removed++
      } else if (line1 === line2) {
        // Unchanged lines
        changes.push({
          type: 'unchanged',
          line: i + 1,
          content: line1,
          oldContent: ''
        })
        unchanged++
      } else {
        // Modified lines
        changes.push({
          type: 'modified',
          line: i + 1,
          content: line2,
          oldContent: line1
        })
        modified++
      }
    }

    return {
      added,
      removed,
      modified,
      unchanged,
      changes
    }
  }

  const handleCompare = () => {
    if (!text1.trim() && !text2.trim()) {
      showError('Please enter text to compare')
      return
    }

    const result = calculateDiff(text1, text2)
    setResult(result)
    success('Text comparison completed!')
  }

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      success(`${label} copied to clipboard!`)
    } else {
      showError('Failed to copy to clipboard')
    }
  }

  const loadExample = () => {
    setText1(`function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
}`)
    
    setText2(`function calculateTotal(items) {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
}`)
    
    const result = calculateDiff(text1, text2)
    setResult(result)
    success('Example loaded!')
  }

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'added':
        return <Plus className="w-4 h-4 text-green-500" />
      case 'removed':
        return <Minus className="w-4 h-4 text-red-500" />
      case 'modified':
        return <GitCompare className="w-4 h-4 text-yellow-500" />
      default:
        return <div className="w-4 h-4" />
    }
  }

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 border-green-200'
      case 'removed':
        return 'bg-red-50 border-red-200'
      case 'modified':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Diff Checker</h1>
          <p className="text-xl text-gray-600">Compare text and code differences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Text 1 (Original)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter first text here..."
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
                rows={12}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-green-600" />
                Text 2 (Modified)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter second text here..."
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
                rows={12}
              />
            </CardContent>
          </Card>
        </div>

        <div className="text-center mb-6">
          <Button onClick={handleCompare} disabled={!text1.trim() && !text2.trim()}>
            <GitCompare className="w-4 h-4 mr-2" />
            Compare Texts
          </Button>
          <Button onClick={loadExample} variant="outline" className="ml-2">
            Load Example
          </Button>
        </div>

        {result && (
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Comparison Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{result.added}</div>
                    <div className="text-sm text-green-600">Added</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{result.removed}</div>
                    <div className="text-sm text-red-600">Removed</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{result.modified}</div>
                    <div className="text-sm text-yellow-600">Modified</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">{result.unchanged}</div>
                    <div className="text-sm text-gray-600">Unchanged</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Diff */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Differences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {result.changes.map((change, index) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg ${getChangeColor(change.type)}`}
                    >
                      <div className="flex items-start space-x-3">
                        {getChangeIcon(change.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              Line {change.line}
                            </span>
                            <span className="text-xs text-gray-500 uppercase">
                              {change.type}
                            </span>
                          </div>
                          {change.type === 'modified' && change.oldContent && (
                            <div className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Old:</span> {change.oldContent}
                            </div>
                          )}
                          <div className="text-sm text-gray-900 font-mono">
                            {change.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
                    onClick={() => handleCopy(text1, 'Text 1')}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Text 1
                  </Button>
                  <Button
                    onClick={() => handleCopy(text2, 'Text 2')}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Text 2
                  </Button>
                  <Button
                    onClick={() => downloadFile(
                      `Text 1:\n${text1}\n\nText 2:\n${text2}\n\nDiff Summary:\nAdded: ${result.added}\nRemoved: ${result.removed}\nModified: ${result.modified}\nUnchanged: ${result.unchanged}`,
                      `diff-${Date.now()}.txt`,
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