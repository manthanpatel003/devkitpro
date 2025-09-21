'use client'

import React, { useRef, useState } from 'react'
// Metadata removed - client components cannot export metadata
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { Download, Image as ImageIcon, Palette, RotateCcw, Star } from 'lucide-react'

// Metadata removed - client components cannot export metadata

interface FaviconConfig {
  text: string
  backgroundColor: string
  textColor: string
  fontSize: number
  fontFamily: string
  size: number
}

export default function FaviconGeneratorPage() {
  const [config, setConfig] = useState<FaviconConfig>({
    text: 'F',
    backgroundColor: '#3B82F6',
    textColor: '#FFFFFF',
    fontSize: 32,
    fontFamily: 'Arial',
    size: 32,
  })
  const [generatedFavicon, setGeneratedFavicon] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { success, error: showError } = useToast()

  const generateFavicon = async (): Promise<void> => {
    setIsGenerating(true)

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas context not available')

      canvas.width = config.size
      canvas.height = config.size

      // Draw background
      ctx.fillStyle = config.backgroundColor
      ctx.fillRect(0, 0, config.size, config.size)

      // Draw text
      ctx.fillStyle = config.textColor
      ctx.font = `bold ${config.fontSize}px ${config.fontFamily}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(config.text, config.size / 2, config.size / 2)

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png')
      setGeneratedFavicon(dataUrl)
      success('Favicon generated successfully!')
    } catch (err) {
      showError(
        'Favicon generation failed: ' + (err instanceof Error ? err.message : 'Unknown error')
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const generateFromImage = async (file: File): Promise<void> => {
    setIsGenerating(true)

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas context not available')

      canvas.width = config.size
      canvas.height = config.size

      const img = new window.Image()

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = URL.createObjectURL(file)
      })

      // Draw image centered and scaled
      const scale = Math.min(config.size / img.width, config.size / img.height)
      const scaledWidth = img.width * scale
      const scaledHeight = img.height * scale
      const x = (config.size - scaledWidth) / 2
      const y = (config.size - scaledHeight) / 2

      ctx.drawImage(img, x, y, scaledWidth, scaledHeight)

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png')
      setGeneratedFavicon(dataUrl)
      success('Favicon generated from image!')
    } catch (err) {
      showError(
        'Image processing failed: ' + (err instanceof Error ? err.message : 'Unknown error')
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showError('Please select a valid image file')
      return
    }

    generateFromImage(file)
  }

  const downloadFavicon = (size: number = config.size) => {
    if (!generatedFavicon) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = size
    canvas.height = size

    const img = new window.Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size)
      const dataUrl = canvas.toDataURL('image/png')

      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `favicon-${size}x${size}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      success(`Favicon ${size}x${size} downloaded!`)
    }
    img.src = generatedFavicon
  }

  const downloadAllSizes = () => {
    const sizes = [16, 32, 48, 64, 128, 256]
    sizes.forEach((size, index) => {
      setTimeout(() => downloadFavicon(size), index * 500)
    })
    success('Downloading all favicon sizes...')
  }

  const resetConfig = () => {
    setConfig({
      text: 'F',
      backgroundColor: '#3B82F6',
      textColor: '#FFFFFF',
      fontSize: 32,
      fontFamily: 'Arial',
      size: 32,
    })
    setGeneratedFavicon(null)
    success('Configuration reset')
  }

  // Auto-generate when config changes
  React.useEffect(() => {
    if (config.text.trim()) {
      generateFavicon()
    }
  }, [config])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Favicon Generator</h1>
          <p className="text-xl text-gray-600">
            Generate favicons from text or images with multiple sizes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="w-5 h-5 mr-2 text-blue-600" />
                Favicon Configuration
              </CardTitle>
              <CardDescription>Customize your favicon appearance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text/Initial
                  </label>
                  <Input
                    value={config.text}
                    onChange={e => setConfig({ ...config, text: e.target.value })}
                    placeholder="Enter text or initial"
                    maxLength={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={config.backgroundColor}
                        onChange={e => setConfig({ ...config, backgroundColor: e.target.value })}
                        className="w-12 h-10 border border-gray-300 rounded"
                      />
                      <Input
                        value={config.backgroundColor}
                        onChange={e => setConfig({ ...config, backgroundColor: e.target.value })}
                        placeholder="#3B82F6"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={config.textColor}
                        onChange={e => setConfig({ ...config, textColor: e.target.value })}
                        className="w-12 h-10 border border-gray-300 rounded"
                      />
                      <Input
                        value={config.textColor}
                        onChange={e => setConfig({ ...config, textColor: e.target.value })}
                        placeholder="#FFFFFF"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Size
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="48"
                      value={config.fontSize}
                      onChange={e => setConfig({ ...config, fontSize: Number(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-gray-600 mt-1">
                      {config.fontSize}px
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Favicon Size
                    </label>
                    <select
                      value={config.size}
                      onChange={e => setConfig({ ...config, size: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value={16}>16×16</option>
                      <option value={32}>32×32</option>
                      <option value={48}>48×48</option>
                      <option value={64}>64×64</option>
                      <option value={128}>128×128</option>
                      <option value={256}>256×256</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Family
                  </label>
                  <select
                    value={config.fontFamily}
                    onChange={e => setConfig({ ...config, fontFamily: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Georgia">Georgia</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={resetConfig} variant="outline" className="flex-1">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="flex-1"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-green-600" />
                Favicon Preview
              </CardTitle>
              <CardDescription>Preview your generated favicon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generatedFavicon ? (
                  <div className="text-center">
                    <div className="inline-block p-4 bg-gray-100 rounded-lg">
                      <img
                        src={generatedFavicon}
                        alt="Generated Favicon"
                        className="w-32 h-32 mx-auto"
                      />
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      {config.size}×{config.size} pixels
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 bg-gray-100 rounded-lg">
                    <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Favicon preview will appear here</p>
                  </div>
                )}

                {generatedFavicon && (
                  <div className="space-y-2">
                    <Button
                      onClick={() => downloadFavicon()}
                      className="w-full"
                      disabled={isGenerating}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download {config.size}×{config.size}
                    </Button>
                    <Button
                      onClick={downloadAllSizes}
                      variant="outline"
                      className="w-full"
                      disabled={isGenerating}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download All Sizes
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Size Variations */}
        {generatedFavicon && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-purple-600" />
                All Favicon Sizes
              </CardTitle>
              <CardDescription>Standard favicon sizes for different use cases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[16, 32, 48, 64, 128, 256].map(size => (
                  <div key={size} className="text-center">
                    <div className="p-2 bg-gray-100 rounded-lg mb-2">
                      <img
                        src={generatedFavicon}
                        alt={`Favicon ${size}x${size}`}
                        className="w-8 h-8 mx-auto"
                        style={{ width: Math.min(size, 32), height: Math.min(size, 32) }}
                      />
                    </div>
                    <div className="text-xs text-gray-600">
                      {size}×{size}
                    </div>
                    <Button
                      onClick={() => downloadFavicon(size)}
                      size="sm"
                      variant="outline"
                      className="mt-1 w-full"
                    >
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* HTML Code */}
        {generatedFavicon && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-blue-600" />
                HTML Implementation
              </CardTitle>
              <CardDescription>Add this code to your HTML head section</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <div className="space-y-1">
                  <div>&lt;!-- Favicon for different devices --&gt;</div>
                  <div>
                    &lt;link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png"&gt;
                  </div>
                  <div>
                    &lt;link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png"&gt;
                  </div>
                  <div>
                    &lt;link rel="icon" type="image/png" sizes="48x48" href="favicon-48x48.png"&gt;
                  </div>
                  <div>
                    &lt;link rel="icon" type="image/png" sizes="64x64" href="favicon-64x64.png"&gt;
                  </div>
                  <div>
                    &lt;link rel="icon" type="image/png" sizes="128x128"
                    href="favicon-128x128.png"&gt;
                  </div>
                  <div>
                    &lt;link rel="icon" type="image/png" sizes="256x256"
                    href="favicon-256x256.png"&gt;
                  </div>
                  <div>
                    &lt;link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png"&gt;
                  </div>
                  <div>&lt;link rel="manifest" href="site.webmanifest"&gt;</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-blue-600" />
              Favicon Generator Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Text-Based Favicons</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Generate from text or initials</li>
                  <li>• Customizable colors and fonts</li>
                  <li>• Multiple size variations</li>
                  <li>• Real-time preview</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Image-Based Favicons</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Upload and resize images</li>
                  <li>• Automatic scaling and centering</li>
                  <li>• Support for all image formats</li>
                  <li>• Batch download all sizes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
