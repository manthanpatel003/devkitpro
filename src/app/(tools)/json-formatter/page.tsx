'use client'

import React, { useState, useEffect } from 'react'
import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { 
  Code, 
  Copy, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Minus,
  Plus,
  FileText,
  Settings
} from 'lucide-react'
import { copyToClipboard, downloadFile } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'JSON Formatter - Free JSON Beautifier and Validator',
  description: 'Format, validate, and beautify JSON data. Free JSON formatter with syntax highlighting, validation, and minification.',
  keywords: ['JSON formatter', 'JSON beautifier', 'JSON validator', 'JSON minifier', 'JSON prettifier', 'JSON tool'],
  openGraph: {
    title: 'JSON Formatter - Free JSON Beautifier and Validator',
    description: 'Format, validate, and beautify JSON data. Free JSON formatter with syntax highlighting and validation.',
  },
}

interface JSONResult {
  formatted: string
  minified: string
  valid: boolean
  error?: string
  size: number
  formattedSize: number
  minifiedSize: number
  compressionRatio: number
}

export default function JSONFormatterPage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<JSONResult | null>(null)
  const [indentSize, setIndentSize] = useState(2)
  const [sortKeys, setSortKeys] = useState(false)
  const [showWhitespace, setShowWhitespace] = useState(false)
  const [activeTab, setActiveTab] = useState<'formatted' | 'minified'>('formatted')
  const { success, error: showError } = useToast()

  const formatJSON = (jsonString: string): JSONResult => {
    try {
      // Parse JSON
      const parsed = JSON.parse(jsonString)
      
      // Sort keys if requested
      const sortedParsed = sortKeys ? sortObjectKeys(parsed) : parsed
      
      // Format with indentation
      const formatted = JSON.stringify(sortedParsed, null, indentSize)
      
      // Minify
      const minified = JSON.stringify(sortedParsed)
      
      // Calculate sizes
      const originalSize = new Blob([jsonString]).size
      const formattedSize = new Blob([formatted]).size
      const minifiedSize = new Blob([minified]).size
      const compressionRatio = Math.round(((originalSize - minifiedSize) / originalSize) * 100)
      
      return {
        formatted,
        minified,
        valid: true,
        size: originalSize,
        formattedSize,
        minifiedSize,
        compressionRatio: Math.max(0, compressionRatio)
      }
    } catch (error) {
      return {
        formatted: '',
        minified: '',
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid JSON',
        size: 0,
        formattedSize: 0,
        minifiedSize: 0,
        compressionRatio: 0
      }
    }
  }

  const sortObjectKeys = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(sortObjectKeys)
    } else if (obj !== null && typeof obj === 'object') {
      const sortedKeys = Object.keys(obj).sort()
      const sortedObj: any = {}
      for (const key of sortedKeys) {
        sortedObj[key] = sortObjectKeys(obj[key])
      }
      return sortedObj
    }
    return obj
  }

  const handleFormat = () => {
    if (!input.trim()) {
      showError('Please enter JSON data to format')
      return
    }

    const result = formatJSON(input)
    setResult(result)
    
    if (result.valid) {
      success('JSON formatted successfully!')
    } else {
      showError('Invalid JSON', result.error)
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

  const handleDownload = (content: string, filename: string) => {
    downloadFile(content, filename, 'application/json')
    success('File downloaded successfully!')
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setInput(content)
        const result = formatJSON(content)
        setResult(result)
        if (result.valid) {
          success('JSON file loaded and formatted!')
        } else {
          showError('Invalid JSON in file', result.error)
        }
      }
      reader.readAsText(file)
    }
  }

  const loadExample = () => {
    const example = {
      "name": "John Doe",
      "age": 30,
      "email": "john@example.com",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001"
      },
      "hobbies": ["reading", "swimming", "coding"],
      "isActive": true,
      "lastLogin": "2024-01-15T10:30:00Z"
    }
    
    const jsonString = JSON.stringify(example)
    setInput(jsonString)
    const result = formatJSON(jsonString)
    setResult(result)
    success('Example JSON loaded!')
  }

  const clearAll = () => {
    setInput('')
    setResult(null)
    success('Cleared all data')
  }

  // Auto-format when input changes (with debounce)
  useEffect(() => {
    if (!input.trim()) {
      setResult(null)
      return
    }

    const timer = setTimeout(() => {
      const result = formatJSON(input)
      setResult(result)
    }, 500)

    return () => clearTimeout(timer)
  }, [input, indentSize, sortKeys])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            JSON Formatter & Validator
          </h1>
          <p className="text-xl text-gray-600">
            Format, validate, and beautify JSON data with syntax highlighting
          </p>
        </div>

        {/* Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2 text-blue-600" />
              Formatting Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Indent Size:</label>
                <div className="flex items-center space-x-1">
                  <Button
                    onClick={() => setIndentSize(Math.max(1, indentSize - 1))}
                    variant="outline"
                    size="sm"
                    disabled={indentSize <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">{indentSize}</span>
                  <Button
                    onClick={() => setIndentSize(Math.min(8, indentSize + 1))}
                    variant="outline"
                    size="sm"
                    disabled={indentSize >= 8}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={sortKeys}
                  onChange={(e) => setSortKeys(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Sort Keys</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showWhitespace}
                  onChange={(e) => setShowWhitespace(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Show Whitespace</span>
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Input JSON
                </span>
                <div className="flex space-x-2">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </span>
                    </Button>
                  </label>
                  <Button onClick={loadExample} variant="outline" size="sm">
                    Example
                  </Button>
                  <Button onClick={clearAll} variant="outline" size="sm">
                    Clear
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste your JSON data here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                rows={20}
              />
              {input && (
                <div className="mt-2 text-sm text-gray-500">
                  {input.length} characters
                </div>
              )}
            </CardContent>
          </Card>

          {/* Output */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Code className="w-5 h-5 mr-2 text-green-600" />
                  Formatted JSON
                </span>
                <div className="flex space-x-2">
                  <div className="flex border rounded-lg">
                    <button
                      onClick={() => setActiveTab('formatted')}
                      className={`px-3 py-1 text-sm font-medium rounded-l-lg transition-colors ${
                        activeTab === 'formatted'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Formatted
                    </button>
                    <button
                      onClick={() => setActiveTab('minified')}
                      className={`px-3 py-1 text-sm font-medium rounded-r-lg transition-colors ${
                        activeTab === 'minified'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Minified
                    </button>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  {/* Validation Status */}
                  <div className="flex items-center space-x-2">
                    {result.valid ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${result.valid ? 'text-green-600' : 'text-red-600'}`}>
                      {result.valid ? 'Valid JSON' : 'Invalid JSON'}
                    </span>
                    {result.error && (
                      <span className="text-sm text-red-600">- {result.error}</span>
                    )}
                  </div>

                  {/* JSON Output */}
                  <div className="relative">
                    <pre className={`bg-gray-50 p-4 rounded-lg overflow-auto max-h-[400px] text-sm font-mono ${
                      showWhitespace ? 'whitespace-pre' : 'whitespace-pre-wrap'
                    }`}>
                      {activeTab === 'formatted' ? result.formatted : result.minified}
                    </pre>
                  </div>

                  {/* Statistics */}
                  {result.valid && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium text-gray-900">{result.size}</div>
                        <div className="text-gray-600">Original</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium text-gray-900">{result.formattedSize}</div>
                        <div className="text-gray-600">Formatted</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium text-gray-900">{result.minifiedSize}</div>
                        <div className="text-gray-600">Minified</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium text-gray-900">{result.compressionRatio}%</div>
                        <div className="text-gray-600">Compression</div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => handleCopy(
                        activeTab === 'formatted' ? result.formatted : result.minified,
                        'JSON'
                      )}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={() => handleDownload(
                        activeTab === 'formatted' ? result.formatted : result.minified,
                        `formatted-${Date.now()}.json`
                      )}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Code className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Enter JSON data to see formatted output</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="w-5 h-5 mr-2 text-blue-600" />
                JSON Formatting Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Syntax highlighting and validation</li>
                <li>• Customizable indentation (1-8 spaces)</li>
                <li>• Key sorting for consistent output</li>
                <li>• Minification for production use</li>
                <li>• File upload and download support</li>
                <li>• Real-time formatting as you type</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                JSON Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Use consistent indentation (2 or 4 spaces)</li>
                <li>• Sort keys alphabetically for consistency</li>
                <li>• Validate JSON before using in production</li>
                <li>• Use minified JSON for API responses</li>
                <li>• Include proper error handling</li>
                <li>• Use meaningful key names</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}