'use client'

import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Archive,
  Binary,
  CheckCircle,
  Code,
  Copy,
  Download,
  Eye,
  FileText,
  Image,
  Music,
  RotateCcw,
  Upload,
  Video,
  Zap,
} from 'lucide-react'
import { useRef, useState } from 'react'

interface ConversionResult {
  input: string
  output: string
  inputType: 'text' | 'file'
  outputType: 'text' | 'file'
  fileInfo?: {
    name: string
    size: number
    type: string
    lastModified: number
  }
  stats: {
    inputSize: number
    outputSize: number
    compressionRatio: number
    processingTime: number
  }
}

const Base64ConverterPage = () => {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { copyToClipboard, copied } = useCopyToClipboard()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processConversion = async (input: string, isFile = false, file?: File) => {
    if (!input && !file) {
      setError('Please provide input text or upload a file')
      return
    }

    setProcessing(true)
    setError(null)
    const startTime = performance.now()

    try {
      let output: string
      let inputSize: number
      let fileInfo: ConversionResult['fileInfo']

      if (mode === 'encode') {
        if (file) {
          // File to Base64
          const arrayBuffer = await file.arrayBuffer()
          const bytes = new Uint8Array(arrayBuffer)
          output = btoa(String.fromCharCode(...bytes))
          inputSize = file.size
          fileInfo = {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
          }
        } else {
          // Text to Base64
          output = btoa(unescape(encodeURIComponent(input)))
          inputSize = new Blob([input]).size
        }
      } else {
        // Decode Base64
        try {
          if (isValidBase64(input)) {
            const decoded = atob(input)
            // Try to decode as UTF-8 text
            try {
              output = decodeURIComponent(escape(decoded))
            } catch {
              // If UTF-8 decode fails, it might be binary data
              output = decoded
            }
            inputSize = new Blob([input]).size
          } else {
            throw new Error('Invalid Base64 string')
          }
        } catch (decodeError) {
          throw new Error('Invalid Base64 format or corrupted data')
        }
      }

      const endTime = performance.now()
      const outputSize = new Blob([output]).size
      const compressionRatio = inputSize > 0 ? outputSize / inputSize : 1

      const conversionResult: ConversionResult = {
        input,
        output,
        inputType: file ? 'file' : 'text',
        outputType: 'text',
        fileInfo,
        stats: {
          inputSize,
          outputSize,
          compressionRatio,
          processingTime: Math.round(endTime - startTime),
        },
      }

      setResult(conversionResult)
      setOutputText(output)
    } catch (err: any) {
      setError(`Conversion failed: ${err.message}`)
      setOutputText('')
      setResult(null)
    } finally {
      setProcessing(false)
    }
  }

  const isValidBase64 = (str: string): boolean => {
    try {
      return btoa(atob(str)) === str
    } catch {
      return false
    }
  }

  const handleTextConversion = () => {
    processConversion(inputText)
  }

  const handleFileUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setError('File size must be under 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = e => {
      const content = e.target?.result as string
      if (mode === 'encode') {
        processConversion('', true, file)
      } else {
        setInputText(content)
        processConversion(content)
      }
    }

    if (mode === 'encode') {
      reader.readAsArrayBuffer(file)
    } else {
      reader.readAsText(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const downloadResult = () => {
    if (!result) return

    const blob = new Blob([result.output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${mode}-result-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadAsFile = () => {
    if (!result || mode !== 'decode') return

    try {
      // Try to restore original file if it was a file
      const binaryString = atob(result.input)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      const blob = new Blob([bytes])
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.fileInfo?.name || `decoded-file-${Date.now()}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      setError('Unable to download as binary file. Use text download instead.')
    }
  }

  const clearAll = () => {
    setInputText('')
    setOutputText('')
    setResult(null)
    setError(null)
  }

  const switchMode = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode')
    setInputText(outputText)
    setOutputText('')
    setResult(null)
    setError(null)
  }

  const loadSample = () => {
    if (mode === 'encode') {
      setInputText('Hello, World! This is a sample text for Base64 encoding. 🚀')
    } else {
      setInputText(
        'SGVsbG8sIFdvcmxkISBUaGlzIGlzIGEgc2FtcGxlIHRleHQgZm9yIEJhc2U2NCBlbmNvZGluZy4g8J+agA=='
      )
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image
    if (type.startsWith('audio/')) return Music
    if (type.startsWith('video/')) return Video
    if (type.includes('zip') || type.includes('archive')) return Archive
    return FileText
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <ToolLayout
      title="Base64 Encoder/Decoder"
      description="Encode and decode Base64 strings with file upload support and batch processing"
    >
      <div className="space-y-6">
        {/* Mode Selection */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Binary className="w-5 h-5" />
              Base64 Converter
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Mode:</span>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setMode('encode')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    mode === 'encode'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Encode
                </button>
                <button
                  onClick={() => setMode('decode')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    mode === 'decode'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Decode
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={loadSample} variant="outline" size="sm">
              <Zap className="w-4 h-4 mr-2" />
              Load Sample
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </Button>
            <Button onClick={switchMode} variant="outline" size="sm">
              <Code className="w-4 h-4 mr-2" />
              Switch Mode
            </Button>
            <Button onClick={clearAll} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
          />
        </Card>

        {/* Input Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Eye className="w-5 h-5" />
                {mode === 'encode' ? 'Text/File Input' : 'Base64 Input'}
              </h3>
              <Button
                onClick={handleTextConversion}
                disabled={processing || (!inputText.trim() && mode === 'decode')}
                size="sm"
              >
                {processing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Binary className="w-4 h-4 mr-2" />
                )}
                {processing ? 'Processing...' : mode === 'encode' ? 'Encode' : 'Decode'}
              </Button>
            </div>

            {/* File Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 mb-4 transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Drop files here or{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    click to upload
                  </button>
                </p>
                <p className="text-xs text-gray-500 mt-1">Maximum file size: 10MB</p>
              </div>
            </div>

            <Textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={
                mode === 'encode'
                  ? 'Enter text to encode to Base64...'
                  : 'Paste Base64 string to decode...'
              }
              className="font-mono text-sm min-h-[300px]"
            />

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-red-700">{error}</div>
              </div>
            )}
          </Card>

          {/* Output Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Binary className="w-5 h-5" />
                {mode === 'encode' ? 'Base64 Output' : 'Decoded Output'}
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => copyToClipboard(outputText)}
                  variant="outline"
                  size="sm"
                  disabled={!outputText}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button onClick={downloadResult} variant="outline" size="sm" disabled={!outputText}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>

            <Textarea
              value={outputText}
              readOnly
              className="font-mono text-sm min-h-[300px] bg-gray-50 dark:bg-gray-800"
              placeholder={`${mode === 'encode' ? 'Base64' : 'Decoded'} output will appear here...`}
            />

            {/* Additional Actions for Decode Mode */}
            {mode === 'decode' && outputText && (
              <div className="mt-4 flex gap-2">
                <Button onClick={downloadAsFile} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download as File
                </Button>
                <Button
                  onClick={() => {
                    try {
                      // Try to display as image if it's image data
                      const img = new Image()
                      img.onload = () => {
                        const newWindow = window.open()
                        newWindow?.document.write(
                          `<img src="data:image/png;base64,${result?.input}" />`
                        )
                      }
                      img.src = `data:image/png;base64,${result?.input}`
                    } catch (error) {
                      setError('Cannot preview as image')
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview as Image
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Conversion Stats */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Conversion Results
              </h3>

              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">
                    {formatFileSize(result.stats.inputSize)}
                  </div>
                  <div className="text-sm text-gray-600">Input Size</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-xl font-bold text-green-600">
                    {formatFileSize(result.stats.outputSize)}
                  </div>
                  <div className="text-sm text-gray-600">Output Size</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">
                    {(result.stats.compressionRatio * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Size Ratio</div>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-xl font-bold text-orange-600">
                    {result.stats.processingTime}ms
                  </div>
                  <div className="text-sm text-gray-600">Processing Time</div>
                </div>
              </div>

              {result.fileInfo && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    {(() => {
                      const IconComponent = getFileIcon(result.fileInfo.type)
                      return <IconComponent className="w-5 h-5" />
                    })()}
                    File Information
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <div className="font-medium mt-1">{result.fileInfo.name}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <div className="font-medium mt-1">{result.fileInfo.type || 'Unknown'}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Size:</span>
                      <div className="font-medium mt-1">{formatFileSize(result.fileInfo.size)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Modified:</span>
                      <div className="font-medium mt-1">
                        {new Date(result.fileInfo.lastModified).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Base64 Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">About Base64 Encoding</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">What is Base64?</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  Base64 is a binary-to-text encoding scheme that represents binary data in ASCII
                  string format.
                </p>
                <p>
                  It's commonly used to encode binary data for transmission over text-based
                  protocols like email and HTTP.
                </p>
                <p>Base64 uses 64 characters: A-Z, a-z, 0-9, +, and / (with = for padding).</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Common Use Cases</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Embedding images in HTML/CSS (data URLs)</li>
                <li>• Storing binary data in JSON/XML</li>
                <li>• Email attachments (MIME encoding)</li>
                <li>• API authentication tokens</li>
                <li>• Encoding binary files for web transmission</li>
                <li>• Database storage of binary data</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-yellow-800 mb-1">Important Notes:</div>
                <ul className="text-yellow-700 space-y-1">
                  <li>• Base64 encoding increases data size by approximately 33%</li>
                  <li>• Large files may take time to process in the browser</li>
                  <li>• Decoded binary data may not display correctly as text</li>
                  <li>• Use "Download as File" for binary data to preserve format</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </ToolLayout>
  )
}

export default Base64ConverterPage
