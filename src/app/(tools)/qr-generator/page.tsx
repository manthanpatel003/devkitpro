'use client'

import { useEffect, useState } from 'react'
// Metadata removed - client components cannot export metadata
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { copyToClipboard } from '@/lib/utils'
import { QRCodeOptions } from '@/types'
import { Copy, Download, Palette, QrCode, RefreshCw, Settings } from 'lucide-react'

// Metadata removed - client components cannot export metadata

export default function QRGeneratorPage() {
  const [text, setText] = useState('')
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')
  const [options, setOptions] = useState<QRCodeOptions>({
    text: '',
    size: 256,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  })
  const { success, error: showError } = useToast()

  // Mock QR code generation (in production, use a real QR library)
  const generateQRCode = (text: string, options: QRCodeOptions): string => {
    // This is a mock implementation
    // In production, you would use a library like qrcode.js
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    canvas.width = options.size || 256
    canvas.height = options.size || 256

    // Create a simple mock QR code pattern
    const size = options.size || 256
    const cellSize = size / 25
    const color = options.color || { light: '#ffffff', dark: '#000000' }
    ctx.fillStyle = color.light
    ctx.fillRect(0, 0, size, size)

    ctx.fillStyle = color.dark
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        if ((i + j) % 3 === 0 || (i * j) % 7 === 0) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize)
        }
      }
    }

    // Add corner markers
    const markerSize = cellSize * 7
    ctx.fillStyle = color.dark
    ctx.fillRect(0, 0, markerSize, markerSize)
    ctx.fillRect(size - markerSize, 0, markerSize, markerSize)
    ctx.fillRect(0, size - markerSize, markerSize, markerSize)

    ctx.fillStyle = color.light
    ctx.fillRect(cellSize, cellSize, markerSize - 2 * cellSize, markerSize - 2 * cellSize)
    ctx.fillRect(
      size - markerSize + cellSize,
      cellSize,
      markerSize - 2 * cellSize,
      markerSize - 2 * cellSize
    )
    ctx.fillRect(
      cellSize,
      size - markerSize + cellSize,
      markerSize - 2 * cellSize,
      markerSize - 2 * cellSize
    )

    return canvas.toDataURL('image/png')
  }

  const handleGenerate = () => {
    if (!text.trim()) {
      showError('Please enter text to encode')
      return
    }

    const newOptions = { ...options, text }
    const qrDataUrl = generateQRCode(text, newOptions)
    setQrCodeDataUrl(qrDataUrl)
    success('QR code generated successfully!')
  }

  const handleCopy = async (text: string, label: string) => {
    const copySuccess = await copyToClipboard(text)
    if (copySuccess) {
      success(`${label} copied to clipboard!`)
    } else {
      showError('Failed to copy to clipboard')
    }
  }

  const handleDownload = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a')
      link.href = qrCodeDataUrl
      link.download = `qrcode-${Date.now()}.png`
      link.click()
      success('QR code downloaded!')
    }
  }

  const loadExample = () => {
    const example = 'https://example.com'
    setText(example)
    success('Example loaded!')
  }

  // Auto-generate when text changes
  useEffect(() => {
    if (text.trim()) {
      const newOptions = { ...options, text }
      const qrDataUrl = generateQRCode(text, newOptions)
      setQrCodeDataUrl(qrDataUrl)
    }
  }, [text, options.size, options.color, options.errorCorrectionLevel])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">QR Code Generator</h1>
          <p className="text-xl text-gray-600">Generate QR codes for URLs, text, and data</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <QrCode className="w-5 h-5 mr-2 text-blue-600" />
                  QR Code Content
                </CardTitle>
                <CardDescription>Enter the text or URL to encode in the QR code</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Enter text, URL, or data to encode..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                    className="min-h-[120px]"
                    rows={5}
                  />

                  <div className="flex gap-2">
                    <Button onClick={loadExample} variant="outline">
                      Load Example
                    </Button>
                    <Button onClick={handleGenerate} disabled={!text.trim()}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Generate QR Code
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-purple-600" />
                  QR Code Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size: {options.size}px
                    </label>
                    <input
                      type="range"
                      min="128"
                      max="512"
                      step="32"
                      value={options.size}
                      onChange={e =>
                        setOptions(prev => ({ ...prev, size: parseInt(e.target.value) }))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Error Correction Level
                    </label>
                    <select
                      value={options.errorCorrectionLevel}
                      onChange={e =>
                        setOptions(prev => ({
                          ...prev,
                          errorCorrectionLevel: e.target.value as any,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="L">L - Low (7%)</option>
                      <option value="M">M - Medium (15%)</option>
                      <option value="Q">Q - Quartile (25%)</option>
                      <option value="H">H - High (30%)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dark Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={options.color?.dark || '#000000'}
                          onChange={e =>
                            setOptions(prev => ({
                              ...prev,
                              color: { ...prev.color!, dark: e.target.value },
                            }))
                          }
                          className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <Input
                          value={options.color?.dark || '#000000'}
                          onChange={e =>
                            setOptions(prev => ({
                              ...prev,
                              color: { ...prev.color!, dark: e.target.value },
                            }))
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Light Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={options.color?.light || '#ffffff'}
                          onChange={e =>
                            setOptions(prev => ({
                              ...prev,
                              color: { ...prev.color!, light: e.target.value },
                            }))
                          }
                          className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <Input
                          value={options.color?.light || '#ffffff'}
                          onChange={e =>
                            setOptions(prev => ({
                              ...prev,
                              color: { ...prev.color!, light: e.target.value },
                            }))
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* QR Code Display */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="w-5 h-5 mr-2 text-green-600" />
                  Generated QR Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {qrCodeDataUrl ? (
                    <>
                      <div className="text-center">
                        <img
                          src={qrCodeDataUrl}
                          alt="Generated QR Code"
                          className="mx-auto border border-gray-200 rounded-lg"
                          style={{ maxWidth: '100%', height: 'auto' }}
                        />
                      </div>

                      <div className="text-center text-sm text-gray-600">
                        {text.length} characters • {options.size}×{options.size}px
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleCopy(text, 'QR Code Content')}
                          variant="outline"
                          className="flex-1"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Text
                        </Button>
                        <Button onClick={handleDownload} variant="outline" className="flex-1">
                          <Download className="w-4 h-4 mr-2" />
                          Download PNG
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <QrCode className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Enter text to generate QR code</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* QR Code Info */}
            {qrCodeDataUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>QR Code Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Content:</span>
                      <span className="font-mono text-gray-900 truncate max-w-xs" title={text}>
                        {text}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="text-gray-900">
                        {options.size}×{options.size}px
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Error Correction:</span>
                      <span className="text-gray-900">{options.errorCorrectionLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dark Color:</span>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 border border-gray-300 rounded"
                          style={{ backgroundColor: options.color?.dark || '#000000' }}
                        />
                        <span className="font-mono text-gray-900">
                          {options.color?.dark || '#000000'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Light Color:</span>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 border border-gray-300 rounded"
                          style={{ backgroundColor: options.color?.light || '#ffffff' }}
                        />
                        <span className="font-mono text-gray-900">
                          {options.color?.light || '#ffffff'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <QrCode className="w-5 h-5 mr-2 text-blue-600" />
              About QR Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">What are QR Codes?</h4>
                <p className="text-gray-600">
                  QR (Quick Response) codes are two-dimensional barcodes that can store various
                  types of data. They're widely used for URLs, contact information, and other data
                  that can be quickly scanned.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Common Uses</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Website URLs and links</li>
                  <li>• Contact information (vCard)</li>
                  <li>• WiFi network credentials</li>
                  <li>• App store links</li>
                  <li>• Payment information</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
