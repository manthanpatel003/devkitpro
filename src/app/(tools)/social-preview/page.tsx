'use client'

import React, { useState } from 'react'
import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { 
  Share2, 
  Copy, 
  Download, 
  Globe,
  Image,
  ExternalLink
} from 'lucide-react'
import { copyToClipboard, downloadFile } from '@/lib/utils'
import { SocialPreview } from '@/types'

export const metadata: Metadata = {
  title: 'Social Media Preview - Free Social Media Card Generator',
  description: 'Preview how your content looks on social media platforms. Free social media preview tool for Facebook, Twitter, and LinkedIn.',
  keywords: ['social media preview', 'social media card', 'og preview', 'social preview', 'meta preview'],
  openGraph: {
    title: 'Social Media Preview - Free Social Media Card Generator',
    description: 'Preview how your content looks on social media platforms. Free social media preview tool.',
  },
}

export default function SocialPreviewPage() {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [siteName, setSiteName] = useState('')
  const [preview, setPreview] = useState<SocialPreview | null>(null)
  const [loading, setLoading] = useState(false)
  const { success, error: showError } = useToast()

  const generatePreview = async () => {
    if (!url.trim()) {
      showError('Please enter a URL')
      return
    }

    setLoading(true)
    setPreview(null)

    try {
      // Mock social preview data
      const mockPreview: SocialPreview = {
        title: title || 'Your Amazing Article Title',
        description: description || 'This is a compelling description that will make people want to click and read more about your content.',
        image: image || 'https://via.placeholder.com/1200x630/3b82f6/ffffff?text=Social+Media+Preview',
        url: url,
        siteName: siteName || 'Your Website',
        type: 'article',
        twitter: {
          card: 'summary_large_image',
          site: '@yourwebsite',
          creator: '@author'
        },
        facebook: {
          type: 'article'
        }
      }

      setPreview(mockPreview)
      success('Social media preview generated!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate preview'
      setError(errorMessage)
      showError('Preview Generation Failed', errorMessage)
    } finally {
      setLoading(false)
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Social Media Preview</h1>
          <p className="text-xl text-gray-600">Preview how your content looks on social media platforms</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Share2 className="w-5 h-5 mr-2 text-blue-600" />
                  Content Details
                </CardTitle>
                <CardDescription>Enter your content information to generate social media previews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    placeholder="https://example.com/article"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    label="URL"
                    icon={<Globe className="w-5 h-5" />}
                  />
                  
                  <Input
                    placeholder="Your Amazing Article Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    label="Title"
                  />
                  
                  <Textarea
                    placeholder="This is a compelling description that will make people want to click and read more..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    label="Description"
                    rows={3}
                  />
                  
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    label="Image URL"
                    icon={<Image className="w-5 h-5" />}
                  />
                  
                  <Input
                    placeholder="Your Website Name"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    label="Site Name"
                  />
                  
                  <Button
                    onClick={generatePreview}
                    disabled={loading || !url.trim()}
                    className="w-full"
                  >
                    {loading ? 'Generating Preview...' : 'Generate Preview'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Results */}
          <div className="space-y-6">
            {preview && (
              <>
                {/* Facebook Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <div className="w-6 h-6 bg-blue-600 rounded mr-2 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">f</span>
                      </div>
                      Facebook Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                        <div>
                          <div className="font-medium text-sm">Your Page</div>
                          <div className="text-xs text-gray-500">2h</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-900 mb-2">{preview.description}</div>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <img 
                          src={preview.image} 
                          alt={preview.title}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/400x200/3b82f6/ffffff?text=Image+Not+Found'
                          }}
                        />
                        <div className="p-3">
                          <div className="text-xs text-gray-500 uppercase">{preview.siteName}</div>
                          <div className="font-medium text-sm text-gray-900">{preview.title}</div>
                          <div className="text-xs text-gray-500">{preview.url}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Twitter Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <div className="w-6 h-6 bg-blue-400 rounded mr-2 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">𝕏</span>
                      </div>
                      Twitter Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                        <div>
                          <div className="font-medium text-sm">Your Account</div>
                          <div className="text-xs text-gray-500">@yourusername</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-900 mb-3">{preview.description}</div>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <img 
                          src={preview.image} 
                          alt={preview.title}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/400x200/3b82f6/ffffff?text=Image+Not+Found'
                          }}
                        />
                        <div className="p-3">
                          <div className="text-xs text-gray-500">{preview.url}</div>
                          <div className="font-medium text-sm text-gray-900">{preview.title}</div>
                          <div className="text-xs text-gray-500">{preview.description}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* LinkedIn Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <div className="w-6 h-6 bg-blue-700 rounded mr-2 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">in</span>
                      </div>
                      LinkedIn Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                        <div>
                          <div className="font-medium text-sm">Your Name</div>
                          <div className="text-xs text-gray-500">Your Title at Company</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-900 mb-3">{preview.description}</div>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <img 
                          src={preview.image} 
                          alt={preview.title}
                          className="w-full h-32 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/400x200/3b82f6/ffffff?text=Image+Not+Found'
                          }}
                        />
                        <div className="p-3">
                          <div className="font-medium text-sm text-gray-900">{preview.title}</div>
                          <div className="text-xs text-gray-500">{preview.url}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => handleCopy(preview.title, 'Title')}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Title
                      </Button>
                      <Button
                        onClick={() => handleCopy(preview.description, 'Description')}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Description
                      </Button>
                      <Button
                        onClick={() => window.open(preview.url, '_blank')}
                        variant="outline"
                        size="sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit URL
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}