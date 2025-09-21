'use client'

import { useEffect, useState } from 'react'
// Metadata removed - client components cannot export metadata
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { copyToClipboard } from '@/lib/utils'
import { CheckCircle2, Code, Copy, FileText, Info, Search, Settings, XCircle } from 'lucide-react'

// Metadata removed - client components cannot export metadata

interface RegexMatch {
  match: string
  index: number
  groups: string[]
  namedGroups: Record<string, string>
}

interface RegexResult {
  valid: boolean
  error?: string
  matches: RegexMatch[]
  globalMatches: RegexMatch[]
  testString: string
  pattern: string
  flags: string
  explanation: string
}

const commonPatterns = [
  {
    name: 'Email',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    description: 'Valid email address',
  },
  {
    name: 'Phone (US)',
    pattern: '^\\+?1?[-.\\s]?\\(?[0-9]{3}\\)?[-.\\s]?[0-9]{3}[-.\\s]?[0-9]{4}$',
    description: 'US phone number',
  },
  {
    name: 'URL',
    pattern:
      '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
    description: 'Valid URL',
  },
  {
    name: 'IPv4',
    pattern:
      '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
    description: 'IPv4 address',
  },
  {
    name: 'Date (MM/DD/YYYY)',
    pattern: '^(0[1-9]|1[0-2])\\/(0[1-9]|[12][0-9]|3[01])\\/(19|20)\\d{2}$',
    description: 'Date in MM/DD/YYYY format',
  },
  {
    name: 'Credit Card',
    pattern:
      '^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$',
    description: 'Credit card number',
  },
  {
    name: 'Password (Strong)',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    description: 'Strong password (8+ chars, upper, lower, digit, special)',
  },
  {
    name: 'Hex Color',
    pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
    description: 'Hexadecimal color code',
  },
]

