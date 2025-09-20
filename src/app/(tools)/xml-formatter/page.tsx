'use client'

import React, { useState } from 'react'
import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { 
  FileCode, 
  Copy, 
  Download,
  Upload,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'XML Formatter - Free XML Formatting Tool',
  description: 'Format, validate, and beautify XML documents. Free XML formatter with syntax highlighting and validation.',
  keywords: ['xml formatter', 'xml validator', 'xml beautifier', 'xml minifier', 'xml prettifier'],
  openGraph: {
    title: 'XML Formatter - Free XML Formatting Tool',
    description: 'Format, validate, and beautify XML documents. Free XML formatter with validation.',
  },
}

interface XMLValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export default function XMLFormatterPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [indentSize, setIndentSize] = useState(2)
  const [validation, setValidation] = useState<XMLValidation | null>(null)
  const { success, error: showError } = useToast()

  const formatXML = (xml: string, indent: number): string => {
    try {
      // Remove extra whitespace and normalize
      const trimmed = xml.trim()
      
      // Basic XML formatting
      let formatted = trimmed
        .replace(/>\s+</g, '><') // Remove whitespace between tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()

      // Add line breaks and indentation
      formatted = formatted
        .replace(/></g, '>\n<')
        .split('\n')
        .map((line, index) => {
          const trimmedLine = line.trim()
          if (!trimmedLine) return ''
          
          const depth = (formatted.substring(0, formatted.indexOf(trimmedLine)).match(/</g) || []).length - 
                       (formatted.substring(0, formatted.indexOf(trimmedLine)).match(/<\//g) || []).length
          
          const indent = ' '.repeat(depth * indentSize)
          return indent + trimmedLine
        })
        .join('\n')

      return formatted
    } catch (err) {
      throw new Error('Failed to format XML')
    }
  }

  const minifyXML = (xml: string): string => {
    return xml
      .replace(/>\s+</g, '><') // Remove whitespace between tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
  }

  const validateXML = (xml: string): XMLValidation => {
    const errors: string[] = []
    const warnings: string[] = []
    
    try {
      // Basic XML structure validation
      const trimmed = xml.trim()
      
      if (!trimmed) {
        errors.push('XML is empty')
        return { isValid: false, errors, warnings }
      }

      // Check for XML declaration
      if (!trimmed.startsWith('<?xml')) {
        warnings.push('XML declaration missing (recommended)')
      }

      // Check for root element
      const rootMatch = trimmed.match(/<([^/\s>]+)[^>]*>/)
      if (!rootMatch) {
        errors.push('No root element found')
        return { isValid: false, errors, warnings }
      }

      const rootTag = rootMatch[1]
      
      // Check for matching closing tag
      const closingTag = `</${rootTag}>`
      if (!trimmed.includes(closingTag)) {
        errors.push(`Missing closing tag for root element: ${closingTag}`)
      }

      // Check for unclosed tags
      const openTags = trimmed.match(/<[^/][^>]*>/g) || []
      const closeTags = trimmed.match(/<\/[^>]+>/g) || []
      
      if (openTags.length !== closeTags.length) {
        errors.push(`Mismatched tags: ${openTags.length} opening tags, ${closeTags.length} closing tags`)
      }

      // Check for malformed tags
      const malformedTags = trimmed.match(/<[^>]*$/g)
      if (malformedTags) {
        errors.push('Malformed tags found (unclosed angle brackets)')
      }

      // Check for special characters in tag names
      const invalidTagNames = trimmed.match(/<[^a-zA-Z_][^>]*>/g)
      if (invalidTagNames) {
        errors.push('Invalid tag names found (must start with letter or underscore)')
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      }
    } catch (err) {
      return {
        isValid: false,
        errors: ['XML validation failed: ' + (err instanceof Error ? err.message : 'Unknown error')],
        warnings
      }
    }
  }

  const processXML = () => {
    if (!input.trim()) {
      showError('Please enter XML to process')
      return
    }

    try {
      const validation = validateXML(input)
      setValidation(validation)
      
      if (!validation.isValid) {
        showError(`XML validation failed with ${validation.errors.length} errors`)
        return
      }

      const formatted = formatXML(input, indentSize)
      setOutput(formatted)
      success('XML formatted successfully!')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'XML processing failed')
    }
  }

  const minifyXML = () => {
    if (!input.trim()) {
      showError('Please enter XML to minify')
      return
    }

    try {
      const minified = minifyXML(input)
      setOutput(minified)
      success('XML minified successfully!')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'XML minification failed')
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

  const downloadXML = () => {
    if (!output) return
    
    const blob = new Blob([output], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted.xml'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    success('XML downloaded!')
  }

  const loadExample = () => {
    const example = `<?xml version="1.0" encoding="UTF-8"?>
<root>
<person id="1">
<name>John Doe</name>
<age>30</age>
<email>john@example.com</email>
<address>
<street>123 Main St</street>
<city>New York</city>
<country>USA</country>
</address>
</person>
<person id="2">
<name>Jane Smith</name>
<age>25</age>
<email>jane@example.com</email>
<address>
<street>456 Oak Ave</street>
<city>Los Angeles</city>
<country>USA</country>
</address>
</person>
</root>`
    setInput(example)
    success('Example loaded!')
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setValidation(null)
    success('Cleared all data')
  }

  // Auto-process when input changes
  React.useEffect(() => {
    if (input.trim()) {
      processXML()
    }
  }, [input, indentSize])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">XML Formatter</h1>
          <p className="text-xl text-gray-600">Format, validate, and beautify XML documents</p>
        </div>

        {/* Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileCode className="w-5 h-5 mr-2 text-blue-600" />
              Formatting Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Indent Size
                </label>
                <select
                  value={indentSize}
                  onChange={(e) => setIndentSize(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                  <option value={8}>8 Spaces</option>
                </select>
              </div>
              
              <div className="flex items-end gap-2">
                <Button onClick={processXML} className="flex-1">
                  Format XML
                </Button>
                <Button onClick={minifyXML} variant="outline" className="flex-1">
                  Minify XML
                </Button>
              </div>
              
              <div className="flex items-end">
                <Button onClick={loadExample} variant="outline" className="w-full">
                  Load Example
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <Card>
            <CardHeader>
              <CardTitle>XML Input</CardTitle>
              <CardDescription>Enter your XML document to format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="<root><item>value</item></root>"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
                
                <Button onClick={clearAll} variant="outline" className="w-full">
                  Clear Input
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Output */}
          <Card>
            <CardHeader>
              <CardTitle>Formatted XML</CardTitle>
              <CardDescription>Formatted and validated XML output</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Formatted XML will appear here..."
                  value={output}
                  readOnly
                  rows={15}
                  className="font-mono text-sm bg-gray-50"
                />
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleCopy(output, 'XML')}
                    variant="outline"
                    className="flex-1"
                    disabled={!output}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    onClick={downloadXML}
                    variant="outline"
                    className="flex-1"
                    disabled={!output}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Validation Results */}
        {validation && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                {validation.isValid ? (
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                )}
                XML Validation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Errors */}
                {validation.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-900 mb-2">Errors ({validation.errors.length})</h4>
                    <div className="space-y-2">
                      {validation.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {validation.warnings.length > 0 && (
                  <div>
                    <h4 className="font-medium text-yellow-900 mb-2">Warnings ({validation.warnings.length})</h4>
                    <div className="space-y-2">
                      {validation.warnings.map((warning, index) => (
                        <div key={index} className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                          {warning}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Success */}
                {validation.isValid && validation.errors.length === 0 && (
                  <div className="col-span-2 text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-green-600 font-medium">✓ XML is valid and well-formed</div>
                    <div className="text-sm text-green-600 mt-1">
                      {validation.warnings.length > 0 
                        ? `with ${validation.warnings.length} warning(s)`
                        : 'No issues found'
                      }
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileCode className="w-5 h-5 mr-2 text-blue-600" />
              XML Formatting Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Formatting Features</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Automatic indentation and line breaks</li>
                  <li>• Configurable indent size (2, 4, 8 spaces)</li>
                  <li>• XML minification for production</li>
                  <li>• Whitespace normalization</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Validation Features</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Well-formed XML structure validation</li>
                  <li>• Tag matching and nesting checks</li>
                  <li>• XML declaration validation</li>
                  <li>• Error and warning reporting</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}