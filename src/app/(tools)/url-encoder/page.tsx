'use client'

import React, { useState } from 'react'
import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { 
  Link, 
  Copy, 
  RefreshCw,
  Download,
  Upload,
  ExternalLink
} from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'URL Encoder/Decoder - Free URL Encoding Tool',
  description: 'Encode and decode URLs safely. Free URL encoder/decoder with support for all URL components and special characters.',
  keywords: ['url encoder', 'url decoder', 'url encoding', 'percent encoding', 'uri encoding'],
  openGraph: {
    title: 'URL Encoder/Decoder - Free URL Encoding Tool',
    description: 'Encode and decode URLs safely. Free URL encoder/decoder with support for all URL components.',
  },
}

export default function URLEncoderPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [component, setComponent] = useState<'full' | 'path' | 'query' | 'fragment'>('full')
  const { success, error: showError } = useToast()

  const encodeURL = (text: string, component: string) => {
    try {
      switch (component) {
        case 'path':
          return encodeURI(text)
        case 'query':
          return encodeURIComponent(text)
        case 'fragment':
          return encodeURI(text)
        case 'full':
        default:
          return encodeURI(text)
      }
    } catch (err) {
      throw new Error('Invalid URL for encoding')
    }
  }

  const decodeURL = (text: string, component: string) => {
    try {
      switch (component) {
        case 'path':
          return decodeURI(text)
        case 'query':
          return decodeURIComponent(text)
        case 'fragment':
          return decodeURI(text)
        case 'full':
        default:
          return decodeURI(text)
      }
    } catch (err) {
      throw new Error('Invalid encoded URL')
    }
  }

  const processURL = () => {
    if (!input.trim()) {
      showError('Please enter a URL to process')
      return
    }

    try {
      let result: string
      
      if (mode === 'encode') {
        result = encodeURL(input, component)
      } else {
        result = decodeURL(input, component)
      }
      
      setOutput(result)
      success(`${mode === 'encode' ? 'Encoded' : 'Decoded'} successfully!`)
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Processing failed')
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

  const swapMode = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode')
    setInput(output)
    setOutput('')
  }

  const loadExample = () => {
    const example = mode === 'encode' 
      ? 'https://example.com/path with spaces?query=value&param=hello world'
      : 'https://example.com/path%20with%20spaces?query=value&param=hello%20world'
    setInput(example)
    success('Example loaded!')
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    success('Cleared all data')
  }

  const downloadResult = () => {
    if (!output) return
    
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `url-${mode === 'encode' ? 'encoded' : 'decoded'}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    success('Result downloaded!')
  }

  // Auto-process when input changes
  React.useEffect(() => {
    if (input.trim()) {
      processURL()
    }
  }, [input, mode, component])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">URL Encoder/Decoder</h1>
          <p className="text-xl text-gray-600">Encode and decode URLs safely with support for all URL components</p>
        </div>

        {/* Mode Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Link className="w-5 h-5 mr-2 text-blue-600" />
              Processing Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operation
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMode('encode')}
                    className={`p-3 text-center border rounded-lg transition-colors ${
                      mode === 'encode'
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Encode URL
                  </button>
                  <button
                    onClick={() => setMode('decode')}
                    className={`p-3 text-center border rounded-lg transition-colors ${
                      mode === 'decode'
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Decode URL
                  </button>
                </div>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Component
                </label>
                <select
                  value={component}
                  onChange={(e) => setComponent(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="full">Full URL</option>
                  <option value="path">Path Only</option>
                  <option value="query">Query String</option>
                  <option value="fragment">Fragment</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <Card>
            <CardHeader>
              <CardTitle>
                {mode === 'encode' ? 'URL to Encode' : 'Encoded URL to Decode'}
              </CardTitle>
              <CardDescription>
                {mode === 'encode' 
                  ? 'Enter the URL you want to encode'
                  : 'Enter the encoded URL you want to decode'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder={mode === 'encode' 
                    ? 'https://example.com/path with spaces?query=value'
                    : 'https://example.com/path%20with%20spaces?query=value'
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
                
                <div className="flex gap-2">
                  <Button onClick={loadExample} variant="outline" className="flex-1">
                    Load Example
                  </Button>
                  <Button onClick={clearAll} variant="outline" className="flex-1">
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Output */}
          <Card>
            <CardHeader>
              <CardTitle>
                {mode === 'encode' ? 'Encoded URL' : 'Decoded URL'}
              </CardTitle>
              <CardDescription>
                {mode === 'encode' 
                  ? 'The encoded URL result'
                  : 'The decoded URL result'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Result will appear here..."
                  value={output}
                  readOnly
                  rows={6}
                  className="font-mono text-sm bg-gray-50"
                />
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleCopy(output, 'Result')}
                    variant="outline"
                    className="flex-1"
                    disabled={!output}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Result
                  </Button>
                  <Button
                    onClick={downloadResult}
                    variant="outline"
                    className="flex-1"
                    disabled={!output}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Swap Button */}
        <div className="text-center mt-6">
          <Button
            onClick={swapMode}
            variant="outline"
            size="lg"
            className="px-8"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Swap Mode
          </Button>
        </div>

        {/* URL Analysis */}
        {output && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ExternalLink className="w-5 h-5 mr-2 text-blue-600" />
                URL Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Original URL</h4>
                  <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm break-all">
                    {input}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Length: {input.length} characters
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    {mode === 'encode' ? 'Encoded URL' : 'Decoded URL'}
                  </h4>
                  <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm break-all">
                    {output}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Length: {output.length} characters
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="text-sm">
                  <div className="font-medium text-blue-900 mb-1">Processing Details:</div>
                  <div className="text-blue-700">
                    • Operation: {mode === 'encode' ? 'URL Encoding' : 'URL Decoding'}
                  </div>
                  <div className="text-blue-700">
                    • Component: {component === 'full' ? 'Full URL' : component.charAt(0).toUpperCase() + component.slice(1)}
                  </div>
                  <div className="text-blue-700">
                    • Size Change: {output.length - input.length > 0 ? '+' : ''}{output.length - input.length} characters
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Link className="w-5 h-5 mr-2 text-blue-600" />
              URL Encoding Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">URL Components</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• <strong>Full URL:</strong> Complete URL encoding</li>
                  <li>• <strong>Path:</strong> Only the path portion</li>
                  <li>• <strong>Query:</strong> Query string parameters</li>
                  <li>• <strong>Fragment:</strong> URL fragment (#section)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Common Characters</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• <strong>Space:</strong> %20</li>
                  <li>• <strong>Ampersand:</strong> %26</li>
                  <li>• <strong>Plus:</strong> %2B</li>
                  <li>• <strong>Hash:</strong> %23</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}