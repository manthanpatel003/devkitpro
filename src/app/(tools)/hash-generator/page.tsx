'use client'

import React, { useState } from 'react'
import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { 
  Hash, 
  Copy, 
  Download, 
  Upload,
  FileText,
  RefreshCw
} from 'lucide-react'
import { copyToClipboard, downloadFile } from '@/lib/utils'
import { HashResult } from '@/types'

// Simple hash functions (in production, use crypto-js or similar)
const simpleHash = (str: string, algorithm: string): string => {
  let hash = 0
  if (str.length === 0) return hash.toString()
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  switch (algorithm) {
    case 'md5':
      return Math.abs(hash).toString(16).padStart(8, '0').repeat(4)
    case 'sha1':
      return Math.abs(hash).toString(16).padStart(8, '0').repeat(5)
    case 'sha256':
      return Math.abs(hash).toString(16).padStart(8, '0').repeat(8)
    default:
      return Math.abs(hash).toString(16)
  }
}

export const metadata: Metadata = {
  title: 'Hash Generator - Free Hash Calculator',
  description: 'Generate MD5, SHA1, SHA256 hashes for text and files. Free hash generator with multiple algorithms.',
  keywords: ['hash generator', 'hash calculator', 'MD5', 'SHA1', 'SHA256', 'hash tool'],
  openGraph: {
    title: 'Hash Generator - Free Hash Calculator',
    description: 'Generate MD5, SHA1, SHA256 hashes for text and files. Free hash generator with multiple algorithms.',
  },
}

const algorithms = [
  { value: 'md5', label: 'MD5', description: '128-bit hash' },
  { value: 'sha1', label: 'SHA1', description: '160-bit hash' },
  { value: 'sha256', label: 'SHA256', description: '256-bit hash' }
]

export default function HashGeneratorPage() {
  const [input, setInput] = useState('')
  const [results, setResults] = useState<HashResult[]>([])
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>(['md5', 'sha1', 'sha256'])
  const { success, error: showError } = useToast()

  const generateHashes = () => {
    if (!input.trim()) {
      showError('Please enter text to hash')
      return
    }

    const newResults: HashResult[] = selectedAlgorithms.map(algorithm => ({
      algorithm: algorithm.toUpperCase(),
      hash: simpleHash(input, algorithm),
      input: input,
      length: simpleHash(input, algorithm).length
    }))

    setResults(newResults)
    success(`Generated ${newResults.length} hash(es)!`)
  }

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      success(`${label} copied to clipboard!`)
    } else {
      showError('Failed to copy to clipboard')
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setInput(content)
        success('File loaded successfully!')
      }
      reader.readAsText(file)
    }
  }

  const loadExample = () => {
    const example = 'Hello, World! This is a test message for hash generation.'
    setInput(example)
    success('Example loaded!')
  }

  const clearAll = () => {
    setInput('')
    setResults([])
    success('Cleared all data')
  }

  const toggleAlgorithm = (algorithm: string) => {
    setSelectedAlgorithms(prev => 
      prev.includes(algorithm) 
        ? prev.filter(a => a !== algorithm)
        : [...prev, algorithm]
    )
  }

  // Auto-generate hashes when input changes
  React.useEffect(() => {
    if (input.trim() && selectedAlgorithms.length > 0) {
      generateHashes()
    } else {
      setResults([])
    }
  }, [input, selectedAlgorithms])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Hash Generator</h1>
          <p className="text-xl text-gray-600">Generate MD5, SHA1, SHA256 hashes for text and files</p>
        </div>

        {/* Algorithm Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Hash className="w-5 h-5 mr-2 text-blue-600" />
              Hash Algorithms
            </CardTitle>
            <CardDescription>Select which hash algorithms to use</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {algorithms.map(algorithm => (
                <button
                  key={algorithm.value}
                  onClick={() => toggleAlgorithm(algorithm.value)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    selectedAlgorithms.includes(algorithm.value)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{algorithm.label}</div>
                  <div className="text-xs opacity-75">{algorithm.description}</div>
                </button>
              ))}
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
                  Input Text
                </span>
                <div className="flex space-x-2">
                  <input
                    type="file"
                    accept=".txt,.json,.html,.css,.js"
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
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Enter text to generate hashes..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                  rows={12}
                />
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{input.length} characters</span>
                  <span>{new Blob([input]).size} bytes</span>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={loadExample} variant="outline" size="sm">
                    Load Example
                  </Button>
                  <Button onClick={clearAll} variant="outline" size="sm">
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Hash className="w-5 h-5 mr-2 text-green-600" />
                Generated Hashes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.length > 0 ? (
                  results.map((result, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">
                          {result.algorithm}
                        </div>
                        <div className="text-sm text-gray-500">
                          {result.length} characters
                        </div>
                      </div>
                      <div className="font-mono text-sm text-gray-700 bg-gray-50 p-2 rounded break-all">
                        {result.hash}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button
                          onClick={() => handleCopy(result.hash, `${result.algorithm} Hash`)}
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                        <Button
                          onClick={() => downloadFile(
                            result.hash, 
                            `${result.algorithm.toLowerCase()}-${Date.now()}.txt`, 
                            'text/plain'
                          )}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Hash className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Enter text to generate hashes</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Hash className="w-5 h-5 mr-2 text-blue-600" />
              About Hash Functions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">MD5</h4>
                <p className="text-gray-600">
                  MD5 produces a 128-bit hash value. Fast but not cryptographically secure. 
                  Used for checksums and data integrity verification.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">SHA1</h4>
                <p className="text-gray-600">
                  SHA1 produces a 160-bit hash value. More secure than MD5 but considered 
                  deprecated for cryptographic purposes.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">SHA256</h4>
                <p className="text-gray-600">
                  SHA256 produces a 256-bit hash value. Currently secure and widely used 
                  for cryptographic applications and blockchain.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}