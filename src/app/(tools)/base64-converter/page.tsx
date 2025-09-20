'use client'

import React, { useState } from 'react'
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
  FileText,
  RefreshCw
} from 'lucide-react'
import { copyToClipboard, downloadFile } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Base64 Encoder/Decoder - Free Base64 Converter',
  description: 'Encode and decode Base64 strings. Free Base64 converter with file upload support and batch processing.',
  keywords: ['base64 encoder', 'base64 decoder', 'base64 converter', 'base64 tool', 'encode decode'],
  openGraph: {
    title: 'Base64 Encoder/Decoder - Free Base64 Converter',
    description: 'Encode and decode Base64 strings. Free Base64 converter with file upload support.',
  },
}

export default function Base64ConverterPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [inputSize, setInputSize] = useState(0)
  const [outputSize, setOutputSize] = useState(0)
  const { success, error: showError } = useToast()

  const convertBase64 = () => {
    if (!input.trim()) {
      showError('Please enter text to convert')
      return
    }

    try {
      let result: string
      
      if (mode === 'encode') {
        result = btoa(input)
      } else {
        result = atob(input)
      }
      
      setOutput(result)
      setInputSize(new Blob([input]).size)
      setOutputSize(new Blob([result]).size)
      success(`Base64 ${mode} completed successfully!`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid Base64 string'
      setError(errorMessage)
      showError('Conversion Failed', errorMessage)
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        if (mode === 'encode') {
          setInput(content)
        } else {
          setInput(content)
        }
        success('File loaded successfully!')
      }
      reader.readAsText(file)
    }
  }

  const loadExample = () => {
    const example = mode === 'encode' 
      ? 'Hello, World! This is a test message for Base64 encoding.'
      : 'SGVsbG8sIFdvcmxkISBUaGlzIGlzIGEgdGVzdCBtZXNzYWdlIGZvciBCYXNlNjQgZW5jb2Rpbmcu'
    
    setInput(example)
    success('Example loaded!')
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setInputSize(0)
    setOutputSize(0)
    success('Cleared all data')
  }

  // Auto-convert when input changes
  React.useEffect(() => {
    if (input.trim()) {
      convertBase64()
    } else {
      setOutput('')
      setInputSize(0)
      setOutputSize(0)
    }
  }, [input, mode])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Base64 Encoder/Decoder</h1>
          <p className="text-xl text-gray-600">Encode and decode Base64 strings with file support</p>
        </div>

        {/* Mode Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Code className="w-5 h-5 mr-2 text-blue-600" />
              Conversion Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={() => setMode('encode')}
                variant={mode === 'encode' ? 'default' : 'outline'}
                className="flex-1"
              >
                Encode to Base64
              </Button>
              <Button
                onClick={() => setMode('decode')}
                variant={mode === 'decode' ? 'default' : 'outline'}
                className="flex-1"
              >
                Decode from Base64
              </Button>
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
                  {mode === 'encode' ? 'Original Text' : 'Base64 String'}
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
                  placeholder={mode === 'encode' 
                    ? 'Enter text to encode to Base64...' 
                    : 'Enter Base64 string to decode...'
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                  rows={12}
                />
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{input.length} characters</span>
                  <span>{inputSize} bytes</span>
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

          {/* Output */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="w-5 h-5 mr-2 text-green-600" />
                {mode === 'encode' ? 'Base64 Encoded' : 'Decoded Text'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder={mode === 'encode' 
                    ? 'Base64 encoded text will appear here...' 
                    : 'Decoded text will appear here...'
                  }
                  value={output}
                  readOnly
                  className="min-h-[300px] font-mono text-sm"
                  rows={12}
                />
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{output.length} characters</span>
                  <span>{outputSize} bytes</span>
                </div>
                
                {output && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleCopy(output, 'Result')}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={() => downloadFile(
                        output, 
                        `base64-${mode}-${Date.now()}.txt`, 
                        'text/plain'
                      )}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
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
              <Code className="w-5 h-5 mr-2 text-blue-600" />
              About Base64
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">What is Base64?</h4>
                <p className="text-gray-600">
                  Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format. 
                  It's commonly used for encoding data in URLs, email attachments, and data storage.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Common Uses</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Email attachments</li>
                  <li>• Data URLs in web pages</li>
                  <li>• API authentication</li>
                  <li>• Storing binary data in JSON</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}