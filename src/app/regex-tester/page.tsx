'use client'

import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle,
  Code,
  Copy,
  Download,
  Eye,
  Lightbulb,
  RotateCcw,
  Search,
  Target,
  Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface RegexMatch {
  match: string
  index: number
  groups: string[]
  namedGroups: Record<string, string>
}

interface RegexAnalysis {
  valid: boolean
  error?: string
  matches: RegexMatch[]
  totalMatches: number
  pattern: string
  flags: string
  explanation: string[]
  performance: {
    executionTime: number
    complexity: 'low' | 'medium' | 'high'
  }
}

const REGEX_FLAGS = [
  { flag: 'g', name: 'Global', description: 'Find all matches' },
  { flag: 'i', name: 'Ignore Case', description: 'Case insensitive matching' },
  { flag: 'm', name: 'Multiline', description: '^$ match line breaks' },
  { flag: 's', name: 'Dot All', description: '. matches newlines' },
  { flag: 'u', name: 'Unicode', description: 'Unicode property escapes' },
  { flag: 'y', name: 'Sticky', description: 'Match from lastIndex' },
]

const REGEX_PATTERNS = [
  {
    name: 'Email Address',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    flags: 'g',
    description: 'Matches email addresses',
  },
  {
    name: 'Phone Number (US)',
    pattern: '\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})',
    flags: 'g',
    description: 'Matches US phone numbers',
  },
  {
    name: 'URL',
    pattern:
      'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)',
    flags: 'g',
    description: 'Matches HTTP/HTTPS URLs',
  },
  {
    name: 'IPv4 Address',
    pattern:
      '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    flags: 'g',
    description: 'Matches IPv4 addresses',
  },
  {
    name: 'Credit Card',
    pattern:
      '\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\\b',
    flags: 'g',
    description: 'Matches major credit card numbers',
  },
  {
    name: 'HTML Tags',
    pattern: '<\\/?[a-z][a-z0-9]*[^<>]*>',
    flags: 'gi',
    description: 'Matches HTML tags',
  },
  {
    name: 'Hex Colors',
    pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b',
    flags: 'g',
    description: 'Matches hex color codes',
  },
  {
    name: 'Date (MM/DD/YYYY)',
    pattern: '\\b(0?[1-9]|1[0-2])\\/(0?[1-9]|[12][0-9]|3[01])\\/(19|20)\\d\\d\\b',
    flags: 'g',
    description: 'Matches MM/DD/YYYY date format',
  },
]

const SAMPLE_TEXT = `Contact Information:
Email: john.doe@example.com, jane.smith@company.org
Phone: (555) 123-4567, 555.987.6543, 555-456-7890
Website: https://www.example.com, http://test.site.org

Network Details:
IP Address: 192.168.1.1, 10.0.0.1, 172.16.0.1
Server: web-server-01, db-server-02

Payment Info:
Credit Card: 4532015112830366, 5555555555554444
Expiry: 12/25, 06/28

Colors: #ff0000, #00FF00, #0000ff, #123abc
Dates: 12/25/2023, 01/01/2024, 06/15/2023

HTML: <div class="container mx-auto"><p>Hello World</p></div>
Code: function test() { return true; }
`

