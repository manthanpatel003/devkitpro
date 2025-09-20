'use client'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { TOOLS } from '@/lib/constants'
import { downloadFile } from '@/lib/utils'
import { js_beautify } from 'js-beautify'
import { AlertTriangle, BarChart3, CheckCircle, Code2, Minimize, Settings } from 'lucide-react'
import * as React from 'react'

interface MinificationStats {
  originalSize: number
  minifiedSize: number
  compressionRatio: number
  savedBytes: number
  savedPercentage: number
}

export default function JSMinifierPage() {
  const [input, setInput] = React.useState('')
  const [output, setOutput] = React.useState('')
  const [error, setError] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [mode, setMode] = React.useState<'minify' | 'beautify'>('minify')
  const [stats, setStats] = React.useState<MinificationStats | null>(null)
  const [options, setOptions] = React.useState({
    removeComments: true,
    removeWhitespace: true,
    preserveLineBreaks: false,
    mangleVariables: false,
    indentSize: 2,
    maxLineLength: 80,
  })

  const { addToast } = useToast()
  const tool = TOOLS.find(t => t.id === 'js-minifier')!

  // Simple JavaScript minifier (client-side)
  const minifyJS = (code: string): string => {
    let minified = code

    if (options.removeComments) {
      // Remove single-line comments
      minified = minified.replace(/\/\/.*$/gm, '')
      // Remove multi-line comments
      minified = minified.replace(/\/\*[\s\S]*?\*\//g, '')
    }

    if (options.removeWhitespace) {
      // Remove extra whitespace
      minified = minified.replace(/\s+/g, ' ')
      // Remove whitespace around operators
      minified = minified.replace(/\s*([{}();,=+\-*/<>!&|])\s*/g, '$1')
      // Remove whitespace at start and end of lines
      minified = minified.replace(/^\s+|\s+$/gm, '')
    }

    if (!options.preserveLineBreaks) {
      // Remove line breaks
      minified = minified.replace(/\n/g, '')
    }

    return minified.trim()
  }

  const beautifyJS = (code: string): string => {
    return js_beautify(code, {
      indent_size: options.indentSize,
      max_preserve_newlines: 2,
      preserve_newlines: true,
      keep_array_indentation: false,
      break_chained_methods: false,
      indent_scripts: 'normal',
      brace_style: 'collapse',
      space_before_conditional: true,
      unescape_strings: false,
      jslint_happy: false,
      end_with_newline: true,
      wrap_line_length: options.maxLineLength,
      indent_inner_html: false,
      comma_first: false,
      e4x: false,
      indent_empty_lines: false,
    })
  }

  const calculateStats = (original: string, processed: string): MinificationStats => {
    const originalSize = new Blob([original]).size
    const processedSize = new Blob([processed]).size
    const savedBytes = originalSize - processedSize
    const savedPercentage = originalSize > 0 ? (savedBytes / originalSize) * 100 : 0
    const compressionRatio = originalSize > 0 ? processedSize / originalSize : 0

    return {
      originalSize,
      minifiedSize: processedSize,
      compressionRatio,
      savedBytes,
      savedPercentage,
    }
  }

  const processCode = React.useCallback(async () => {
    if (!input.trim()) {
      setError('Please enter some JavaScript code to process')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      let result = ''
      if (mode === 'minify') {
        result = minifyJS(input)
        const statistics = calculateStats(input, result)
        setStats(statistics)
      } else {
        result = beautifyJS(input)
        setStats(null)
      }

      setOutput(result)
      addToast({
        type: 'success',
        title: `JavaScript ${mode === 'minify' ? 'Minified' : 'Beautified'}!`,
        description: `Your code has been successfully ${mode === 'minify' ? 'minified' : 'beautified'}`,
      })
    } catch (err) {
      setError('Error processing JavaScript: ' + (err as Error).message)
      setOutput('')
      setStats(null)
    } finally {
      setIsLoading(false)
    }
  }, [input, mode, options, addToast])

  const handleReset = () => {
    setInput('')
    setOutput('')
    setError('')
    setStats(null)
  }

  const handleDownload = (filename: string, content: string) => {
    const extension = mode === 'minify' ? '.min.js' : '.js'
    const finalFilename = filename.replace('.txt', extension)
    downloadFile(content, finalFilename, 'application/javascript')
  }

  const examples = [
    {
      title: 'Simple Function',
      description: 'Basic JavaScript function with comments',
      input: `// Calculate the sum of two numbers
function calculateSum(a, b) {
    // Return the sum
    return a + b;
}

// Usage example
const result = calculateSum(5, 3);
console.log('Result:', result);`,
      action: () =>
        setInput(`// Calculate the sum of two numbers
function calculateSum(a, b) {
    // Return the sum
    return a + b;
}

// Usage example
const result = calculateSum(5, 3);
console.log('Result:', result);`),
    },
    {
      title: 'Class with Methods',
      description: 'ES6 class with multiple methods',
      input: `class UserManager {
    constructor() {
        this.users = [];
    }
    
    addUser(user) {
        this.users.push(user);
    }
    
    getUser(id) {
        return this.users.find(user => user.id === id);
    }
}`,
      action: () =>
        setInput(`class UserManager {
    constructor() {
        this.users = [];
    }
    
    addUser(user) {
        this.users.push(user);
    }
    
    getUser(id) {
        return this.users.find(user => user.id === id);
    }
}`),
    },
    {
      title: 'Async Function',
      description: 'Modern async/await pattern',
      input: `async function fetchUserData(userId) {
    try {
        const response = await fetch(\`/api/users/\${userId}\`);
        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('Failed to fetch user data:', error);
        throw error;
    }
}`,
      action: () =>
        setInput(`async function fetchUserData(userId) {
    try {
        const response = await fetch(\`/api/users/\${userId}\`);
        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('Failed to fetch user data:', error);
        throw error;
    }
}`),
    },
  ]

  const tips = [
    'Minification reduces file size for faster loading in production',
    'Always keep original source files for debugging and maintenance',
    'Test minified code thoroughly before deploying to production',
    'Use source maps in production for easier debugging',
    'Beautification helps improve code readability and formatting',
    'Consider using build tools like Webpack or Rollup for advanced optimization',
  ]

  return (
    <>
      <Header />
      <main className="flex-1">
        <ToolLayout
          tool={tool}
          result={output}
          isLoading={isLoading}
          onReset={handleReset}
          onDownload={handleDownload}
          examples={examples}
          tips={tips}
        >
          <div className="space-y-6">
            {/* Mode Selection */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium">Mode:</label>
              <div className="flex items-center space-x-2">
                <Button
                  variant={mode === 'minify' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('minify')}
                >
                  <Minimize className="h-4 w-4 mr-2" />
                  Minify
                </Button>
                <Button
                  variant={mode === 'beautify' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('beautify')}
                >
                  <Code2 className="h-4 w-4 mr-2" />
                  Beautify
                </Button>
              </div>
            </div>

            {/* Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Settings className="h-5 w-5 mr-2" />
                  Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mode === 'minify' ? (
                    <>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={options.removeComments}
                          onChange={e =>
                            setOptions(prev => ({ ...prev, removeComments: e.target.checked }))
                          }
                          className="rounded"
                        />
                        <span className="text-sm">Remove Comments</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={options.removeWhitespace}
                          onChange={e =>
                            setOptions(prev => ({ ...prev, removeWhitespace: e.target.checked }))
                          }
                          className="rounded"
                        />
                        <span className="text-sm">Remove Extra Whitespace</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={options.preserveLineBreaks}
                          onChange={e =>
                            setOptions(prev => ({ ...prev, preserveLineBreaks: e.target.checked }))
                          }
                          className="rounded"
                        />
                        <span className="text-sm">Preserve Line Breaks</span>
                      </label>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Indent Size</label>
                        <Input
                          type="number"
                          min="1"
                          max="8"
                          value={options.indentSize}
                          onChange={e =>
                            setOptions(prev => ({ ...prev, indentSize: Number(e.target.value) }))
                          }
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Max Line Length</label>
                        <Input
                          type="number"
                          min="40"
                          max="200"
                          value={options.maxLineLength}
                          onChange={e =>
                            setOptions(prev => ({ ...prev, maxLineLength: Number(e.target.value) }))
                          }
                          className="w-full"
                        />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Input */}
            <div className="space-y-3">
              <label className="text-sm font-medium">JavaScript Code</label>
              <Textarea
                placeholder="Paste your JavaScript code here..."
                value={input}
                onChange={e => setInput(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
                error={error}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={processCode}
                disabled={isLoading || !input.trim()}
                loading={isLoading}
                leftIcon={
                  mode === 'minify' ? (
                    <Minimize className="h-4 w-4" />
                  ) : (
                    <Code2 className="h-4 w-4" />
                  )
                }
              >
                {mode === 'minify' ? 'Minify JavaScript' : 'Beautify JavaScript'}
              </Button>

              <Button
                variant="outline"
                onClick={() => setMode(mode === 'minify' ? 'beautify' : 'minify')}
              >
                Switch to {mode === 'minify' ? 'Beautify' : 'Minify'}
              </Button>
            </div>

            {/* Statistics */}
            {stats && mode === 'minify' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Minification Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats.originalSize}</div>
                      <div className="text-xs text-muted-foreground">Original Size (bytes)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.minifiedSize}</div>
                      <div className="text-xs text-muted-foreground">Minified Size (bytes)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.savedBytes}</div>
                      <div className="text-xs text-muted-foreground">Bytes Saved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {stats.savedPercentage.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Size Reduction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Output */}
            {(output || error) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    {error
                      ? 'Error'
                      : mode === 'minify'
                        ? 'Minified JavaScript'
                        : 'Beautified JavaScript'}
                  </label>
                  {output && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-muted-foreground">
                        {mode === 'minify' ? 'Successfully minified' : 'Successfully beautified'}
                      </span>
                    </div>
                  )}
                </div>
                <Textarea
                  value={error || output}
                  readOnly
                  className={`min-h-[300px] font-mono text-sm ${
                    error ? 'border-destructive text-destructive' : ''
                  }`}
                />
              </div>
            )}

            {/* Warning for Minification */}
            {mode === 'minify' && (
              <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg text-yellow-800 dark:text-yellow-200">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Important Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <p>
                      • This is a basic minifier. For production use, consider tools like Terser or
                      UglifyJS
                    </p>
                    <p>• Always test minified code thoroughly before deployment</p>
                    <p>• Keep original source files for debugging and maintenance</p>
                    <p>• Consider using source maps for easier debugging in production</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ToolLayout>
      </main>
      <Footer />
    </>
  )
}
