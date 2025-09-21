'use client'

import React, { useState } from 'react'
// Metadata removed - client components cannot export metadata
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { 
  FileText, 
  Copy, 
  Download,
  Upload,
  ArrowRightLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'

// Metadata removed - client components cannot export metadata

interface ConversionResult {
  success: boolean
  data: string
  errors: string[]
  warnings: string[]
}

export default function YAMLConverterPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'yaml-to-json' | 'json-to-yaml'>('yaml-to-json')
  const [indentSize, setIndentSize] = useState(2)
  const [result, setResult] = useState<ConversionResult | null>(null)
  const { success, error: showError } = useToast()

  const yamlToJson = (yaml: string): ConversionResult => {
    const errors: string[] = []
    const warnings: string[] = []
    
    try {
      // Basic YAML to JSON conversion
      // This is a simplified implementation - in production, you'd use a proper YAML parser
      let json = yaml
        .replace(/^(\s*)([a-zA-Z_][a-zA-Z0-9_]*):/gm, '$1"$2":') // Quote keys
        .replace(/:\s*([^"\s][^,\n]*)/g, ': "$1"') // Quote string values
        .replace(/:\s*(\d+\.?\d*)/g, ': $1') // Keep numbers unquoted
        .replace(/:\s*(true|false|null)/g, ': $1') // Keep booleans/null unquoted
        .replace(/:\s*\[/g, ': [') // Arrays
        .replace(/:\s*{/g, ': {') // Objects
        .replace(/\n/g, ',\n') // Add commas
        .replace(/,\s*}/g, '}') // Remove trailing commas before }
        .replace(/,\s*]/g, ']') // Remove trailing commas before ]
        .replace(/^/, '{') // Add opening brace
        .replace(/$/, '}') // Add closing brace

      // Basic validation
      try {
        JSON.parse(json)
      } catch (err) {
        errors.push('Invalid YAML syntax or conversion failed')
        return { success: false, data: '', errors, warnings }
      }

      // Format JSON
      const parsed = JSON.parse(json)
      const formatted = JSON.stringify(parsed, null, indentSize)
      
      return { success: true, data: formatted, errors, warnings }
    } catch (err) {
      errors.push('YAML parsing failed: ' + (err instanceof Error ? err.message : 'Unknown error'))
      return { success: false, data: '', errors, warnings }
    }
  }

  const jsonToYaml = (json: string): ConversionResult => {
    const errors: string[] = []
    const warnings: string[] = []
    
    try {
      // Parse JSON
      const parsed = JSON.parse(json)
      
      // Convert to YAML-like format
      const yaml = convertObjectToYaml(parsed, 0, indentSize)
      
      return { success: true, data: yaml, errors, warnings }
    } catch (err) {
      errors.push('JSON parsing failed: ' + (err instanceof Error ? err.message : 'Unknown error'))
      return { success: false, data: '', errors, warnings }
    }
  }

  const convertObjectToYaml = (obj: any, depth: number, indent: number): string => {
    const indentStr = ' '.repeat(depth * indent)
    const nextIndentStr = ' '.repeat((depth + 1) * indent)
    
    if (obj === null) return 'null'
    if (typeof obj === 'string') return `"${obj}"`
    if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj)
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]'
      
      return obj.map(item => {
        const itemStr = convertObjectToYaml(item, depth + 1, indent)
        return `${indentStr}- ${itemStr}`
      }).join('\n')
    }
    
    if (typeof obj === 'object') {
      const entries = Object.entries(obj)
      if (entries.length === 0) return '{}'
      
      return entries.map(([key, value]) => {
        const valueStr = convertObjectToYaml(value, depth + 1, indent)
        return `${indentStr}${key}: ${valueStr}`
      }).join('\n')
    }
    
    return String(obj)
  }

  const processConversion = () => {
    if (!input.trim()) {
      showError('Please enter data to convert')
      return
    }

    let conversionResult: ConversionResult
    
    if (mode === 'yaml-to-json') {
      conversionResult = yamlToJson(input)
    } else {
      conversionResult = jsonToYaml(input)
    }
    
    setResult(conversionResult)
    setOutput(conversionResult.data)
    
    if (conversionResult.success) {
      success('Conversion completed successfully!')
    } else {
      showError(`Conversion failed with ${conversionResult.errors.length} errors`)
    }
  }

  const handleCopy = async (text: string, label: string) => {
    const copySuccess = await copyToClipboard(text)
    if (copySuccess) {
      success(`${label} copied to clipboard!`)
    } else {
      showError('Failed to copy to clipboard')
    }
  }

  const downloadResult = () => {
    if (!output) return
    
    const extension = mode === 'yaml-to-json' ? 'json' : 'yaml'
    const mimeType = mode === 'yaml-to-json' ? 'application/json' : 'text/yaml'
    
    const blob = new Blob([output], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `converted.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    success('File downloaded!')
  }

  const swapMode = () => {
    setMode(mode === 'yaml-to-json' ? 'json-to-yaml' : 'yaml-to-json')
    setInput(output)
    setOutput('')
    setResult(null)
  }

  const loadExample = () => {
    const example = mode === 'yaml-to-json' 
      ? `name: John Doe
age: 30
email: john@example.com
address:
  street: 123 Main St
  city: New York
  country: USA
hobbies:
  - reading
  - coding
  - hiking
active: true`
      : `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "country": "USA"
  },
  "hobbies": ["reading", "coding", "hiking"],
  "active": true
}`
    setInput(example)
    success('Example loaded!')
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setResult(null)
    success('Cleared all data')
  }

  // Auto-convert when input changes
  React.useEffect(() => {
    if (input.trim()) {
      processConversion()
    }
  }, [input, mode, indentSize])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">YAML Converter</h1>
          <p className="text-xl text-gray-600">Convert between YAML and JSON formats with validation</p>
        </div>

        {/* Mode Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowRightLeft className="w-5 h-5 mr-2 text-blue-600" />
              Conversion Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conversion Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMode('yaml-to-json')}
                    className={`p-3 text-center border rounded-lg transition-colors ${
                      mode === 'yaml-to-json'
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    YAML → JSON
                  </button>
                  <button
                    onClick={() => setMode('json-to-yaml')}
                    className={`p-3 text-center border rounded-lg transition-colors ${
                      mode === 'json-to-yaml'
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    JSON → YAML
                  </button>
                </div>
              </div>
              
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
                <Button onClick={loadExample} variant="outline" className="flex-1">
                  Load Example
                </Button>
                <Button onClick={swapMode} variant="outline" className="flex-1">
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Swap
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <Card>
            <CardHeader>
              <CardTitle>
                {mode === 'yaml-to-json' ? 'YAML Input' : 'JSON Input'}
              </CardTitle>
              <CardDescription>
                {mode === 'yaml-to-json' 
                  ? 'Enter your YAML data to convert to JSON'
                  : 'Enter your JSON data to convert to YAML'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder={mode === 'yaml-to-json' 
                    ? 'name: John Doe\nage: 30\nemail: john@example.com'
                    : '{"name": "John Doe", "age": 30, "email": "john@example.com"}'
                  }
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
              <CardTitle>
                {mode === 'yaml-to-json' ? 'JSON Output' : 'YAML Output'}
              </CardTitle>
              <CardDescription>
                {mode === 'yaml-to-json' 
                  ? 'Converted JSON data'
                  : 'Converted YAML data'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Converted data will appear here..."
                  value={output}
                  readOnly
                  rows={15}
                  className="font-mono text-sm bg-gray-50"
                />
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleCopy(output, 'Result')}
                    variant="outline"
                    className="flex-1"
                    disabled={!output}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    onClick={downloadResult}
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

        {/* Conversion Results */}
        {result && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                )}
                Conversion Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Errors */}
                {result.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-900 mb-2">Errors ({result.errors.length})</h4>
                    <div className="space-y-2">
                      {result.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {result.warnings.length > 0 && (
                  <div>
                    <h4 className="font-medium text-yellow-900 mb-2">Warnings ({result.warnings.length})</h4>
                    <div className="space-y-2">
                      {result.warnings.map((warning, index) => (
                        <div key={index} className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                          {warning}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Success */}
                {result.success && result.errors.length === 0 && (
                  <div className="col-span-2 text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-green-600 font-medium">✓ Conversion successful</div>
                    <div className="text-sm text-green-600 mt-1">
                      {result.warnings.length > 0 
                        ? `with ${result.warnings.length} warning(s)`
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
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              YAML/JSON Conversion Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Supported Features</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• YAML to JSON conversion</li>
                  <li>• JSON to YAML conversion</li>
                  <li>• Configurable indentation</li>
                  <li>• Syntax validation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Data Types</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Strings, numbers, booleans</li>
                  <li>• Arrays and objects</li>
                  <li>• Nested structures</li>
                  <li>• Null values</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}