'use client'

import React, { useState } from 'react'
// Metadata removed - client components cannot export metadata
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { 
  Database, 
  Copy, 
  Download, 
  Upload,
  FileText,
  Settings
} from 'lucide-react'
import { copyToClipboard, downloadFile } from '@/lib/utils'

// Metadata removed - client components cannot export metadata

export default function SQLFormatterPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [indentSize, setIndentSize] = useState(2)
  const { success, error: showError } = useToast()

  const formatSQL = (sql: string): string => {
    return sql
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\s*([,()])\s*/g, '$1') // Remove spaces around commas and parentheses
      .replace(/(SELECT|FROM|WHERE|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|GROUP BY|ORDER BY|HAVING|UNION|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|EXEC|EXECUTE)\s+/gi, '\n$1 ') // Add line breaks before keywords
      .replace(/\s+ON\s+/gi, '\n  ON ') // Format JOIN conditions
      .replace(/\s+AND\s+/gi, '\n  AND ') // Format AND conditions
      .replace(/\s+OR\s+/gi, '\n  OR ') // Format OR conditions
      .split('\n')
      .map(line => {
        const trimmed = line.trim()
        if (trimmed.match(/^(SELECT|FROM|WHERE|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|GROUP BY|ORDER BY|HAVING|UNION|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|EXEC|EXECUTE)/i)) {
          return trimmed
        }
        if (trimmed.match(/^(ON|AND|OR)/i)) {
          return '  ' + trimmed
        }
        return '    ' + trimmed
      })
      .join('\n')
      .trim()
  }

  const handleFormat = () => {
    if (!input.trim()) {
      showError('Please enter SQL to format')
      return
    }

    const formatted = formatSQL(input)
    setOutput(formatted)
    success('SQL formatted successfully!')
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
    const example = `SELECT u.id, u.name, u.email, p.title, p.content, c.name as category_name FROM users u LEFT JOIN posts p ON u.id = p.user_id LEFT JOIN categories c ON p.category_id = c.id WHERE u.active = 1 AND p.published = 1 ORDER BY u.name, p.created_at DESC`
    setInput(example)
    const formatted = formatSQL(example)
    setOutput(formatted)
    success('Example SQL loaded!')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">SQL Formatter</h1>
          <p className="text-xl text-gray-600">Format and beautify SQL queries</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                SQL Query
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste your SQL query here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                rows={20}
              />
              <div className="mt-4 flex gap-2">
                <Button onClick={handleFormat} disabled={!input.trim()}>
                  Format SQL
                </Button>
                <Button onClick={loadExample} variant="outline">
                  Load Example
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2 text-green-600" />
                Formatted SQL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Formatted SQL will appear here..."
                value={output}
                readOnly
                className="min-h-[400px] font-mono text-sm"
                rows={20}
              />
              {output && (
                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={() => handleCopy(output, 'Formatted SQL')}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    onClick={() => downloadFile(output, `formatted-${Date.now()}.sql`, 'text/plain')}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}