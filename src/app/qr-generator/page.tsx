'use client'

import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { motion } from 'framer-motion'
import {
  Copy,
  Download,
  Eye,
  Link,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  QrCode,
  RotateCcw,
  Settings,
  Share2,
  Upload,
  User,
  Wifi,
  Zap,
} from 'lucide-react'
import QRCode from 'qrcode'
import { useEffect, useRef, useState } from 'react'

interface QROptions {
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
  type: 'image/png' | 'image/jpeg' | 'image/webp'
  quality: number
  margin: number
  scale: number
  width: number
  color: {
    dark: string
    light: string
  }
  logo?: string
}

interface QRTemplate {
  id: string
  name: string
  icon: any
  description: string
  fields: Array<{
    name: string
    label: string
    type: 'text' | 'email' | 'tel' | 'url' | 'textarea'
    placeholder: string
    required?: boolean
  }>
  generate: (data: Record<string, string>) => string
}

const QR_TEMPLATES: QRTemplate[] = [
  {
    id: 'text',
    name: 'Plain Text',
    icon: MessageSquare,
    description: 'Simple text or message',
    fields: [
      {
        name: 'text',
        label: 'Text',
        type: 'textarea',
        placeholder: 'Enter your text or message...',
        required: true,
      },
    ],
    generate: data => data.text,
  },
  {
    id: 'url',
    name: 'Website URL',
    icon: Link,
    description: 'Link to website or webpage',
    fields: [
      {
        name: 'url',
        label: 'URL',
        type: 'url',
        placeholder: 'https://example.com',
        required: true,
      },
    ],
    generate: data => data.url,
  },
  {
    id: 'wifi',
    name: 'WiFi Network',
    icon: Wifi,
    description: 'WiFi connection details',
    fields: [
      {
        name: 'ssid',
        label: 'Network Name (SSID)',
        type: 'text',
        placeholder: 'MyWiFiNetwork',
        required: true,
      },
      { name: 'password', label: 'Password', type: 'text', placeholder: 'WiFi password' },
      { name: 'security', label: 'Security', type: 'text', placeholder: 'WPA' },
      { name: 'hidden', label: 'Hidden Network', type: 'text', placeholder: 'false' },
    ],
    generate: data =>
      `WIFI:T:${data.security || 'WPA'};S:${data.ssid};P:${data.password || ''};H:${data.hidden === 'true' ? 'true' : 'false'};;`,
  },
  {
    id: 'email',
    name: 'Email',
    icon: Mail,
    description: 'Email address with optional subject',
    fields: [
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'someone@example.com',
        required: true,
      },
      { name: 'subject', label: 'Subject', type: 'text', placeholder: 'Email subject (optional)' },
      { name: 'body', label: 'Message', type: 'textarea', placeholder: 'Email message (optional)' },
    ],
    generate: data => {
      let mailto = `mailto:${data.email}`
      const params = []
      if (data.subject) params.push(`subject=${encodeURIComponent(data.subject)}`)
      if (data.body) params.push(`body=${encodeURIComponent(data.body)}`)
      if (params.length > 0) mailto += '?' + params.join('&')
      return mailto
    },
  },
  {
    id: 'phone',
    name: 'Phone Number',
    icon: Phone,
    description: 'Phone number for calling',
    fields: [
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'tel',
        placeholder: '+1234567890',
        required: true,
      },
    ],
    generate: data => `tel:${data.phone}`,
  },
  {
    id: 'sms',
    name: 'SMS Message',
    icon: MessageSquare,
    description: 'Pre-filled SMS message',
    fields: [
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'tel',
        placeholder: '+1234567890',
        required: true,
      },
      { name: 'message', label: 'Message', type: 'textarea', placeholder: 'SMS message text' },
    ],
    generate: data =>
      `sms:${data.phone}${data.message ? `?body=${encodeURIComponent(data.message)}` : ''}`,
  },
  {
    id: 'location',
    name: 'Location',
    icon: MapPin,
    description: 'Geographic coordinates',
    fields: [
      { name: 'lat', label: 'Latitude', type: 'text', placeholder: '40.7128', required: true },
      { name: 'lng', label: 'Longitude', type: 'text', placeholder: '-74.0060', required: true },
      {
        name: 'query',
        label: 'Location Name',
        type: 'text',
        placeholder: 'New York City (optional)',
      },
    ],
    generate: data =>
      `geo:${data.lat},${data.lng}${data.query ? `?q=${encodeURIComponent(data.query)}` : ''}`,
  },
  {
    id: 'vcard',
    name: 'Contact Card',
    icon: User,
    description: 'vCard contact information',
    fields: [
      { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', required: true },
      { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+1234567890' },
      { name: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
      { name: 'organization', label: 'Organization', type: 'text', placeholder: 'Company Name' },
      { name: 'url', label: 'Website', type: 'url', placeholder: 'https://example.com' },
    ],
    generate: data => {
      const vcard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${data.name}`,
        data.phone ? `TEL:${data.phone}` : '',
        data.email ? `EMAIL:${data.email}` : '',
        data.organization ? `ORG:${data.organization}` : '',
        data.url ? `URL:${data.url}` : '',
        'END:VCARD',
      ]
        .filter(line => line)
        .join('\n')
      return vcard
    },
  },
]

const QRGeneratorPage = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<QRTemplate>(QR_TEMPLATES[0])
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [qrContent, setQrContent] = useState('')
  const [qrDataURL, setQrDataURL] = useState('')
  const [options, setOptions] = useState<QROptions>({
    errorCorrectionLevel: 'M',
    type: 'image/png',
    quality: 0.92,
    margin: 4,
    scale: 8,
    width: 512,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  })
  const [processing, setProcessing] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const { copyToClipboard, copied } = useCopyToClipboard()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (qrContent) {
      generateQRCode()
    }
  }, [qrContent, options])

  const generateQRCode = async () => {
    if (!qrContent.trim()) return

    setProcessing(true)
    try {
      const qrOptions = {
        errorCorrectionLevel: options.errorCorrectionLevel,
        type: options.type,
        quality: options.quality,
        margin: options.margin,
        scale: options.scale,
        width: options.width,
        color: {
          dark: options.color.dark,
          light: options.color.light,
        },
      }

      const dataURL = await QRCode.toDataURL(qrContent, qrOptions)
      setQrDataURL(dataURL)

      // If logo is provided, composite it
      if (options.logo) {
        await addLogoToQR(dataURL)
      }
    } catch (error: any) {
      console.error('QR Code generation failed:', error)
    } finally {
      setProcessing(false)
    }
  }

  const addLogoToQR = async (qrDataURL: string) => {
    if (!canvasRef.current || !options.logo) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Load QR code image
    const qrImg = new Image()
    qrImg.onload = () => {
      canvas.width = qrImg.width
      canvas.height = qrImg.height

      // Draw QR code
      ctx.drawImage(qrImg, 0, 0)

      // Load and draw logo
      const logoImg = new Image()
      logoImg.onload = () => {
        const logoSize = Math.min(qrImg.width, qrImg.height) * 0.2
        const x = (qrImg.width - logoSize) / 2
        const y = (qrImg.height - logoSize) / 2

        // Draw white background for logo
        ctx.fillStyle = 'white'
        ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10)

        // Draw logo
        ctx.drawImage(logoImg, x, y, logoSize, logoSize)

        // Update QR data URL
        setQrDataURL(canvas.toDataURL(options.type, options.quality))
      }
      logoImg.src = options.logo
    }
    qrImg.src = qrDataURL
  }

  const handleTemplateChange = (template: QRTemplate) => {
    setSelectedTemplate(template)
    setFormData({})
    setQrContent('')
  }

  const updateFormData = (field: string, value: string) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)

    // Auto-generate QR content
    try {
      const content = selectedTemplate.generate(newData)
      setQrContent(content)
    } catch (error) {
      console.warn('Failed to generate QR content:', error)
    }
  }

  const handleLogoUpload = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      alert('Logo file must be under 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = e => {
      const dataURL = e.target?.result as string
      setOptions(prev => ({ ...prev, logo: dataURL }))
    }
    reader.readAsDataURL(file)
  }

  const downloadQR = () => {
    if (!qrDataURL) return

    const link = document.createElement('a')
    link.download = `qr-code-${Date.now()}.${options.type.split('/')[1]}`
    link.href = qrDataURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const copyQRImage = async () => {
    if (!qrDataURL) return

    try {
      const response = await fetch(qrDataURL)
      const blob = await response.blob()
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
      // Success handled by the copy hook
    } catch (error) {
      // Fallback to copying the data URL
      copyToClipboard(qrDataURL)
    }
  }

  const shareQR = async () => {
    if (!qrDataURL || !navigator.share) {
      copyToClipboard(window.location.href)
      return
    }

    try {
      const response = await fetch(qrDataURL)
      const blob = await response.blob()
      const file = new File([blob], 'qr-code.png', { type: 'image/png' })

      await navigator.share({
        title: 'QR Code',
        text: 'Generated QR Code',
        files: [file],
      })
    } catch (error) {
      copyToClipboard(window.location.href)
    }
  }

  const loadSample = () => {
    const samples = {
      text: { text: 'Hello, World! This is a sample QR code with text content. 🚀' },
      url: { url: 'https://github.com' },
      wifi: { ssid: 'MyHomeWiFi', password: 'SecurePassword123', security: 'WPA' },
      email: {
        email: 'hello@example.com',
        subject: 'Hello from QR Code',
        body: 'This email was generated from a QR code!',
      },
      phone: { phone: '+1234567890' },
      vcard: {
        name: 'John Doe',
        phone: '+1234567890',
        email: 'john@example.com',
        organization: 'Example Corp',
        url: 'https://johndoe.com',
      },
    }

    const sample = samples[selectedTemplate.id as keyof typeof samples]
    if (sample) {
      setFormData(sample)
      const content = selectedTemplate.generate(sample)
      setQrContent(content)
    }
  }

  const clearAll = () => {
    setFormData({})
    setQrContent('')
    setQrDataURL('')
  }

  const updateOption = <K extends keyof QROptions>(key: K, value: QROptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  return (
    <ToolLayout
      title="QR Code Generator Pro"
      description="Generate customizable QR codes with logos, colors, and various data types"
    >
      <div className="space-y-6">
        {/* Template Selection */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR Code Type
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {QR_TEMPLATES.map(template => {
              const Icon = template.icon
              const isSelected = selectedTemplate.id === template.id

              return (
                <button
                  key={template.id}
                  onClick={() => handleTemplateChange(template)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <Icon className="w-6 h-6 mb-2" />
                  <div className="font-medium text-sm">{template.name}</div>
                  <div className="text-xs text-gray-500">{template.description}</div>
                </button>
              )
            })}
          </div>

          <div className="flex gap-3">
            <Button onClick={loadSample} variant="outline" size="sm">
              <Zap className="w-4 h-4 mr-2" />
              Load Sample
            </Button>
            <Button onClick={clearAll} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear All
            </Button>
            <Button onClick={() => setShowAdvanced(!showAdvanced)} variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              {showAdvanced ? 'Hide' : 'Show'} Options
            </Button>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              {React.createElement(selectedTemplate.icon, { className: 'w-5 h-5' })}
              {selectedTemplate.name} Details
            </h3>

            <div className="space-y-4">
              {selectedTemplate.fields.map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-medium mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <Textarea
                      value={formData[field.name] || ''}
                      onChange={e => updateFormData(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                    />
                  ) : (
                    <Input
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={e => updateFormData(field.name, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Raw QR Content */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Generated QR Content</label>
              <Textarea
                value={qrContent}
                onChange={e => setQrContent(e.target.value)}
                placeholder="QR code content will appear here..."
                className="font-mono text-sm"
                rows={4}
              />
            </div>
          </Card>

          {/* QR Code Preview */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Eye className="w-5 h-5" />
                QR Code Preview
              </h3>
              {qrDataURL && (
                <div className="flex items-center gap-2">
                  <Button onClick={copyQRImage} variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    {copied ? 'Copied!' : 'Copy Image'}
                  </Button>
                  <Button onClick={downloadQR} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button onClick={shareQR} variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              )}
            </div>

            <div className="text-center">
              {qrDataURL ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="inline-block p-4 bg-white rounded-lg shadow-lg">
                    <img
                      src={qrDataURL}
                      alt="Generated QR Code"
                      className="max-w-full h-auto"
                      style={{ maxWidth: '300px' }}
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    {options.width}×{options.width} • {options.type.split('/')[1].toUpperCase()}
                  </div>
                </motion.div>
              ) : (
                <div className="py-12 text-gray-400">
                  <QrCode className="w-16 h-16 mx-auto mb-4" />
                  <p>QR code will appear here</p>
                  <p className="text-sm mt-2">Fill in the form to generate</p>
                </div>
              )}
            </div>

            {processing && (
              <div className="mt-4 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="ml-2 text-sm">Generating QR code...</span>
              </div>
            )}
          </Card>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Advanced Options
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Error Correction Level</label>
                    <select
                      value={options.errorCorrectionLevel}
                      onChange={e => updateOption('errorCorrectionLevel', e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="L">Low (7%)</option>
                      <option value="M">Medium (15%)</option>
                      <option value="Q">Quartile (25%)</option>
                      <option value="H">High (30%)</option>
                    </select>
                    <div className="text-xs text-gray-600 mt-1">
                      Higher levels allow more damage but create larger codes
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Output Format</label>
                    <select
                      value={options.type}
                      onChange={e => updateOption('type', e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="image/png">PNG</option>
                      <option value="image/jpeg">JPEG</option>
                      <option value="image/webp">WebP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Size: {options.width}px
                    </label>
                    <input
                      type="range"
                      min="128"
                      max="1024"
                      step="32"
                      value={options.width}
                      onChange={e => updateOption('width', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Margin: {options.margin}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={options.margin}
                      onChange={e => updateOption('margin', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Colors</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Foreground</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={options.color.dark}
                            onChange={e =>
                              updateOption('color', { ...options.color, dark: e.target.value })
                            }
                            className="w-8 h-8 rounded border"
                          />
                          <Input
                            type="text"
                            value={options.color.dark}
                            onChange={e =>
                              updateOption('color', { ...options.color, dark: e.target.value })
                            }
                            className="flex-1 font-mono text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Background</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={options.color.light}
                            onChange={e =>
                              updateOption('color', { ...options.color, light: e.target.value })
                            }
                            className="w-8 h-8 rounded border"
                          />
                          <Input
                            type="text"
                            value={options.color.light}
                            onChange={e =>
                              updateOption('color', { ...options.color, light: e.target.value })
                            }
                            className="flex-1 font-mono text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Logo (Optional)</label>
                    <div className="space-y-2">
                      <Button
                        onClick={() => logoInputRef.current?.click()}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Logo
                      </Button>
                      {options.logo && (
                        <div className="flex items-center gap-2">
                          <img src={options.logo} alt="Logo preview" className="w-8 h-8 rounded" />
                          <span className="text-sm text-gray-600">Logo uploaded</span>
                          <Button
                            onClick={() => updateOption('logo', undefined)}
                            variant="outline"
                            size="sm"
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={e => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                      className="hidden"
                    />
                  </div>

                  {options.type === 'image/jpeg' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Quality: {Math.round(options.quality * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={options.quality}
                        onChange={e => updateOption('quality', parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Usage Tips */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">QR Code Best Practices</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-green-600">✅ Do</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Test QR codes before printing or sharing
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Use high error correction for damaged environments
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Ensure sufficient contrast between colors
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Include instructions for users
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Keep URLs short for better scanning
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-3 text-red-600">❌ Avoid</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  Very small sizes (under 2cm when printed)
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  Low contrast color combinations
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  Placing on curved or reflective surfaces
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  Oversized logos (keep under 20% of code)
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  Including sensitive information in plain text
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Hidden canvas for logo composition */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolLayout>
  )
}

export default QRGeneratorPage
