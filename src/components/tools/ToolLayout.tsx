'use client'

import { FadeIn } from '@/components/animations/FadeIn'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { Tool } from '@/types'
import {
  ArrowLeft,
  Copy,
  Download,
  ExternalLink,
  Heart,
  Info,
  Lightbulb,
  RefreshCw,
  Share2,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'

interface ToolLayoutProps {
  tool?: Tool
  title?: string
  description?: string
  children: React.ReactNode
  result?: string | null
  isLoading?: boolean
  onReset?: () => void
  onDownload?: (filename: string, content: string, type?: string) => void
  examples?: Array<{
    title: string
    description: string
    input: string
    action?: () => void
  }>
  tips?: string[]
}

export function ToolLayout({
  tool,
  title,
  description,
  children,
  result,
  isLoading = false,
  onReset,
  onDownload,
  examples = [],
  tips = [],
}: ToolLayoutProps) {
  const { copy, isCopied } = useCopyToClipboard()
  const { addToast } = useToast()

  // Use either tool object or direct props
  const toolName = tool?.name || title || 'Tool'
  const toolDescription = tool?.description || description || 'Tool description'
  const toolId = tool?.id || 'tool'

  const handleCopy = async () => {
    if (!result) return

    const success = await copy(result)
    if (success) {
      addToast({
        type: 'success',
        title: 'Copied!',
        description: 'Result copied to clipboard',
      })
    } else {
      addToast({
        type: 'error',
        title: 'Copy failed',
        description: 'Failed to copy to clipboard',
      })
    }
  }

  const handleDownload = () => {
    if (!result || !onDownload) return

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')
    const filename = `${toolId}-result-${timestamp}.txt`
    onDownload(filename, result)

    addToast({
      type: 'success',
      title: 'Downloaded!',
      description: `File saved as ${filename}`,
    })
  }

  const handleShare = async () => {
    if (!navigator.share) {
      await copy(window.location.href)
      addToast({
        type: 'success',
        title: 'Link copied!',
        description: 'Tool URL copied to clipboard',
      })
      return
    }

    try {
      await navigator.share({
        title: toolName,
        text: toolDescription,
        url: window.location.href,
      })
    } catch (err) {
      // User cancelled sharing
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="container px-4 py-8">
          <FadeIn>
            <div className="flex items-center space-x-4 mb-6">
              <Link href="/tools">
                <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                  Back to Tools
                </Button>
              </Link>

              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
                <span>/</span>
                <Link href="/tools" className="hover:text-foreground transition-colors">
                  Tools
                </Link>
                <span>/</span>
                <span className="text-foreground">{toolName}</span>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 rounded-lg ${tool?.category?.color || 'bg-blue-500'} flex items-center justify-center`}
                  >
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">{toolName}</h1>
                    <p className="text-muted-foreground">{toolDescription}</p>
                  </div>
                </div>

                {tool && (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${tool.category?.color || 'bg-blue-500'}`} />
                      <span className="text-muted-foreground">{tool.category?.name || 'Tool'}</span>
                    </div>

                    {tool.popular && (
                      <div className="px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-xs font-medium">
                        Popular
                      </div>
                    )}

                    {tool.featured && (
                      <div className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-medium">
                        Featured
                      </div>
                    )}

                    {tool.new && (
                      <div className="px-2 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
                        New
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>

                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      <div className="container px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Tool */}
          <div className="lg:col-span-2 space-y-6">
            <FadeIn delay={200}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{toolName}</span>
                    {onReset && (
                      <Button variant="outline" size="sm" onClick={onReset} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Reset
                      </Button>
                    )}
                  </CardTitle>
                  <CardDescription>{toolDescription}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {children}

                  {/* Result Actions */}
                  {result && (
                    <div className="flex items-center space-x-2 pt-4 border-t">
                      <Button variant="outline" size="sm" onClick={handleCopy} disabled={!result}>
                        <Copy className="h-4 w-4 mr-2" />
                        {isCopied ? 'Copied!' : 'Copy'}
                      </Button>

                      {onDownload && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownload}
                          disabled={!result}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}

                      <div className="flex-1" />

                      <div className="text-xs text-muted-foreground">
                        {result.length} characters
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Examples */}
            {examples.length > 0 && (
              <FadeIn delay={400}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                      Examples
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {examples.map((example, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">{example.title}</h4>
                          {example.action && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={example.action}
                              className="h-6 px-2 text-xs"
                            >
                              Try
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{example.description}</p>
                        <div className="bg-muted rounded p-2 text-xs font-mono">
                          {example.input}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </FadeIn>
            )}

            {/* Tips */}
            {tips.length > 0 && (
              <FadeIn delay={500}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Info className="h-5 w-5 mr-2 text-blue-500" />
                      Tips & Tricks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tips.map((tip, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground flex items-start space-x-2"
                        >
                          <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </FadeIn>
            )}

            {/* Related Tools */}
            <FadeIn delay={600}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Related Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link
                      href="/json-formatter"
                      className="flex items-center space-x-2 text-sm hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>JSON Formatter</span>
                    </Link>
                    <Link
                      href="/base64-encoder"
                      className="flex items-center space-x-2 text-sm hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Base64 Encoder</span>
                    </Link>
                    <Link
                      href="/url-encoder"
                      className="flex items-center space-x-2 text-sm hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>URL Encoder</span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  )
}
