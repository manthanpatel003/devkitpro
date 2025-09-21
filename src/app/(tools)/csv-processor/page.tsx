'use client'

import React, { useState } from 'react'
// Metadata removed - client components cannot export metadata
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { copyToClipboard } from '@/lib/utils'
import { BarChart3, Copy, Download, FileSpreadsheet, Table } from 'lucide-react'

// Metadata removed - client components cannot export metadata

interface CSVData {
  headers: string[]
  rows: string[][]
  totalRows: number
  totalColumns: number
  errors: string[]
}

export default function CSVProcessorPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [csvData, setCsvData] = useState<CSVData | null>(null)
  const [delimiter, setDelimiter] = useState(',')
  const [hasHeader, setHasHeader] = useState(true)
  const { success, error: showError } = useToast()

  const parseCSV = (csvText: string, delimiter: string, hasHeader: boolean): CSVData => {
    const lines = csvText.trim().split('\n')
    const errors: string[] = []

    if (lines.length === 0) {
      errors.push('CSV is empty')
      return { headers: [], rows: [], totalRows: 0, totalColumns: 0, errors }
    }

    const rows: string[][] = []
    let maxColumns = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      try {
        const row = parseCSVLine(line, delimiter)
        rows.push(row)
        maxColumns = Math.max(maxColumns, row.length)
      } catch (err) {
        errors.push(
          `Error parsing line ${i + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`
        )
      }
    }

    if (rows.length === 0) {
      errors.push('No valid rows found')
      return { headers: [], rows: [], totalRows: 0, totalColumns: 0, errors }
    }

    // Check for consistent column count
    const expectedColumns = rows[0].length
    for (let i = 1; i < rows.length; i++) {
      if (rows[i].length !== expectedColumns) {
        errors.push(`Row ${i + 1} has ${rows[i].length} columns, expected ${expectedColumns}`)
      }
    }

    const headers = hasHeader && rows.length > 0 ? rows[0] : []
    const dataRows = hasHeader && rows.length > 0 ? rows.slice(1) : rows

    return {
      headers,
      rows: dataRows,
      totalRows: dataRows.length,
      totalColumns: expectedColumns,
      errors,
    }
  }

  const parseCSVLine = (line: string, delimiter: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    let i = 0

    while (i < line.length) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"'
          i += 2
        } else {
          // Toggle quote state
          inQuotes = !inQuotes
          i++
        }
      } else if (char === delimiter && !inQuotes) {
        // Field separator
        result.push(current.trim())
        current = ''
        i++
      } else {
        current += char
        i++
      }
    }

    // Add the last field
    result.push(current.trim())

    return result
  }

  const formatCSV = (data: CSVData, delimiter: string, hasHeader: boolean): string => {
    const lines: string[] = []

    if (hasHeader && data.headers.length > 0) {
      lines.push(data.headers.map(header => `"${header}"`).join(delimiter))
    }

    data.rows.forEach(row => {
      lines.push(row.map(field => `"${field}"`).join(delimiter))
    })

    return lines.join('\n')
  }

  const processCSV = () => {
    if (!input.trim()) {
      showError('Please enter CSV data to process')
      return
    }

    try {
      const parsed = parseCSV(input, delimiter, hasHeader)
      setCsvData(parsed)

      if (parsed.errors.length > 0) {
        showError(`CSV processed with ${parsed.errors.length} errors`)
      } else {
        success('CSV processed successfully!')
      }

      // Format and set output
      const formatted = formatCSV(parsed, delimiter, hasHeader)
      setOutput(formatted)
    } catch (err) {
      showError(err instanceof Error ? err.message : 'CSV processing failed')
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

  const downloadCSV = () => {
    if (!output) return

    const blob = new Blob([output], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'processed-data.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    success('CSV downloaded!')
  }

  const loadExample = () => {
    const example = `Name,Age,City,Email
John Doe,30,New York,john@example.com
Jane Smith,25,Los Angeles,jane@example.com
Bob Johnson,35,Chicago,bob@example.com`
    setInput(example)
    success('Example loaded!')
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setCsvData(null)
    success('Cleared all data')
  }

  // Auto-process when input changes
  React.useEffect(() => {
    if (input.trim()) {
      processCSV()
    }
  }, [input, delimiter, hasHeader])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">CSV Processor</h1>
          <p className="text-xl text-gray-600">
            Process, validate, and convert CSV data with advanced features
          </p>
        </div>

        {/* Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileSpreadsheet className="w-5 h-5 mr-2 text-blue-600" />
              Processing Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delimiter</label>
                <select
                  value={delimiter}
                  onChange={e => setDelimiter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="\t">Tab</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Row</label>
                <select
                  value={hasHeader ? 'header' : 'data'}
                  onChange={e => setHasHeader(e.target.value === 'header')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="header">Header Row</option>
                  <option value="data">Data Row</option>
                </select>
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
              <CardTitle>CSV Input</CardTitle>
              <CardDescription>Enter your CSV data to process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Name,Age,City&#10;John,30,NYC&#10;Jane,25,LA"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  rows={12}
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
              <CardTitle>Processed CSV</CardTitle>
              <CardDescription>Formatted and validated CSV output</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Processed CSV will appear here..."
                  value={output}
                  readOnly
                  rows={12}
                  className="font-mono text-sm bg-gray-50"
                />

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleCopy(output, 'CSV')}
                    variant="outline"
                    className="flex-1"
                    disabled={!output}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    onClick={downloadCSV}
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

        {/* CSV Analysis */}
        {csvData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                  CSV Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{csvData.totalRows}</div>
                    <div className="text-sm text-blue-600">Total Rows</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{csvData.totalColumns}</div>
                    <div className="text-sm text-green-600">Total Columns</div>
                  </div>
                </div>

                {csvData.headers.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Column Headers</h4>
                    <div className="space-y-1">
                      {csvData.headers.map((header, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {index + 1}. {header}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Errors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Table className="w-5 h-5 mr-2 text-red-600" />
                  Validation Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {csvData.errors.length === 0 ? (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-green-600 font-medium">✓ No errors found</div>
                    <div className="text-sm text-green-600 mt-1">
                      CSV is valid and well-formatted
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-red-600 font-medium">
                      {csvData.errors.length} error(s) found:
                    </div>
                    {csvData.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Data Preview */}
        {csvData && csvData.rows.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Table className="w-5 h-5 mr-2 text-blue-600" />
                Data Preview
              </CardTitle>
              <CardDescription>First 10 rows of your CSV data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  {csvData.headers.length > 0 && (
                    <thead className="bg-gray-50">
                      <tr>
                        {csvData.headers.map((header, index) => (
                          <th
                            key={index}
                            className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {csvData.rows.slice(0, 10).map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-2 text-sm text-gray-700 border-b">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {csvData.rows.length > 10 && (
                <div className="text-center text-sm text-gray-500 mt-2">
                  Showing first 10 rows of {csvData.rows.length} total rows
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileSpreadsheet className="w-5 h-5 mr-2 text-blue-600" />
              CSV Processing Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Supported Features</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Multiple delimiter support (comma, semicolon, tab, pipe)</li>
                  <li>• Header row detection and handling</li>
                  <li>• CSV validation and error reporting</li>
                  <li>• Data preview and statistics</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Processing Capabilities</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Automatic quote handling and escaping</li>
                  <li>• Column count validation</li>
                  <li>• Row-by-row error detection</li>
                  <li>• Formatted output generation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