const RegexTesterPage = () => {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [testText, setTestText] = useState(SAMPLE_TEXT)
  const [analysis, setAnalysis] = useState<RegexAnalysis | null>(null)
  const [activeTab, setActiveTab] = useState<'matches' | 'explanation' | 'replace'>('matches')
  const [replaceText, setReplaceText] = useState('')
  const [replacedText, setReplacedText] = useState('')

  const { isCopied, copy } = useCopyToClipboard()

  useEffect(() => {
    if (pattern && testText) {
      analyzeRegex()
    } else {
      setAnalysis(null)
      setReplacedText('')
    }
  }, [pattern, flags, testText, replaceText])

  const analyzeRegex = () => {
    try {
      const startTime = performance.now()
      const regex = new RegExp(pattern, flags)
      const matches: RegexMatch[] = []

      if (flags.includes('g')) {
        let match
        while ((match = regex.exec(testText)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            namedGroups: match.groups || {},
          })
          // Prevent infinite loop
          if (match.index === regex.lastIndex) break
        }
      } else {
        const match = regex.exec(testText)
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            namedGroups: match.groups || {},
          })
        }
      }

      const endTime = performance.now()
      const executionTime = endTime - startTime

      // Generate explanation
      const explanation = explainRegex(pattern)

      // Assess complexity
      const complexity = assessComplexity(pattern)

      // Generate replaced text
      if (replaceText !== undefined) {
        try {
          const replaced = testText.replace(regex, replaceText)
          setReplacedText(replaced)
        } catch (error) {
          setReplacedText('Replace error: ' + (error as Error).message)
        }
      }

      const result: RegexAnalysis = {
        valid: true,
        matches,
        totalMatches: matches.length,
        pattern,
        flags,
        explanation,
        performance: {
          executionTime: Math.round(executionTime * 100) / 100,
          complexity,
        },
      }

      setAnalysis(result)
    } catch (error: any) {
      setAnalysis({
        valid: false,
        error: error.message,
        matches: [],
        totalMatches: 0,
        pattern,
        flags,
        explanation: [],
        performance: {
          executionTime: 0,
          complexity: 'low',
        },
      })
      setReplacedText('')
    }
  }

  const explainRegex = (pattern: string): string[] => {
    const explanations: string[] = []

    // Basic pattern analysis
    if (pattern.includes('^')) explanations.push('^ - Matches start of string/line')
    if (pattern.includes('$')) explanations.push('$ - Matches end of string/line')
    if (pattern.includes('\\d')) explanations.push('\\d - Matches any digit (0-9)')
    if (pattern.includes('\\w'))
      explanations.push('\\w - Matches word characters (a-z, A-Z, 0-9, _)')
    if (pattern.includes('\\s')) explanations.push('\\s - Matches whitespace characters')
    if (pattern.includes('.')) explanations.push('. - Matches any character (except newline)')
    if (pattern.includes('*')) explanations.push('* - Matches 0 or more of the preceding element')
    if (pattern.includes('+')) explanations.push('+ - Matches 1 or more of the preceding element')
    if (pattern.includes('?')) explanations.push('? - Matches 0 or 1 of the preceding element')
    if (pattern.includes('|')) explanations.push('| - OR operator (alternation)')
    if (pattern.includes('[]'))
      explanations.push('[] - Character class (matches any character inside)')
    if (pattern.includes('()')) explanations.push('() - Capturing group')
    if (pattern.includes('(?:')) explanations.push('(?:) - Non-capturing group')
    if (pattern.includes('\\b')) explanations.push('\\b - Word boundary')
    if (pattern.includes('{')) explanations.push('{n,m} - Quantifier (between n and m occurrences)')

    // Character classes
    if (pattern.includes('[0-9]')) explanations.push('[0-9] - Matches any digit')
    if (pattern.includes('[a-z]')) explanations.push('[a-z] - Matches any lowercase letter')
    if (pattern.includes('[A-Z]')) explanations.push('[A-Z] - Matches any uppercase letter')
    if (pattern.includes('[a-zA-Z]')) explanations.push('[a-zA-Z] - Matches any letter')

    if (explanations.length === 0) {
      explanations.push('Literal string match - matches the exact characters')
    }

    return explanations
  }

  const assessComplexity = (pattern: string): 'low' | 'medium' | 'high' => {
    let score = 0

    // Add points for complex features
    if (pattern.includes('*') || pattern.includes('+')) score += 1
    if (pattern.includes('(?:') || pattern.includes('(?=') || pattern.includes('(?!')) score += 2
    if (pattern.includes('\\1') || pattern.includes('\\2')) score += 2 // Backreferences
    if (pattern.match(/\{.*,.*\}/)) score += 1 // Quantifiers
    if (pattern.includes('|')) score += 1
    if ((pattern.match(/\(/g) || []).length > 3) score += 2 // Many groups
    if (pattern.length > 50) score += 1

    if (score <= 2) return 'low'
    if (score <= 5) return 'medium'
    return 'high'
  }

  const toggleFlag = (flag: string) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ''))
    } else {
      setFlags(flags + flag)
    }
  }

  const loadPattern = (patternObj: (typeof REGEX_PATTERNS)[0]) => {
    setPattern(patternObj.pattern)
    setFlags(patternObj.flags)
  }

  const clearAll = () => {
    setPattern('')
    setFlags('g')
    setTestText('')
    setReplaceText('')
    setAnalysis(null)
    setReplacedText('')
  }

  const highlightMatches = (text: string, matches: RegexMatch[]) => {
    if (!matches.length) return text

    let result = ''
    let lastIndex = 0

    matches.forEach((match, i) => {
      result += text.slice(lastIndex, match.index)
      result += `<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded" title="Match ${i + 1}: ${match.match}">${match.match}</mark>`
      lastIndex = match.index + match.match.length
    })

    result += text.slice(lastIndex)
    return result
  }

  const downloadResults = () => {
    if (!analysis) return

    const results = {
      pattern: analysis.pattern,
      flags: analysis.flags,
      testText,
      matches: analysis.matches,
      totalMatches: analysis.totalMatches,
      explanation: analysis.explanation,
      performance: analysis.performance,
      timestamp: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `regex-test-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <ToolLayout
      title="Regex Tester & Builder"
      description="Test regular expressions with real-time matching, explanation, and pattern library"
    >
      <div className="space-y-6">
        {/* Pattern Input */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Search className="w-5 h-5" />
            Regular Expression
          </h3>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter your regex pattern..."
                  value={pattern}
                  onChange={e => setPattern(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Flags:</span>
                <div className="flex gap-1">
                  {REGEX_FLAGS.map(flag => (
                    <button
                      key={flag.flag}
                      onClick={() => toggleFlag(flag.flag)}
                      className={`px-2 py-1 text-sm rounded border ${
                        flags.includes(flag.flag)
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      title={flag.description}
                    >
                      {flag.flag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Patterns */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Quick Patterns:</label>
                <Button onClick={clearAll} variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {REGEX_PATTERNS.map((patternObj, index) => (
                  <Button
                    key={index}
                    onClick={() => loadPattern(patternObj)}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {patternObj.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {analysis.valid ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  )}
                  Analysis Results
                </h3>
                <div className="flex items-center gap-2">
                  <Button onClick={downloadResults} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button onClick={() => copy(pattern)} variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    {isCopied ? 'Copied!' : 'Copy Pattern'}
                  </Button>
                </div>
              </div>

              {analysis.valid ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">{analysis.totalMatches}</div>
                      <div className="text-sm text-gray-600">Matches</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-xl font-bold text-green-600">
                        {analysis.performance.executionTime}ms
                      </div>
                      <div className="text-sm text-gray-600">Execution Time</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div
                        className={`text-xl font-bold ${
                          analysis.performance.complexity === 'low'
                            ? 'text-green-600'
                            : analysis.performance.complexity === 'medium'
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }`}
                      >
                        {analysis.performance.complexity.toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-600">Complexity</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-xl font-bold">{analysis.flags || 'none'}</div>
                      <div className="text-sm text-gray-600">Flags</div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8">
                      {[
                        { id: 'matches', label: 'Matches', icon: Target },
                        { id: 'explanation', label: 'Explanation', icon: Lightbulb },
                        { id: 'replace', label: 'Replace', icon: Code },
                      ].map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          onClick={() => setActiveTab(id as any)}
                          className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === id
                              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="mt-4">
                    {activeTab === 'matches' && (
                      <div className="space-y-4">
                        {analysis.matches.length > 0 ? (
                          <div className="space-y-3">
                            {analysis.matches.map((match, index) => (
                              <div
                                key={index}
                                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">Match {index + 1}</span>
                                  <span className="text-sm text-gray-600">
                                    Position: {match.index}
                                  </span>
                                </div>
                                <div className="font-mono text-sm bg-white dark:bg-gray-900 p-2 rounded border">
                                  "{match.match}"
                                </div>
                                {match.groups.length > 0 && (
                                  <div className="mt-2">
                                    <div className="text-sm font-medium mb-1">Capture Groups:</div>
                                    <div className="space-y-1">
                                      {match.groups.map((group, groupIndex) => (
                                        <div key={groupIndex} className="text-sm">
                                          Group {groupIndex + 1}:{' '}
                                          <span className="font-mono">"{group}"</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {Object.keys(match.namedGroups).length > 0 && (
                                  <div className="mt-2">
                                    <div className="text-sm font-medium mb-1">Named Groups:</div>
                                    <div className="space-y-1">
                                      {Object.entries(match.namedGroups).map(([name, value]) => (
                                        <div key={name} className="text-sm">
                                          {name}: <span className="font-mono">"{value}"</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">No matches found</div>
                        )}
                      </div>
                    )}

                    {activeTab === 'explanation' && (
                      <div className="space-y-3">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <h4 className="font-medium mb-2">Pattern Breakdown:</h4>
                          <div className="font-mono text-sm bg-white dark:bg-gray-900 p-2 rounded border">
                            /{analysis.pattern}/{analysis.flags}
                          </div>
                        </div>
                        {analysis.explanation.length > 0 ? (
                          <div className="space-y-2">
                            {analysis.explanation.map((explanation, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                              >
                                <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{explanation}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            No explanation available
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'replace' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Replace With:</label>
                          <Input
                            type="text"
                            placeholder="Replacement text (use $1, $2 for groups)"
                            value={replaceText}
                            onChange={e => setReplaceText(e.target.value)}
                            className="font-mono"
                          />
                          <div className="text-xs text-gray-600 mt-1">
                            Use $1, $2, etc. for capture groups. Use $& for the entire match.
                          </div>
                        </div>
                        {replacedText && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm font-medium">Result:</label>
                              <Button
                                onClick={() => copy(replacedText)}
                                variant="outline"
                                size="sm"
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                {isCopied ? 'Copied!' : 'Copy Result'}
                              </Button>
                            </div>
                            <Textarea
                              value={replacedText}
                              readOnly
                              className="font-mono text-sm"
                              rows={8}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-red-700 font-medium">Invalid Regular Expression</div>
                  <div className="text-red-600 text-sm mt-1">{analysis.error}</div>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Test Text */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Test Text
            </h3>
            <Button onClick={() => setTestText(SAMPLE_TEXT)} variant="outline" size="sm">
              <Zap className="w-4 h-4 mr-2" />
              Load Sample
            </Button>
          </div>

          <Textarea
            value={testText}
            onChange={e => setTestText(e.target.value)}
            placeholder="Enter your test text here..."
            className="font-mono text-sm min-h-[300px]"
          />

          {analysis?.valid && analysis.matches.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Text with Highlighted Matches:</h4>
              <div
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg font-mono text-sm whitespace-pre-wrap border max-h-64 overflow-y-auto"
                dangerouslySetInnerHTML={{
                  __html: highlightMatches(testText, analysis.matches),
                }}
              />
            </div>
          )}
        </Card>
      </div>
    </ToolLayout>
  )
}

export default RegexTesterPage
