'use client'

import React, { useState } from 'react'
// Metadata removed - client components cannot export metadata
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { copyToClipboard, downloadFile } from '@/lib/utils'
import { Code, Copy, Download, FileText, Minimize, Settings, Upload } from 'lucide-react'

// Metadata removed - client components cannot export metadata

const languages = [
  { value: 'javascript', label: 'JavaScript', extension: 'js' },
  { value: 'css', label: 'CSS', extension: 'css' },
  { value: 'html', label: 'HTML', extension: 'html' },
  { value: 'json', label: 'JSON', extension: 'json' },
  { value: 'xml', label: 'XML', extension: 'xml' },
]

export default function CodeMinifierPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [originalSize, setOriginalSize] = useState(0)
  const [minifiedSize, setMinifiedSize] = useState(0)
  const [compressionRatio, setCompressionRatio] = useState(0)
  const { success, error: showError } = useToast()

  const minifyCode = (code: string, lang: string): string => {
    switch (lang) {
      case 'javascript':
        return minifyJavaScript(code)
      case 'css':
        return minifyCSS(code)
      case 'html':
        return minifyHTML(code)
      case 'json':
        return minifyJSON(code)
      case 'xml':
        return minifyXML(code)
      default:
        return code
    }
  }

  const minifyJavaScript = (code: string): string => {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\s*([{}();,=])\s*/g, '$1') // Remove spaces around operators
      .replace(/;\s*}/g, '}') // Remove semicolons before closing braces
      .trim()
  }

  const minifyCSS = (code: string): string => {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\s*([{}:;,>+~])\s*/g, '$1') // Remove spaces around selectors and properties
      .replace(/;\s*}/g, '}') // Remove semicolons before closing braces
      .replace(/,\s*/g, ',') // Remove spaces after commas
      .trim()
  }

  const minifyHTML = (code: string): string => {
    return code
      .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/>\s+</g, '><') // Remove spaces between tags
      .replace(/\s*=\s*/g, '=') // Remove spaces around equals signs
      .trim()
  }

  const minifyJSON = (code: string): string => {
    try {
      const parsed = JSON.parse(code)
      return JSON.stringify(parsed)
    } catch {
      return code
    }
  }

  const minifyXML = (code: string): string => {
    return code
      .replace(/<!--[\s\S]*?-->/g, '') // Remove XML comments
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/>\s+</g, '><') // Remove spaces between tags
      .trim()
  }

  const handleMinify = () => {
    if (!input.trim()) {
      showError('Please enter code to minify')
      return
    }

    const minified = minifyCode(input, language)
    setOutput(minified)

    const original = new Blob([input]).size
    const minifiedSize = new Blob([minified]).size
    const ratio = Math.round(((original - minifiedSize) / original) * 100)

    setOriginalSize(original)
    setMinifiedSize(minifiedSize)
    setCompressionRatio(Math.max(0, ratio))

    success('Code minified successfully!')
  }

  const handleCopy = async (text: string, label: string) => {
    const copySuccess = await copyToClipboard(text)
    if (copySuccess) {
      success(`${label} copied to clipboard!`)
    } else {
      showError('Failed to copy to clipboard')
    }
  }

  const handleDownload = (content: string, filename: string) => {
    const extension = languages.find(l => l.value === language)?.extension || 'txt'
    downloadFile(content, filename, 'text/plain')
    success('File downloaded successfully!')
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = e => {
        const content = e.target?.result as string
        setInput(content)
        const minified = minifyCode(content, language)
        setOutput(minified)
        success('File loaded and minified!')
      }
      reader.readAsText(file)
    }
  }

  const loadExample = () => {
    const examples = {
      javascript: `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
}`,
      css: `/* Main container styles */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Button styles */
.btn {
  display: inline-block;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Example Page</title>
</head>
<body>
    <h1>Welcome to our website</h1>
    <p>This is an example HTML page.</p>
</body>
</html>`,
    }

    const example = examples[language as keyof typeof examples] || examples.javascript
    setInput(example)
    const minified = minifyCode(example, language)
    setOutput(minified)
    success('Example loaded!')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Code Minifier</h1>
          <p className="text-xl text-gray-600">
            Minify CSS, JavaScript, HTML, and JSON code to reduce file size
          </p>
        </div>

        {/* Language Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2 text-blue-600" />
              Minification Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={loadExample} variant="outline">
                Load Example
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Original Code
                </span>
                <div className="flex space-x-2">
                  <input
                    type="file"
                    accept=".js,.css,.html,.json,.xml"
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
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste your code here..."
                value={input}
                onChange={e => setInput(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                rows={20}
              />
              {input && (
                <div className="mt-2 text-sm text-gray-500">
                  {input.length} characters • {originalSize} bytes
                </div>
              )}
            </CardContent>
          </Card>

          {/* Output */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Minimize className="w-5 h-5 mr-2 text-green-600" />
                Minified Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Minified code will appear here..."
                  value={output}
                  readOnly
                  className="min-h-[400px] font-mono text-sm"
                  rows={20}
                />

                {output && (
                  <div className="space-y-4">
                    {/* Statistics */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="font-medium text-gray-900">{originalSize}</div>
                        <div className="text-gray-600">Original</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="font-medium text-gray-900">{minifiedSize}</div>
                        <div className="text-gray-600">Minified</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="font-medium text-gray-900">{compressionRatio}%</div>
                        <div className="text-gray-600">Reduction</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => handleCopy(output, 'Minified Code')}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        onClick={() =>
                          handleDownload(
                            output,
                            `minified-${Date.now()}.${
                              languages.find(l => l.value === language)?.extension
                            }`
                          )
                        }
                        variant="outline"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Code className="w-5 h-5 mr-2 text-blue-600" />
              Minification Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Performance</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Faster loading times</li>
                  <li>• Reduced bandwidth usage</li>
                  <li>• Better user experience</li>
                  <li>• Lower server costs</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">What Gets Removed</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Comments and whitespace</li>
                  <li>• Unnecessary semicolons</li>
                  <li>• Redundant spaces</li>
                  <li>• Unused code (advanced)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
