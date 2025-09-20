'use client'

import React, { useState, useRef } from 'react'
import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { 
  Image, 
  Download,
  Upload,
  RotateCcw,
  Crop,
  Zap,
  FileImage
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Image Optimizer - Free Image Compression Tool',
  description: 'Compress and optimize images for web. Free image optimizer with format conversion and quality adjustment.',
  keywords: ['image optimizer', 'image compressor', 'image resizer', 'webp converter', 'image optimization'],
  openGraph: {
    title: 'Image Optimizer - Free Image Compression Tool',
    description: 'Compress and optimize images for web. Free image optimizer with format conversion.',
  },
}

interface ImageOptimization {
  originalSize: number
  optimizedSize: number
  compressionRatio: number
  format: string
  dimensions: { width: number; height: number }
  quality: number
}

export default function ImageOptimizerPage() {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [optimizedImage, setOptimizedImage] = useState<string | null>(null)
  const [optimization, setOptimization] = useState<ImageOptimization | null>(null)
  const [quality, setQuality] = useState(80)
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg')
  const [maxWidth, setMaxWidth] = useState(1920)
  const [maxHeight, setMaxHeight] = useState(1080)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { success, error: showError } = useToast()

  const optimizeImage = async (file: File): Promise<void> => {
    setIsProcessing(true)
    
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas context not available')

      const img = new window.Image()
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = URL.createObjectURL(file)
      })

      // Calculate new dimensions
      let { width, height } = img
      const aspectRatio = width / height

      if (width > maxWidth) {
        width = maxWidth
        height = width / aspectRatio
      }
      if (height > maxHeight) {
        height = maxHeight
        width = height * aspectRatio
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Draw and optimize
      ctx.drawImage(img, 0, 0, width, height)
      
      const mimeType = `image/${format}`
      const optimizedDataUrl = canvas.toDataURL(mimeType, quality / 100)
      
      // Calculate sizes
      const originalSize = file.size
      const optimizedSize = Math.round((optimizedDataUrl.length - 22) * 3 / 4) // Approximate size
      const compressionRatio = Math.round((1 - optimizedSize / originalSize) * 100)

      setOptimizedImage(optimizedDataUrl)
      setOptimization({
        originalSize,
        optimizedSize,
        compressionRatio,
        format,
        dimensions: { width, height },
        quality
      })

      success('Image optimized successfully!')
    } catch (err) {
      showError('Image optimization failed: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showError('Please select a valid image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string)
      optimizeImage(file)
    }
    reader.readAsDataURL(file)
  }

  const downloadOptimizedImage = () => {
    if (!optimizedImage) return

    const link = document.createElement('a')
    link.href = optimizedImage
    link.download = `optimized-image.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    success('Image downloaded!')
  }

  const resetImage = () => {
    setOriginalImage(null)
    setOptimizedImage(null)
    setOptimization(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    success('Image reset')
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Image Optimizer</h1>
          <p className="text-xl text-gray-600">Compress and optimize images for web with format conversion</p>
        </div>

        {/* Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-blue-600" />
              Optimization Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600 mt-1">{quality}%</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WebP</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Width
                </label>
                <input
                  type="number"
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Height
                </label>
                <input
                  type="number"
                  value={maxHeight}
                  onChange={(e) => setMaxHeight(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="w-5 h-5 mr-2 text-green-600" />
              Upload Image
            </CardTitle>
            <CardDescription>Select an image file to optimize</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Click to select an image or drag and drop</p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Select Image'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Image Comparison */}
        {originalImage && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Image className="w-5 h-5 mr-2 text-blue-600" />
                  Original Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <img
                    src={originalImage}
                    alt="Original"
                    className="w-full h-64 object-contain border rounded-lg"
                  />
                  {optimization && (
                    <div className="text-sm text-gray-600">
                      <div>Size: {formatFileSize(optimization.originalSize)}</div>
                      <div>Dimensions: {optimization.dimensions.width} × {optimization.dimensions.height}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Optimized */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-green-600" />
                  Optimized Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {optimizedImage ? (
                    <img
                      src={optimizedImage}
                      alt="Optimized"
                      className="w-full h-64 object-contain border rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-64 border rounded-lg flex items-center justify-center text-gray-500">
                      {isProcessing ? 'Processing...' : 'No optimized image'}
                    </div>
                  )}
                  
                  {optimization && (
                    <div className="text-sm text-gray-600">
                      <div>Size: {formatFileSize(optimization.optimizedSize)}</div>
                      <div>Compression: {optimization.compressionRatio}% smaller</div>
                      <div>Format: {optimization.format.toUpperCase()}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Optimization Results */}
        {optimization && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crop className="w-5 h-5 mr-2 text-purple-600" />
                Optimization Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatFileSize(optimization.originalSize)}
                  </div>
                  <div className="text-sm text-blue-600">Original Size</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatFileSize(optimization.optimizedSize)}
                  </div>
                  <div className="text-sm text-green-600">Optimized Size</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {optimization.compressionRatio}%
                  </div>
                  <div className="text-sm text-purple-600">Size Reduction</div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {optimization.dimensions.width}×{optimization.dimensions.height}
                  </div>
                  <div className="text-sm text-yellow-600">Dimensions</div>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={downloadOptimizedImage}
                  className="flex-1"
                  disabled={!optimizedImage}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Optimized
                </Button>
                <Button
                  onClick={resetImage}
                  variant="outline"
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Image className="w-5 h-5 mr-2 text-blue-600" />
              Image Optimization Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Supported Formats</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• JPEG - Best for photographs</li>
                  <li>• PNG - Best for graphics with transparency</li>
                  <li>• WebP - Modern format with better compression</li>
                  <li>• All common image formats as input</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Optimization Features</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Quality adjustment (10-100%)</li>
                  <li>• Automatic resizing with aspect ratio</li>
                  <li>• Format conversion</li>
                  <li>• Compression ratio calculation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}