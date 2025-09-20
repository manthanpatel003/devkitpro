'use client'

import React, { useState } from 'react'
import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { 
  Clock, 
  Copy, 
  RefreshCw,
  CheckCircle2
} from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'
import { CronExpression } from '@/types'

export const metadata: Metadata = {
  title: 'Cron Expression Generator - Free Cron Builder',
  description: 'Generate and validate cron expressions. Free cron generator with human-readable descriptions.',
  keywords: ['cron generator', 'cron expression', 'cron builder', 'scheduler', 'cron tool'],
  openGraph: {
    title: 'Cron Expression Generator - Free Cron Builder',
    description: 'Generate and validate cron expressions. Free cron generator with human-readable descriptions.',
  },
}

const presets = [
  { name: 'Every Minute', expression: '* * * * *', description: 'Run every minute' },
  { name: 'Every Hour', expression: '0 * * * *', description: 'Run at the start of every hour' },
  { name: 'Daily', expression: '0 0 * * *', description: 'Run daily at midnight' },
  { name: 'Weekly', expression: '0 0 * * 0', description: 'Run weekly on Sunday at midnight' },
  { name: 'Monthly', expression: '0 0 1 * *', description: 'Run monthly on the 1st at midnight' },
  { name: 'Weekdays', expression: '0 9 * * 1-5', description: 'Run weekdays at 9 AM' },
  { name: 'Every 15 Minutes', expression: '*/15 * * * *', description: 'Run every 15 minutes' },
  { name: 'Every 2 Hours', expression: '0 */2 * * *', description: 'Run every 2 hours' }
]

export default function CronGeneratorPage() {
  const [expression, setExpression] = useState('')
  const [result, setResult] = useState<CronExpression | null>(null)
  const { success, error: showError } = useToast()

  const generateCron = (expr: string): CronExpression => {
    const parts = expr.trim().split(/\s+/)
    if (parts.length !== 5) {
      return {
        expression: expr,
        description: 'Invalid cron expression - must have 5 fields',
        nextRun: [],
        fields: {
          second: '',
          minute: '',
          hour: '',
          day: '',
          month: '',
          weekday: ''
        }
      }
    }

    const [minute, hour, day, month, weekday] = parts
    
    const description = generateDescription(minute, hour, day, month, weekday)
    const nextRun = generateNextRuns(expr)

    return {
      expression: expr,
      description,
      nextRun,
      fields: {
        second: '0',
        minute,
        hour,
        day,
        month,
        weekday
      }
    }
  }

  const generateDescription = (minute: string, hour: string, day: string, month: string, weekday: string): string => {
    let desc = 'Run '
    
    if (minute === '*' && hour === '*' && day === '*' && month === '*' && weekday === '*') {
      return 'Run every minute'
    }
    
    if (minute !== '*' && hour === '*' && day === '*' && month === '*' && weekday === '*') {
      return `Run every hour at minute ${minute}`
    }
    
    if (minute !== '*' && hour !== '*' && day === '*' && month === '*' && weekday === '*') {
      return `Run daily at ${hour}:${minute.padStart(2, '0')}`
    }
    
    if (minute !== '*' && hour !== '*' && day !== '*' && month === '*' && weekday === '*') {
      return `Run monthly on day ${day} at ${hour}:${minute.padStart(2, '0')}`
    }
    
    if (minute !== '*' && hour !== '*' && day === '*' && month === '*' && weekday !== '*') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      if (weekday.includes('-')) {
        const [start, end] = weekday.split('-').map(Number)
        return `Run ${days[start]} through ${days[end]} at ${hour}:${minute.padStart(2, '0')}`
      }
      return `Run on ${days[parseInt(weekday)]} at ${hour}:${minute.padStart(2, '0')}`
    }
    
    return 'Custom schedule'
  }

  const generateNextRuns = (expr: string): string[] => {
    // Simplified next run generation
    const now = new Date()
    const runs = []
    
    for (let i = 0; i < 5; i++) {
      const next = new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000)
      runs.push(next.toLocaleString())
    }
    
    return runs
  }

  const handleGenerate = () => {
    if (!expression.trim()) {
      showError('Please enter a cron expression')
      return
    }

    const result = generateCron(expression)
    setResult(result)
    success('Cron expression analyzed!')
  }

  const handlePreset = (preset: typeof presets[0]) => {
    setExpression(preset.expression)
    const result = generateCron(preset.expression)
    setResult(result)
    success(`Loaded ${preset.name} preset`)
  }

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      success(`${label} copied to clipboard!`)
    } else {
      showError('Failed to copy to clipboard')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cron Expression Generator</h1>
          <p className="text-xl text-gray-600">Generate and validate cron expressions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Cron Expression
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    placeholder="* * * * *"
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    className="font-mono"
                  />
                  <Button onClick={handleGenerate} disabled={!expression.trim()}>
                    Generate Description
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Presets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handlePreset(preset)}
                      className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{preset.name}</div>
                      <div className="text-sm text-gray-600 font-mono">{preset.expression}</div>
                      <div className="text-xs text-gray-500">{preset.description}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {result && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                    Analysis Result
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Expression:</div>
                      <div className="font-mono text-lg bg-gray-50 p-2 rounded">
                        {result.expression}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Description:</div>
                      <div className="text-gray-900">{result.description}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-2">Fields:</div>
                      <div className="grid grid-cols-5 gap-2 text-sm">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-medium">Minute</div>
                          <div className="font-mono">{result.fields.minute}</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-medium">Hour</div>
                          <div className="font-mono">{result.fields.hour}</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-medium">Day</div>
                          <div className="font-mono">{result.fields.day}</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-medium">Month</div>
                          <div className="font-mono">{result.fields.month}</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-medium">Weekday</div>
                          <div className="font-mono">{result.fields.weekday}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleCopy(result.expression, 'Cron Expression')}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Expression
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}