const regexFlags = [
  { flag: 'g', name: 'Global', description: 'Find all matches, not just the first' },
  { flag: 'i', name: 'Case Insensitive', description: 'Case-insensitive matching' },
  { flag: 'm', name: 'Multiline', description: '^ and $ match line breaks' },
  { flag: 's', name: 'Dot All', description: '. matches newline characters' },
  { flag: 'u', name: 'Unicode', description: 'Handle Unicode properly' },
  { flag: 'y', name: 'Sticky', description: 'Matches only from lastIndex position' },
]

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState('')
  const [testString, setTestString] = useState('')
  const [flags, setFlags] = useState('gi')
  const [result, setResult] = useState<RegexResult | null>(null)
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null)
  const { success, error: showError } = useToast()

  const testRegex = (pattern: string, testString: string, flags: string): RegexResult => {
    try {
      const regex = new RegExp(pattern, flags)
      const matches: RegexMatch[] = []
      const globalMatches: RegexMatch[] = []

      // Test single match
      const singleMatch = regex.exec(testString)
      if (singleMatch) {
        matches.push({
          match: singleMatch[0],
          index: singleMatch.index,
          groups: singleMatch.slice(1),
          namedGroups: singleMatch.groups || {},
        })
      }

      // Test global matches
      if (flags.includes('g')) {
        let match
        const globalRegex = new RegExp(pattern, flags)
        while ((match = globalRegex.exec(testString)) !== null) {
          globalMatches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            namedGroups: match.groups || {},
          })

          // Prevent infinite loop
          if (match.index === globalRegex.lastIndex) {
            globalRegex.lastIndex++
          }
        }
      }

      const explanation = generateExplanation(pattern)

      return {
        valid: true,
        matches,
        globalMatches,
        testString,
        pattern,
        flags,
        explanation,
      }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid regex pattern',
        matches: [],
        globalMatches: [],
        testString,
        pattern,
        flags,
        explanation: '',
      }
    }
  }

  const generateExplanation = (pattern: string): string => {
    const explanations: string[] = []

    // Basic character explanations
    if (pattern.includes('^')) explanations.push('^ - Start of string')
    if (pattern.includes('$')) explanations.push('$ - End of string')
    if (pattern.includes('.')) explanations.push('. - Any character (except newline)')
    if (pattern.includes('*')) explanations.push('* - Zero or more of the preceding element')
    if (pattern.includes('+')) explanations.push('+ - One or more of the preceding element')
    if (pattern.includes('?')) explanations.push('? - Zero or one of the preceding element')
    if (pattern.includes('|')) explanations.push('| - OR operator')
    if (pattern.includes('[]')) explanations.push('[] - Character class')
    if (pattern.includes('[^]')) explanations.push('[^] - Negated character class')
    if (pattern.includes('()')) explanations.push('() - Grouping')
    if (pattern.includes('\\d')) explanations.push('\\d - Digit (0-9)')
    if (pattern.includes('\\w')) explanations.push('\\w - Word character (a-z, A-Z, 0-9, _)')
    if (pattern.includes('\\s')) explanations.push('\\s - Whitespace character')
    if (pattern.includes('\\b')) explanations.push('\\b - Word boundary')

    return explanations.join('\n')
  }

  const handleTest = () => {
    if (!pattern.trim()) {
      showError('Please enter a regex pattern')
      return
    }

    if (!testString.trim()) {
      showError('Please enter test text')
      return
    }

    const result = testRegex(pattern, testString, flags)
    setResult(result)

    if (result.valid) {
      const matchCount = result.globalMatches.length || result.matches.length
      success(`Regex test completed! Found ${matchCount} match(es)`)
    } else {
      showError('Invalid Regex', result.error)
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

  const loadPattern = (patternData: (typeof commonPatterns)[0]) => {
    setPattern(patternData.pattern)
    setSelectedPattern(patternData.name)
    success(`Loaded ${patternData.name} pattern`)
  }

  const toggleFlag = (flag: string) => {
    const newFlags = flags.includes(flag) ? flags.replace(flag, '') : flags + flag
    setFlags(newFlags)
  }

  // Auto-test when pattern or test string changes
  useEffect(() => {
    if (pattern.trim() && testString.trim()) {
      const result = testRegex(pattern, testString, flags)
      setResult(result)
    }
  }, [pattern, testString, flags])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Regex Tester & Builder</h1>
          <p className="text-xl text-gray-600">
            Test and debug regular expressions with real-time matching and explanation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Pattern Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="w-5 h-5 mr-2 text-blue-600" />
                  Regular Expression Pattern
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    placeholder="Enter your regex pattern here..."
                    value={pattern}
                    onChange={e => setPattern(e.target.value)}
                    className="font-mono"
                    icon={<Code className="w-5 h-5" />}
                  />

                  {/* Flags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Flags:</label>
                    <div className="flex flex-wrap gap-2">
                      {regexFlags.map(flagData => (
                        <button
                          key={flagData.flag}
                          onClick={() => toggleFlag(flagData.flag)}
                          className={`px-3 py-1 text-sm rounded border transition-colors ${
                            flags.includes(flagData.flag)
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                          title={flagData.description}
                        >
                          {flagData.flag}
                        </button>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Current flags: {flags || 'none'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test String Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-green-600" />
                  Test String
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter text to test against the regex pattern..."
                  value={testString}
                  onChange={e => setTestString(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                  rows={8}
                />
              </CardContent>
            </Card>

            {/* Common Patterns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-purple-600" />
                  Common Patterns
                </CardTitle>
                <CardDescription>Click to load common regex patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {commonPatterns.map(patternData => (
                    <button
                      key={patternData.name}
                      onClick={() => loadPattern(patternData)}
                      className={`p-3 text-left border rounded-lg transition-colors ${
                        selectedPattern === patternData.name
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-sm text-gray-900">{patternData.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{patternData.description}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                  Test Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-4">
                    {/* Validation Status */}
                    <div className="flex items-center space-x-2">
                      {result.valid ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          result.valid ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {result.valid ? 'Valid Pattern' : 'Invalid Pattern'}
                      </span>
                      {result.error && (
                        <span className="text-sm text-red-600">- {result.error}</span>
                      )}
                    </div>

                    {/* Matches */}
                    {result.valid && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Matches ({result.globalMatches.length || result.matches.length}):
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {(result.globalMatches.length > 0
                            ? result.globalMatches
                            : result.matches
                          ).map((match, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-mono text-sm text-gray-900">
                                  "{match.match}"
                                </span>
                                <span className="text-xs text-gray-500">
                                  Position: {match.index}
                                </span>
                              </div>
                              {match.groups.length > 0 && (
                                <div className="text-xs text-gray-600">
                                  Groups:{' '}
                                  {match.groups
                                    .map((group, i) => `$${i + 1}="${group}"`)
                                    .join(', ')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {result.valid && (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => handleCopy(pattern, 'Regex Pattern')}
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Pattern
                        </Button>
                        <Button
                          onClick={() => handleCopy(testString, 'Test String')}
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Text
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Enter a pattern and test string to see results</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Explanation */}
            {result && result.valid && result.explanation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Info className="w-5 h-5 mr-2 text-blue-600" />
                    Pattern Explanation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                    {result.explanation}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Regex Cheat Sheet */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="w-5 h-5 mr-2 text-purple-600" />
                  Quick Reference
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Basic Patterns</h4>
                    <div className="space-y-1 text-gray-600">
                      <div>
                        <code className="bg-gray-100 px-1 rounded">.</code> Any character
                      </div>
                      <div>
                        <code className="bg-gray-100 px-1 rounded">^</code> Start of string
                      </div>
                      <div>
                        <code className="bg-gray-100 px-1 rounded">$</code> End of string
                      </div>
                      <div>
                        <code className="bg-gray-100 px-1 rounded">*</code> Zero or more
                      </div>
                      <div>
                        <code className="bg-gray-100 px-1 rounded">+</code> One or more
                      </div>
                      <div>
                        <code className="bg-gray-100 px-1 rounded">?</code> Zero or one
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Character Classes</h4>
                    <div className="space-y-1 text-gray-600">
                      <div>
                        <code className="bg-gray-100 px-1 rounded">\d</code> Digit
                      </div>
                      <div>
                        <code className="bg-gray-100 px-1 rounded">\w</code> Word character
                      </div>
                      <div>
                        <code className="bg-gray-100 px-1 rounded">\s</code> Whitespace
                      </div>
                      <div>
                        <code className="bg-gray-100 px-1 rounded">[abc]</code> Any of a, b, c
                      </div>
                      <div>
                        <code className="bg-gray-100 px-1 rounded">[^abc]</code> Not a, b, c
                      </div>
                      <div>
                        <code className="bg-gray-100 px-1 rounded">[a-z]</code> Lowercase letter
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
