'use client'

import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle,
  Code,
  Copy,
  Download,
  Eye,
  RotateCcw,
  Search,
  Upload,
  Zap,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface JSONAnalysis {
  valid: boolean
  error?: string
  size: number
  lines: number
  depth: number
  keys: number
  arrays: number
  objects: number
  types: Record<string, number>
  duplicateKeys: string[]
  largeArrays: Array<{ path: string; size: number }>
}

const JSONFormatterPage = () => {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [analysis, setAnalysis] = useState<JSONAnalysis | null>(null)
  const [mode, setMode] = useState<'format' | 'minify' | 'validate'>('format')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'editor' | 'tree' | 'table'>('editor')
  const [indentSize, setIndentSize] = useState(2)
  const [sortKeys, setSortKeys] = useState(false)
  const [escapeUnicode, setEscapeUnicode] = useState(false)

  const { isCopied, copy } = useCopyToClipboard()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (input.trim()) {
      processJSON()
    } else {
      setOutput('')
      setAnalysis(null)
    }
  }, [input, mode, indentSize, sortKeys, escapeUnicode])

  const processJSON = () => {
    try {
      if (!input.trim()) {
        setOutput('')
        setAnalysis(null)
        return
      }

      const parsed = JSON.parse(input)
      const analysis = analyzeJSON(parsed, input)
      setAnalysis(analysis)

      let processed: string
      switch (mode) {
        case 'format':
          processed = JSON.stringify(sortKeys ? sortObjectKeys(parsed) : parsed, null, indentSize)
          break
        case 'minify':
          processed = JSON.stringify(sortKeys ? sortObjectKeys(parsed) : parsed)
          break
        case 'validate':
          processed = analysis.valid ? 'Valid JSON ✓' : `Invalid JSON: ${analysis.error}`
          break
        default:
          processed = JSON.stringify(parsed, null, indentSize)
      }

      if (escapeUnicode && mode !== 'validate') {
        processed = processed.replace(/[\u0080-\uFFFF]/g, match => {
          return '\\u' + ('0000' + match.charCodeAt(0).toString(16)).substr(-4)
        })
      }

      setOutput(processed)
    } catch (error: any) {
      const analysis: JSONAnalysis = {
        valid: false,
        error: error.message,
        size: input.length,
        lines: input.split('\n').length,
        depth: 0,
        keys: 0,
        arrays: 0,
        objects: 0,
        types: {},
        duplicateKeys: [],
        largeArrays: [],
      }
      setAnalysis(analysis)
      setOutput(mode === 'validate' ? `Invalid JSON: ${error.message}` : '')
    }
  }

  const analyzeJSON = (obj: any, originalText: string): JSONAnalysis => {
    const analysis: JSONAnalysis = {
      valid: true,
      size: originalText.length,
      lines: originalText.split('\n').length,
      depth: 0,
      keys: 0,
      arrays: 0,
      objects: 0,
      types: {},
      duplicateKeys: [],
      largeArrays: [],
    }

    const traverse = (value: any, depth = 0, path = '') => {
      analysis.depth = Math.max(analysis.depth, depth)

      if (Array.isArray(value)) {
        analysis.arrays++
        if (value.length > 100) {
          analysis.largeArrays.push({ path, size: value.length })
        }
        value.forEach((item, index) => traverse(item, depth + 1, `${path}[${index}]`))
      } else if (value && typeof value === 'object') {
        analysis.objects++
        const keys = Object.keys(value)
        analysis.keys += keys.length

        // Check for duplicate keys (simplified)
        const keySet = new Set(keys)
        if (keySet.size !== keys.length) {
          analysis.duplicateKeys.push(path)
        }

        keys.forEach(key => {
          const newPath = path ? `${path}.${key}` : key
          traverse(value[key], depth + 1, newPath)
        })
      } else {
        const type = value === null ? 'null' : typeof value
        analysis.types[type] = (analysis.types[type] || 0) + 1
      }
    }

    traverse(obj)
    return analysis
  }

  const sortObjectKeys = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(sortObjectKeys)
    } else if (obj && typeof obj === 'object') {
      const sorted: any = {}
      Object.keys(obj)
        .sort()
        .forEach(key => {
          sorted[key] = sortObjectKeys(obj[key])
        })
      return sorted
    }
    return obj
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = e => {
        const content = e.target?.result as string
        setInput(content)
      }
      reader.readAsText(file)
    }
  }

  const downloadJSON = () => {
    if (!output) return

    const blob = new Blob([output], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `formatted-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setAnalysis(null)
    setSearchTerm('')
  }

  const formatSampleJSON = () => {
    const sample = {
      name: 'John Doe',
      age: 30,
      email: 'john@example.com',
      address: {
        street: '123 Main St',
        city: 'New York',
        country: 'USA',
      },
      hobbies: ['reading', 'swimming', 'coding'],
      active: true,
      joinDate: '2023-01-15T10:30:00Z',
      metadata: null,
    }
    setInput(JSON.stringify(sample))
  }

  const highlightSearch = (text: string) => {
    if (!searchTerm) return text

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
  }

  const renderTreeView = (obj: any, depth = 0): JSX.Element => {
    const indent = '  '.repeat(depth)

    if (Array.isArray(obj)) {
      return (
        <div>
          <span className="text-gray-500">[</span>
          {obj.map((item, index) => (
            <div key={index} className="ml-4">
              <span className="text-blue-600">{index}:</span> {renderTreeView(item, depth + 1)}
              {index < obj.length - 1 && <span className="text-gray-500">,</span>}
            </div>
          ))}
          <span className="text-gray-500">]</span>
        </div>
      )
    } else if (obj && typeof obj === 'object') {
      const keys = Object.keys(obj)
      return (
        <div>
          <span className="text-gray-500">{'{'}</span>
          {keys.map((key, index) => (
            <div key={key} className="ml-4">
              <span className="text-purple-600">"{key}":</span>{' '}
              {renderTreeView(obj[key], depth + 1)}
              {index < keys.length - 1 && <span className="text-gray-500">,</span>}
            </div>
          ))}
          <span className="text-gray-500">{'}'}</span>
        </div>
      )
    } else {
      const className =
        typeof obj === 'string'
          ? 'text-green-600'
          : typeof obj === 'number'
            ? 'text-blue-600'
            : typeof obj === 'boolean'
              ? 'text-orange-600'
              : obj === null
                ? 'text-gray-500'
                : ''

      return <span className={className}>{JSON.stringify(obj)}</span>
    }
  }

  return (
    <ToolLayout
      title="Advanced JSON Formatter"
      description="Format, validate, minify JSON with syntax highlighting and advanced analysis"
    >
      <div className="space-y-6">
        {/* Controls */}
        <Card className="p-6">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Mode:</label>
              <select
                value={mode}
                onChange={e => setMode(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="format">Format</option>
                <option value="minify">Minify</option>
                <option value="validate">Validate</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">View:</label>
              <select
                value={viewMode}
                onChange={e => setViewMode(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="editor">Editor</option>
                <option value="tree">Tree</option>
                <option value="table">Table</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Indent:</label>
              <select
                value={indentSize}
                onChange={e => setIndentSize(parseInt(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={8}>8 spaces</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={sortKeys}
                onChange={e => setSortKeys(e.target.checked)}
              />
              Sort Keys
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={escapeUnicode}
                onChange={e => setEscapeUnicode(e.target.checked)}
              />
              Escape Unicode
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={formatSampleJSON} variant="outline" size="sm">
              <Zap className="w-4 h-4 mr-2" />
              Load Sample
            </Button>

            <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </Button>

            <Button onClick={downloadJSON} variant="outline" size="sm" disabled={!output}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>

            <Button onClick={() => copy(output)} variant="outline" size="sm" disabled={!output}>
              <Copy className="w-4 h-4 mr-2" />
              {isCopied ? 'Copied!' : 'Copy'}
            </Button>

            <Button onClick={clearAll} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </Card>

        {/* Analysis Panel */}
        {analysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                {analysis.valid ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
                JSON Analysis
              </h3>

              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">{analysis.size}</div>
                  <div className="text-sm text-gray-600">Characters</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-xl font-bold text-green-600">{analysis.lines}</div>
                  <div className="text-sm text-gray-600">Lines</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">{analysis.depth}</div>
                  <div className="text-sm text-gray-600">Max Depth</div>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-xl font-bold text-orange-600">{analysis.keys}</div>
                  <div className="text-sm text-gray-600">Total Keys</div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Structure</h4>
                  <div className="text-sm space-y-1">
                    <div>Objects: {analysis.objects}</div>
                    <div>Arrays: {analysis.arrays}</div>
                    <div>
                      Status:{' '}
                      <span className={analysis.valid ? 'text-green-600' : 'text-red-600'}>
                        {analysis.valid ? 'Valid' : 'Invalid'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Data Types</h4>
                  <div className="text-sm space-y-1">
                    {Object.entries(analysis.types).map(([type, count]) => (
                      <div key={type}>
                        {type}: {count}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Warnings</h4>
                  <div className="text-sm space-y-1">
                    {analysis.largeArrays.length > 0 && (
                      <div className="text-yellow-600">Large arrays detected</div>
                    )}
                    {analysis.duplicateKeys.length > 0 && (
                      <div className="text-yellow-600">Duplicate keys found</div>
                    )}
                    {analysis.depth > 10 && (
                      <div className="text-yellow-600">Deep nesting detected</div>
                    )}
                    {Object.keys(analysis.types).length === 0 && analysis.valid && (
                      <div className="text-green-600">No issues detected</div>
                    )}
                  </div>
                </div>
              </div>

              {!analysis.valid && analysis.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-red-700 font-medium">Error:</div>
                  <div className="text-red-600 text-sm mt-1">{analysis.error}</div>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Editor */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Code className="w-5 h-5" />
                Input JSON
              </h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-1 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
            </div>

            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste your JSON here..."
              className="font-mono text-sm min-h-[400px] resize-y"
              style={{ whiteSpace: 'pre' }}
            />
          </Card>

          {/* Output */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Eye className="w-5 h-5" />
                {mode === 'format'
                  ? 'Formatted JSON'
                  : mode === 'minify'
                    ? 'Minified JSON'
                    : 'Validation Result'}
              </h3>
              <div className="flex items-center gap-2">
                {analysis?.valid && (
                  <span className="text-green-600 text-sm flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Valid
                  </span>
                )}
              </div>
            </div>

            {viewMode === 'editor' && (
              <Textarea
                ref={outputRef}
                value={output}
                readOnly
                className="font-mono text-sm min-h-[400px] resize-y"
                style={{ whiteSpace: 'pre' }}
              />
            )}

            {viewMode === 'tree' && output && analysis?.valid && (
              <div className="border rounded-lg p-4 min-h-[400px] overflow-auto bg-gray-50 dark:bg-gray-900">
                <div className="font-mono text-sm">
                  {(() => {
                    try {
                      const parsed = JSON.parse(input)
                      return renderTreeView(parsed)
                    } catch {
                      return <div className="text-red-500">Invalid JSON</div>
                    }
                  })()}
                </div>
              </div>
            )}

            {viewMode === 'table' && output && analysis?.valid && (
              <div className="border rounded-lg p-4 min-h-[400px] overflow-auto">
                <div className="text-sm">
                  {(() => {
                    try {
                      const parsed = JSON.parse(input)
                      if (Array.isArray(parsed)) {
                        const keys = parsed.length > 0 ? Object.keys(parsed[0]) : []
                        return (
                          <table className="w-full border-collapse">
                            <thead>
                              <tr>
                                {keys.map(key => (
                                  <th
                                    key={key}
                                    className="border p-2 text-left bg-gray-100 dark:bg-gray-800"
                                  >
                                    {key}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {parsed.slice(0, 100).map((row: any, index: number) => (
                                <tr key={index}>
                                  {keys.map(key => (
                                    <td key={key} className="border p-2">
                                      {typeof row[key] === 'object'
                                        ? JSON.stringify(row[key])
                                        : String(row[key])}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )
                      } else {
                        return <div>Table view is only available for JSON arrays</div>
                      }
                    } catch {
                      return <div className="text-red-500">Invalid JSON</div>
                    }
                  })()}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </ToolLayout>
  )
}

export default JSONFormatterPage
