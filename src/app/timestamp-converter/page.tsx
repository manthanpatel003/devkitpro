'use client'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { TOOLS } from '@/lib/constants'
import { downloadFile } from '@/lib/utils'
import { Calendar, Clock, Globe, RefreshCw, Zap } from 'lucide-react'
import * as React from 'react'

interface TimestampConversion {
  unix: number
  unixMs: number
  iso: string
  utc: string
  local: string
  relative: string
  formats: {
    [key: string]: string
  }
}

export default function TimestampConverterPage() {
  const [input, setInput] = React.useState('')
  const [inputType, setInputType] = React.useState<'timestamp' | 'date'>('timestamp')
  const [result, setResult] = React.useState<TimestampConversion | null>(null)
  const [timezone, setTimezone] = React.useState('UTC')
  const [customFormat, setCustomFormat] = React.useState('YYYY-MM-DD HH:mm:ss')

  const { addToast } = useToast()
  const tool = TOOLS.find(t => t.id === 'timestamp-converter')!

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Australia/Sydney',
  ]

  const convertTimestamp = React.useCallback(() => {
    if (!input.trim()) {
      setResult(null)
      return
    }

    try {
      let date: Date

      if (inputType === 'timestamp') {
        const timestamp = parseFloat(input)
        if (isNaN(timestamp)) {
          throw new Error('Invalid timestamp')
        }

        // Detect if timestamp is in seconds or milliseconds
        const isMilliseconds = timestamp > 1000000000000 // Year 2001 in milliseconds
        date = new Date(isMilliseconds ? timestamp : timestamp * 1000)
      } else {
        // Parse date string
        date = new Date(input)
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date format')
        }
      }

      const unix = Math.floor(date.getTime() / 1000)
      const unixMs = date.getTime()

      // Format in different ways
      const formats: { [key: string]: string } = {
        'ISO 8601': date.toISOString(),
        'RFC 2822': date.toString(),
        'Unix Timestamp': unix.toString(),
        'Unix Milliseconds': unixMs.toString(),
        'UTC String': date.toUTCString(),
        'Local String': date.toLocaleString(),
        'Date Only': date.toDateString(),
        'Time Only': date.toTimeString(),
        Year: date.getFullYear().toString(),
        Month: (date.getMonth() + 1).toString().padStart(2, '0'),
        Day: date.getDate().toString().padStart(2, '0'),
        Hour: date.getHours().toString().padStart(2, '0'),
        Minute: date.getMinutes().toString().padStart(2, '0'),
        Second: date.getSeconds().toString().padStart(2, '0'),
        'Day of Week': date.toLocaleDateString('en-US', { weekday: 'long' }),
        'Month Name': date.toLocaleDateString('en-US', { month: 'long' }),
      }

      // Calculate relative time
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffSeconds = Math.floor(diffMs / 1000)
      const diffMinutes = Math.floor(diffSeconds / 60)
      const diffHours = Math.floor(diffMinutes / 60)
      const diffDays = Math.floor(diffHours / 24)

      let relative = ''
      if (Math.abs(diffDays) > 0) {
        relative = diffDays > 0 ? `${diffDays} days ago` : `in ${Math.abs(diffDays)} days`
      } else if (Math.abs(diffHours) > 0) {
        relative = diffHours > 0 ? `${diffHours} hours ago` : `in ${Math.abs(diffHours)} hours`
      } else if (Math.abs(diffMinutes) > 0) {
        relative =
          diffMinutes > 0 ? `${diffMinutes} minutes ago` : `in ${Math.abs(diffMinutes)} minutes`
      } else {
        relative = 'just now'
      }

      const conversion: TimestampConversion = {
        unix,
        unixMs,
        iso: date.toISOString(),
        utc: date.toUTCString(),
        local: date.toLocaleString(),
        relative,
        formats,
      }

      setResult(conversion)
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Conversion Error',
        description: (err as Error).message,
      })
      setResult(null)
    }
  }, [input, inputType, addToast])

  React.useEffect(() => {
    convertTimestamp()
  }, [convertTimestamp])

  const setCurrentTime = () => {
    const now = Date.now()
    setInput(
      inputType === 'timestamp' ? Math.floor(now / 1000).toString() : new Date().toISOString()
    )
  }

  const copyValue = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      addToast({
        type: 'success',
        title: 'Copied!',
        description: `${label} copied to clipboard`,
      })
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Copy Failed',
        description: 'Failed to copy to clipboard',
      })
    }
  }

  const handleDownload = () => {
    if (!result) return

    const report = `Timestamp Conversion Report
Generated: ${new Date().toISOString()}

Input: ${input} (${inputType})

=== CONVERSIONS ===
Unix Timestamp: ${result.unix}
Unix Milliseconds: ${result.unixMs}
ISO 8601: ${result.iso}
UTC: ${result.utc}
Local: ${result.local}
Relative: ${result.relative}

=== ALL FORMATS ===
${Object.entries(result.formats)
  .map(([format, value]) => `${format}: ${value}`)
  .join('\n')}
`

    downloadFile(report, 'timestamp-conversion.txt', 'text/plain')
  }

  const examples = [
    {
      title: 'Current Time',
      description: 'Convert current timestamp',
      input: Math.floor(Date.now() / 1000).toString(),
      action: () => {
        setInputType('timestamp')
        setInput(Math.floor(Date.now() / 1000).toString())
      },
    },
    {
      title: 'Unix Epoch',
      description: 'Convert Unix epoch (1970-01-01)',
      input: '0',
      action: () => {
        setInputType('timestamp')
        setInput('0')
      },
    },
    {
      title: 'ISO Date',
      description: 'Convert ISO 8601 date string',
      input: new Date().toISOString(),
      action: () => {
        setInputType('date')
        setInput(new Date().toISOString())
      },
    },
  ]

  const tips = [
    'Unix timestamps are always in UTC timezone',
    'Timestamps can be in seconds or milliseconds - tool auto-detects',
    'ISO 8601 format is the international standard for dates',
    'Always consider timezone when working with timestamps',
    'Use UTC for storing dates in databases',
    'Convert to local time only for display purposes',
  ]

  return (
    <>
      <Header />
      <main className="flex-1">
        <ToolLayout
          tool={tool}
          result={result ? JSON.stringify(result, null, 2) : null}
          onReset={() => {
            setInput('')
            setResult(null)
          }}
          onDownload={handleDownload}
          examples={examples}
          tips={tips}
        >
          <div className="space-y-6">
            {/* Input Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Timestamp Converter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Input Type */}
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium">Input Type:</label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={inputType === 'timestamp' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setInputType('timestamp')}
                    >
                      Unix Timestamp
                    </Button>
                    <Button
                      variant={inputType === 'date' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setInputType('date')}
                    >
                      Date String
                    </Button>
                  </div>
                </div>

                {/* Input Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {inputType === 'timestamp' ? 'Unix Timestamp' : 'Date String'}
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder={
                        inputType === 'timestamp'
                          ? '1640995200 or 1640995200000'
                          : '2024-01-01T00:00:00Z or Jan 1, 2024'
                      }
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      className="flex-1 font-mono"
                      icon={
                        inputType === 'timestamp' ? (
                          <Clock className="h-4 w-4" />
                        ) : (
                          <Calendar className="h-4 w-4" />
                        )
                      }
                    />
                    <Button variant="outline" onClick={setCurrentTime}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Time Display */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-primary mb-1">Current Time</div>
                  <div className="text-sm text-muted-foreground">
                    Unix: {Math.floor(Date.now() / 1000)} • ISO: {new Date().toISOString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conversion Results */}
            {result && (
              <div className="space-y-6">
                {/* Main Formats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Conversion Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted rounded">
                          <div>
                            <div className="font-medium text-sm">Unix Timestamp</div>
                            <div className="text-xs text-muted-foreground">Seconds since epoch</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <code className="text-sm">{result.unix}</code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyValue(result.unix.toString(), 'Unix timestamp')}
                            >
                              <Clock className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted rounded">
                          <div>
                            <div className="font-medium text-sm">Unix Milliseconds</div>
                            <div className="text-xs text-muted-foreground">
                              Milliseconds since epoch
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <code className="text-sm">{result.unixMs}</code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyValue(result.unixMs.toString(), 'Unix milliseconds')
                              }
                            >
                              <Clock className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted rounded">
                          <div>
                            <div className="font-medium text-sm">ISO 8601</div>
                            <div className="text-xs text-muted-foreground">
                              International standard
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <code className="text-sm">{result.iso}</code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyValue(result.iso, 'ISO 8601')}
                            >
                              <Globe className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted rounded">
                          <div>
                            <div className="font-medium text-sm">UTC</div>
                            <div className="text-xs text-muted-foreground">
                              Coordinated Universal Time
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <code className="text-sm">{result.utc}</code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyValue(result.utc, 'UTC')}
                            >
                              <Globe className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted rounded">
                          <div>
                            <div className="font-medium text-sm">Local Time</div>
                            <div className="text-xs text-muted-foreground">Your timezone</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <code className="text-sm">{result.local}</code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyValue(result.local, 'Local time')}
                            >
                              <Calendar className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted rounded">
                          <div>
                            <div className="font-medium text-sm">Relative Time</div>
                            <div className="text-xs text-muted-foreground">Human readable</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{result.relative}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* All Formats */}
                <Card>
                  <CardHeader>
                    <CardTitle>All Date Formats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(result.formats).map(([format, value]) => (
                        <div
                          key={format}
                          className="flex items-center justify-between p-2 border rounded text-sm"
                        >
                          <span className="font-medium">{format}:</span>
                          <div className="flex items-center space-x-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded max-w-[200px] truncate">
                              {value}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyValue(value, format)}
                              className="h-6 w-6 p-0"
                            >
                              <Clock className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Timezone Conversions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="h-5 w-5 mr-2" />
                      Timezone Conversions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {timezones.map(tz => {
                        const date = new Date(result.unixMs)
                        const timeInTz = date.toLocaleString('en-US', {
                          timeZone: tz,
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: false,
                        })

                        return (
                          <div
                            key={tz}
                            className="p-3 border rounded hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-sm">{tz.replace('_', ' ')}</div>
                                <div className="text-xs text-muted-foreground font-mono">
                                  {timeInTz}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyValue(timeInTz, tz)}
                                className="h-6 w-6 p-0"
                              >
                                <Clock className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto p-3"
                    onClick={() => {
                      setInputType('timestamp')
                      setInput('0')
                    }}
                  >
                    <div className="text-center">
                      <div className="font-medium text-sm">Unix Epoch</div>
                      <div className="text-xs text-muted-foreground">Jan 1, 1970</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-3"
                    onClick={() => {
                      setInputType('timestamp')
                      setInput('1000000000')
                    }}
                  >
                    <div className="text-center">
                      <div className="font-medium text-sm">Billion Seconds</div>
                      <div className="text-xs text-muted-foreground">Sep 9, 2001</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-3"
                    onClick={() => {
                      setInputType('date')
                      setInput('2024-01-01T00:00:00Z')
                    }}
                  >
                    <div className="text-center">
                      <div className="font-medium text-sm">New Year 2024</div>
                      <div className="text-xs text-muted-foreground">Jan 1, 2024</div>
                    </div>
                  </Button>

                  <Button variant="outline" className="h-auto p-3" onClick={setCurrentTime}>
                    <div className="text-center">
                      <div className="font-medium text-sm">Right Now</div>
                      <div className="text-xs text-muted-foreground">Current time</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Timestamp Information */}
            <Card className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center text-lg text-green-800 dark:text-green-200">
                  <Calendar className="h-5 w-5 mr-2" />
                  About Timestamps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                  <p>
                    • <strong>Unix Timestamp:</strong> Seconds since January 1, 1970 00:00:00 UTC
                  </p>
                  <p>
                    • <strong>ISO 8601:</strong> International standard date format
                    (YYYY-MM-DDTHH:mm:ssZ)
                  </p>
                  <p>
                    • <strong>UTC:</strong> Coordinated Universal Time, the global time standard
                  </p>
                  <p>
                    • <strong>Epoch:</strong> The starting point for Unix time (Jan 1, 1970)
                  </p>
                  <p>
                    • <strong>Milliseconds:</strong> More precise timestamps used in JavaScript
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </ToolLayout>
      </main>
      <Footer />
    </>
  )
}
