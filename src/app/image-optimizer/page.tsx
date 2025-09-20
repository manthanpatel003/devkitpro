'use client'

import { useState, useRef } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { 
  Image,
  Upload,
  Download,
  Copy,
  RotateCcw,
  Zap,
  Settings,
  Eye,
  Maximize,
  Minimize,
  Palette,
  FileImage,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Crop,
  RotateCw,
  FlipHorizontal,
  FlipVertical
} from 'lucide-react'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { motion } from 'framer-motion'

interface ImageInfo {
  name: string
  size: number
  type: string
  width: number
  height: number
  aspectRatio: number
}

interface OptimizationOptions {
  format: 'jpeg' | 'png' | 'webp'
  quality: number
  width?: number
  height?: number
  maintainAspectRatio: boolean
  progressive: boolean
  removeMetadata: boolean
}

interface OptimizationResult {
  originalImage: ImageInfo
  optimizedImage: ImageInfo
  dataURL: string
  compressionRatio: number
  sizeSaved: number
  processingTime: number
}

const ImageOptimizerPage = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [originalInfo, setOriginalInfo] = useState<ImageInfo | null>(null)
  const [optimizedImage, setOptimizedImage] = useState<string | null>(null)
  const [result, setResult] = useState<OptimizationResult | null>(null)
  const [options, setOptions] = useState<OptimizationOptions>({
    format: 'webp',
    quality: 80,
    maintainAspectRatio: true,
    progressive: true,
    removeMetadata: true
  })
  const [processing, setProcessing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [viewMode, setViewMode] = useState<'side-by-side' | 'overlay' | 'original' | 'optimized'>('side-by-side')
  
  const { copyToClipboard, copied } = useCopyToClipboard()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file')
      return
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      alert('Image file must be under 50MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataURL = e.target?.result as string
      setOriginalImage(dataURL)
      
      // Analyze original image
      const img = new Image()
      img.onload = () => {
        const info: ImageInfo = {
          name: file.name,
          size: file.size,
          type: file.type,
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height
        }
        setOriginalInfo(info)
        
        // Auto-optimize with current settings
        optimizeImage(dataURL, info)
      }
      img.src = dataURL
    }
    reader.readAsDataURL(file)
  }

  const optimizeImage = async (imageData: string, originalInfo: ImageInfo) => {
    if (!canvasRef.current) return

    setProcessing(true)
    const startTime = performance.now()

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas context not available')

      const img = new Image()
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = imageData
      })

      // Calculate dimensions
      let { width, height } = originalInfo
      if (options.width || options.height) {
        if (options.maintainAspectRatio) {
          if (options.width && options.height) {
            const targetRatio = options.width / options.height
            if (originalInfo.aspectRatio > targetRatio) {
              width = options.width
              height = options.width / originalInfo.aspectRatio
            } else {
              height = options.height
              width = options.height * originalInfo.aspectRatio
            }
          } else if (options.width) {
            width = options.width
            height = options.width / originalInfo.aspectRatio
          } else if (options.height) {
            height = options.height
            width = options.height * originalInfo.aspectRatio
          }
        } else {
          width = options.width || width
          height = options.height || height
        }
      }

      // Set canvas size
      canvas.width = width
      canvas.height = height

      // Configure canvas for better quality
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // Draw image
      ctx.drawImage(img, 0, 0, width, height)

      // Generate optimized image
      const mimeType = `image/${options.format}`
      const quality = options.quality / 100
      const optimizedDataURL = canvas.toDataURL(mimeType, quality)

      // Calculate optimized size (approximate)
      const optimizedSize = Math.round((optimizedDataURL.length - 'data:image/'.length - mimeType.length - ';base64,'.length) * 0.75)
      
      const optimizedInfo: ImageInfo = {
        name: originalInfo.name.replace(/\.[^/.]+$/, `.${options.format}`),
        size: optimizedSize,
        type: mimeType,
        width: Math.round(width),
        height: Math.round(height),
        aspectRatio: width / height
      }

      const endTime = performance.now()
      const compressionRatio = optimizedSize / originalInfo.size
      const sizeSaved = originalInfo.size - optimizedSize

      const optimizationResult: OptimizationResult = {
        originalImage: originalInfo,
        optimizedImage: optimizedInfo,
        dataURL: optimizedDataURL,
        compressionRatio,
        sizeSaved,
        processingTime: Math.round(endTime - startTime)
      }

      setOptimizedImage(optimizedDataURL)
      setResult(optimizationResult)
    } catch (error: any) {
      console.error('Image optimization failed:', error)
      alert(`Optimization failed: ${error.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      handleImageUpload(files[0])
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

  const downloadOptimized = () => {
    if (!optimizedImage || !result) return

    const link = document.createElement('a')
    link.download = result.optimizedImage.name
    link.href = optimizedImage
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const copyOptimizedImage = async () => {
    if (!optimizedImage) return

    try {
      const response = await fetch(optimizedImage)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ])
    } catch (error) {
      copyToClipboard(optimizedImage)
    }
  }

  const reoptimize = () => {
    if (originalImage && originalInfo) {
      optimizeImage(originalImage, originalInfo)
    }
  }

  const clearAll = () => {
    setOriginalImage(null)
    setOriginalInfo(null)
    setOptimizedImage(null)
    setResult(null)
  }

  const updateOption = <K extends keyof OptimizationOptions>(key: K, value: OptimizationOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getSavingsColor = (ratio: number) => {
    if (ratio < 0.5) return 'text-green-600'
    if (ratio < 0.8) return 'text-blue-600'
    return 'text-yellow-600'
  }

  return (
    <ToolLayout
      title="Image Optimizer Pro"
      description="Compress, resize, and convert images with format optimization and quality control"
    >
      <div className="space-y-6">
        {/* Upload Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Image
          </h3>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <FileImage className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Drop your image here</p>
            <p className="text-sm text-gray-600 mb-4">
              Supports JPEG, PNG, WebP, GIF • Maximum 50MB
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
            className="hidden"
          />
        </Card>

        {/* Optimization Options */}
        {originalImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Optimization Settings
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Output Format</label>
                    <select
                      value={options.format}
                      onChange={(e) => updateOption('format', e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="webp">WebP (Best compression)</option>
                      <option value="jpeg">JPEG (Good for photos)</option>
                      <option value="png">PNG (Lossless)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Quality: {options.quality}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={options.quality}
                      onChange={(e) => updateOption('quality', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Smaller file</span>
                      <span>Better quality</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Width (px)</label>
                      <input
                        type="number"
                        value={options.width || ''}
                        onChange={(e) => updateOption('width', e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="Auto"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        min="1"
                        max="4096"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Height (px)</label>
                      <input
                        type="number"
                        value={options.height || ''}
                        onChange={(e) => updateOption('height', e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="Auto"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        min="1"
                        max="4096"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={options.maintainAspectRatio}
                        onChange={(e) => updateOption('maintainAspectRatio', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium">Maintain aspect ratio</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={options.progressive}
                        onChange={(e) => updateOption('progressive', e.target.checked)}
                        className="rounded"
                      />
                      <div>
                        <span className="text-sm font-medium">Progressive encoding</span>
                        <div className="text-xs text-gray-600">Better for web loading</div>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={options.removeMetadata}
                        onChange={(e) => updateOption('removeMetadata', e.target.checked)}
                        className="rounded"
                      />
                      <div>
                        <span className="text-sm font-medium">Remove metadata</span>
                        <div className="text-xs text-gray-600">EXIF, GPS, etc.</div>
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={reoptimize} disabled={processing} size="sm">
                      {processing ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4 mr-2" />
                      )}
                      {processing ? 'Optimizing...' : 'Optimize'}
                    </Button>
                    <Button onClick={clearAll} variant="outline" size="sm">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Optimization Results
              </h3>

              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">{formatFileSize(result.originalImage.size)}</div>
                  <div className="text-sm text-gray-600">Original Size</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-xl font-bold text-green-600">{formatFileSize(result.optimizedImage.size)}</div>
                  <div className="text-sm text-gray-600">Optimized Size</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className={`text-xl font-bold ${getSavingsColor(result.compressionRatio)}`}>
                    {((1 - result.compressionRatio) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Size Reduction</div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-xl font-bold text-orange-600">{result.processingTime}ms</div>
                  <div className="text-sm text-gray-600">Processing Time</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Original Image</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Dimensions:</span>
                      <span>{result.originalImage.width} × {result.originalImage.height}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Format:</span>
                      <span>{result.originalImage.type.split('/')[1].toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>File Size:</span>
                      <span>{formatFileSize(result.originalImage.size)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Optimized Image</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Dimensions:</span>
                      <span>{result.optimizedImage.width} × {result.optimizedImage.height}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Format:</span>
                      <span>{result.optimizedImage.type.split('/')[1].toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>File Size:</span>
                      <span className={getSavingsColor(result.compressionRatio)}>
                        {formatFileSize(result.optimizedImage.size)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-center gap-3">
                <Button onClick={copyOptimizedImage} variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy Image'}
                </Button>
                <Button onClick={downloadOptimized}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Optimized
                </Button>
              </div>
            </Card>

            {/* Image Comparison */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Image Comparison
                </h3>
                <div className="flex items-center gap-2">
                  <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value as any)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="side-by-side">Side by Side</option>
                    <option value="overlay">Overlay</option>
                    <option value="original">Original Only</option>
                    <option value="optimized">Optimized Only</option>
                  </select>
                </div>
              </div>

              <div className="relative">
                {viewMode === 'side-by-side' && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="mb-2 text-sm font-medium">Original</div>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                        <img 
                          src={originalImage} 
                          alt="Original" 
                          className="max-w-full h-auto mx-auto"
                          style={{ maxHeight: '300px' }}
                        />
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        {formatFileSize(result.originalImage.size)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="mb-2 text-sm font-medium">Optimized</div>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                        <img 
                          src={optimizedImage} 
                          alt="Optimized" 
                          className="max-w-full h-auto mx-auto"
                          style={{ maxHeight: '300px' }}
                        />
                      </div>
                      <div className="mt-2 text-xs text-green-600">
                        {formatFileSize(result.optimizedImage.size)} 
                        ({((1 - result.compressionRatio) * 100).toFixed(1)}% smaller)
                      </div>
                    </div>
                  </div>
                )}

                {viewMode === 'original' && (
                  <div className="text-center">
                    <div className="mb-2 text-sm font-medium">Original Image</div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                      <img 
                        src={originalImage} 
                        alt="Original" 
                        className="max-w-full h-auto mx-auto"
                        style={{ maxHeight: '400px' }}
                      />
                    </div>
                  </div>
                )}

                {viewMode === 'optimized' && optimizedImage && (
                  <div className="text-center">
                    <div className="mb-2 text-sm font-medium">Optimized Image</div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                      <img 
                        src={optimizedImage} 
                        alt="Optimized" 
                        className="max-w-full h-auto mx-auto"
                        style={{ maxHeight: '400px' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Optimization Tips */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Image Optimization Guide</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Format Recommendations</h4>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="font-medium text-green-700">WebP</div>
                  <div className="text-sm text-gray-600">Best overall compression, modern browsers</div>
                  <div className="text-xs text-gray-500">25-35% smaller than JPEG</div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="font-medium text-blue-700">JPEG</div>
                  <div className="text-sm text-gray-600">Good for photos, universal support</div>
                  <div className="text-xs text-gray-500">Lossy compression</div>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="font-medium text-purple-700">PNG</div>
                  <div className="text-sm text-gray-600">Lossless, good for graphics with transparency</div>
                  <div className="text-xs text-gray-500">Larger file sizes</div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Optimization Tips</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Use WebP for modern web applications
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Quality 80-85% provides good balance
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Resize images to display dimensions
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Remove metadata to reduce file size
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Use progressive JPEG for large images
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  Test quality settings for your specific images
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolLayout>
  )
}

export default ImageOptimizerPage