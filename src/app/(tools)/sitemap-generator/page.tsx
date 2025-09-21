'use client'

import { useState } from 'react'
// Metadata removed - client components cannot export metadata
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { copyToClipboard, downloadFile } from '@/lib/utils'
import { SitemapData } from '@/types'
import { Copy, Download, FileText, Globe, Plus, Trash2 } from 'lucide-react'

// Metadata removed - client components cannot export metadata

export default function SitemapGeneratorPage() {
  const [baseUrl, setBaseUrl] = useState('')
  const [urls, setUrls] = useState<SitemapData[]>([])
  const [newUrl, setNewUrl] = useState('')
  const [newPriority, setNewPriority] = useState(0.5)
  const [newChangeFreq, setNewChangeFreq] = useState<
    'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  >('monthly')
  const [xmlOutput, setXmlOutput] = useState('')
  const { success, error: showError } = useToast()

  const addUrl = () => {
    if (!newUrl.trim()) {
      showError('Please enter a URL')
      return
    }

    const urlData: SitemapData = {
      url: newUrl.startsWith('http')
        ? newUrl
        : `${baseUrl}${newUrl.startsWith('/') ? '' : '/'}${newUrl}`,
      lastModified: new Date().toISOString().split('T')[0],
      changeFrequency: newChangeFreq,
      priority: newPriority,
    }

    setUrls(prev => [...prev, urlData])
    setNewUrl('')
    success('URL added to sitemap!')
  }

  const removeUrl = (index: number) => {
    setUrls(prev => prev.filter((_, i) => i !== index))
    success('URL removed from sitemap!')
  }

  const generateSitemap = () => {
    if (!baseUrl.trim()) {
      showError('Please enter a base URL')
      return
    }

    const cleanBaseUrl = baseUrl.replace(/\/$/, '')

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    url => `  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastModified}</lastmod>
    <changefreq>${url.changeFrequency}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

    setXmlOutput(sitemapXml)
    success('Sitemap generated successfully!')
  }

  const handleCopy = async (text: string, label: string) => {
    const copySuccess = await copyToClipboard(text)
    if (copySuccess) {
      success(`${label} copied to clipboard!`)
    } else {
      showError('Failed to copy to clipboard')
    }
  }

  const loadExample = () => {
    setBaseUrl('https://example.com')
    setUrls([
      {
        url: 'https://example.com',
        lastModified: new Date().toISOString().split('T')[0],
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: 'https://example.com/about',
        lastModified: new Date().toISOString().split('T')[0],
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: 'https://example.com/services',
        lastModified: new Date().toISOString().split('T')[0],
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: 'https://example.com/contact',
        lastModified: new Date().toISOString().split('T')[0],
        changeFrequency: 'monthly',
        priority: 0.7,
      },
    ])
    success('Example sitemap loaded!')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">XML FileText Generator</h1>
          <p className="text-xl text-gray-600">Generate XML sitemaps for your website</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-blue-600" />
                  FileText Configuration
                </CardTitle>
                <CardDescription>Configure your sitemap settings and add URLs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    placeholder="https://example.com"
                    value={baseUrl}
                    onChange={e => setBaseUrl(e.target.value)}
                    label="Base URL"
                    icon={<Globe className="w-5 h-5" />}
                  />

                  <div className="flex gap-2">
                    <Input
                      placeholder="/page"
                      value={newUrl}
                      onChange={e => setNewUrl(e.target.value)}
                      label="Add URL"
                      className="flex-1"
                    />
                    <Button onClick={addUrl} disabled={!newUrl.trim()}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={newPriority}
                        onChange={e => setNewPriority(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value={1.0}>1.0 (Highest)</option>
                        <option value={0.9}>0.9</option>
                        <option value={0.8}>0.8</option>
                        <option value={0.7}>0.7</option>
                        <option value={0.6}>0.6</option>
                        <option value={0.5}>0.5 (Default)</option>
                        <option value={0.4}>0.4</option>
                        <option value={0.3}>0.3</option>
                        <option value={0.2}>0.2</option>
                        <option value={0.1}>0.1 (Lowest)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Change Frequency
                      </label>
                      <select
                        value={newChangeFreq}
                        onChange={e => setNewChangeFreq(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="always">Always</option>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="never">Never</option>
                      </select>
                    </div>
                  </div>

                  <Button onClick={loadExample} variant="outline" className="w-full">
                    Load Example
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* URL List */}
            <Card>
              <CardHeader>
                <CardTitle>URLs in FileText ({urls.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {urls.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">{url.url}</div>
                        <div className="text-xs text-gray-500">
                          Priority: {url.priority} | Frequency: {url.changeFrequency}
                        </div>
                      </div>
                      <Button onClick={() => removeUrl(index)} variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Output */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-green-600" />
                  Generated FileText
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Generated XML sitemap will appear here..."
                    value={xmlOutput}
                    readOnly
                    className="min-h-[400px] font-mono text-sm"
                    rows={20}
                  />

                  {xmlOutput && (
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => handleCopy(xmlOutput, 'FileText XML')}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy XML
                      </Button>
                      <Button
                        onClick={() => downloadFile(xmlOutput, 'sitemap.xml', 'application/xml')}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}

                  <Button
                    onClick={generateSitemap}
                    disabled={!baseUrl.trim() || urls.length === 0}
                    className="w-full"
                  >
                    Generate FileText
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
