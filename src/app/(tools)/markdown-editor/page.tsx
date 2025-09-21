'use client'

import React, { useState } from 'react'
// Metadata removed - client components cannot export metadata
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { copyToClipboard, downloadFile } from '@/lib/utils'
import { MarkdownData } from '@/types'
import { Code, Copy, Download, Eye, FileText, Upload } from 'lucide-react'

// Metadata removed - client components cannot export metadata

// Simple markdown parser (in production, use a proper markdown library)
const parseMarkdown = (markdown: string): MarkdownData => {
  const lines = markdown.split('\n')
  const toc: Array<{ level: number; text: string; id: string }> = []
  const links: string[] = []
  const images: string[] = []

  let html = markdown
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
    .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/`(.*)`/gim, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, (match, text, url) => {
      links.push(url)
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`
    })
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, (match, alt, src) => {
      images.push(src)
      return `<img src="${src}" alt="${alt}" style="max-width: 100%; height: auto;" />`
    })
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    .replace(/\n\n/gim, '</p><p>')
    .replace(/\n/gim, '<br>')

  // Wrap in paragraphs
  html = `<p>${html}</p>`

  // Extract TOC from headings
  lines.forEach(line => {
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const text = headingMatch[2]
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      toc.push({ level, text, id })
    }
  })

  const wordCount = markdown.split(/\s+/).filter(word => word.length > 0).length
  const readingTime = Math.ceil(wordCount / 200) // Assuming 200 words per minute

  return {
    html,
    toc,
    wordCount,
    readingTime,
    links,
    images,
  }
}

export default function MarkdownEditorPage() {
  const [markdown, setMarkdown] = useState('')
  const [parsedData, setParsedData] = useState<MarkdownData | null>(null)
  const [viewMode, setViewMode] = useState<'split' | 'preview' | 'edit'>('split')
  const { success, error: showError } = useToast()

  const handleMarkdownChange = (value: string) => {
    setMarkdown(value)
    const parsed = parseMarkdown(value)
    setParsedData(parsed)
  }

  const handleCopy = async (text: string, label: string) => {
    const copySuccess = await copyToClipboard(text)
    if (copySuccess) {
      success(`${label} copied to clipboard!`)
    } else {
      showError('Failed to copy to clipboard')
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = e => {
        const content = e.target?.result as string
        setMarkdown(content)
        const parsed = parseMarkdown(content)
        setParsedData(parsed)
        success('Markdown file loaded!')
      }
      reader.readAsText(file)
    }
  }

  const loadExample = () => {
    const example = `# Markdown Editor

This is a **live markdown editor** with real-time preview.

## Features

- Real-time preview
- Syntax highlighting
- Table of contents
- Export options

### Code Example

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Links and Images

[Visit our website](https://example.com)

![Sample Image](https://via.placeholder.com/300x200)

### Lists

- Item 1
- Item 2
- Item 3

1. First item
2. Second item
3. Third item

> This is a blockquote

---

**Bold text** and *italic text*`

    setMarkdown(example)
    const parsed = parseMarkdown(example)
    setParsedData(parsed)
    success('Example loaded!')
  }

  const clearAll = () => {
    setMarkdown('')
    setParsedData(null)
    success('Cleared all content')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Markdown Editor</h1>
          <p className="text-xl text-gray-600">Edit and preview Markdown in real-time</p>
        </div>

        {/* Toolbar */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex border rounded-lg">
                  <button
                    onClick={() => setViewMode('edit')}
                    className={`px-3 py-1 text-sm font-medium rounded-l-lg transition-colors ${
                      viewMode === 'edit'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Code className="w-4 h-4 mr-1 inline" />
                    Edit
                  </button>
                  <button
                    onClick={() => setViewMode('split')}
                    className={`px-3 py-1 text-sm font-medium transition-colors ${
                      viewMode === 'split'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Split
                  </button>
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`px-3 py-1 text-sm font-medium rounded-r-lg transition-colors ${
                      viewMode === 'preview'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Eye className="w-4 h-4 mr-1 inline" />
                    Preview
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept=".md,.markdown,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" type="button">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </label>
                <Button onClick={loadExample} variant="outline" size="sm">
                  Example
                </Button>
                <Button onClick={clearAll} variant="outline" size="sm">
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          {(viewMode === 'edit' || viewMode === 'split') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Markdown Editor
                </CardTitle>
                <CardDescription>
                  {parsedData &&
                    `${parsedData.wordCount} words • ${parsedData.readingTime} min read`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Start writing your Markdown here..."
                  value={markdown}
                  onChange={e => handleMarkdownChange(e.target.value)}
                  className="min-h-[500px] font-mono text-sm"
                  rows={20}
                />
              </CardContent>
            </Card>
          )}

          {/* Preview */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-green-600" />
                  Live Preview
                </CardTitle>
                <CardDescription>Real-time preview of your Markdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="min-h-[500px] max-h-[500px] overflow-y-auto">
                  {parsedData ? (
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: parsedData.html }}
                    />
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Start typing to see the preview</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Table of Contents */}
        {parsedData && parsedData.toc.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Table of Contents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {parsedData.toc.map((item, index) => (
                  <div
                    key={index}
                    className={`text-sm ${
                      item.level === 1
                        ? 'font-semibold'
                        : item.level === 2
                        ? 'ml-4'
                        : item.level === 3
                        ? 'ml-8'
                        : 'ml-12'
                    }`}
                  >
                    <a href={`#${item.id}`} className="text-blue-600 hover:text-blue-800">
                      {item.text}
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {parsedData && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => handleCopy(markdown, 'Markdown')}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Markdown
                </Button>
                <Button
                  onClick={() => handleCopy(parsedData.html, 'HTML')}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy HTML
                </Button>
                <Button
                  onClick={() =>
                    downloadFile(markdown, `markdown-${Date.now()}.md`, 'text/markdown')
                  }
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download MD
                </Button>
                <Button
                  onClick={() =>
                    downloadFile(parsedData.html, `html-${Date.now()}.html`, 'text/html')
                  }
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download HTML
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Markdown Cheat Sheet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Basic Syntax</h4>
                <div className="space-y-1 font-mono text-gray-600">
                  <div># Heading 1</div>
                  <div>## Heading 2</div>
                  <div>**Bold text**</div>
                  <div>*Italic text*</div>
                  <div>`Code`</div>
                  <div>[Link](url)</div>
                  <div>![Image](url)</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Lists & More</h4>
                <div className="space-y-1 font-mono text-gray-600">
                  <div>- List item</div>
                  <div>1. Numbered item</div>
                  <div>&gt; Blockquote</div>
                  <div>--- (Horizontal rule)</div>
                  <div>``` (Code block)</div>
                  <div>| Table |</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
