'use client'

import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Copy,
  Download,
  Eye,
  EyeOff,
  Key,
  Lock,
  RefreshCw,
  Target,
  Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface PasswordOptions {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
  excludeSimilar: boolean
  excludeAmbiguous: boolean
  customCharset: string
  useCustom: boolean
}

interface PasswordStrength {
  score: number
  level: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong'
  feedback: string[]
  entropy: number
  crackTime: string
  color: string
}

interface GeneratedPassword {
  password: string
  strength: PasswordStrength
  timestamp: number
}

const PasswordGeneratorPage = () => {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
    customCharset: '',
    useCustom: false,
  })
  const [currentPassword, setCurrentPassword] = useState('')
  const [passwordHistory, setPasswordHistory] = useState<GeneratedPassword[]>([])
  const [showPassword, setShowPassword] = useState(true)
  const [batchCount, setBatchCount] = useState(1)
  const [batchPasswords, setBatchPasswords] = useState<string[]>([])
  const [strength, setStrength] = useState<PasswordStrength | null>(null)

  const { isCopied, copy } = useCopyToClipboard()

  useEffect(() => {
    if (currentPassword) {
      const passwordStrength = analyzePasswordStrength(currentPassword)
      setStrength(passwordStrength)
    } else {
      setStrength(null)
    }
  }, [currentPassword])

  const generatePassword = (): string => {
    let charset = ''

    if (options.useCustom && options.customCharset) {
      charset = options.customCharset
    } else {
      if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
      if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      if (options.numbers) charset += '0123456789'
      if (options.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'

      if (options.excludeSimilar) {
        charset = charset.replace(/[il1Lo0O]/g, '')
      }

      if (options.excludeAmbiguous) {
        charset = charset.replace(/[{}[\]()\/\\'"~,;<>.]/g, '')
      }
    }

    if (charset.length === 0) {
      throw new Error('No characters available with current settings')
    }

    // Use cryptographically secure random generation
    const array = new Uint8Array(options.length)
    crypto.getRandomValues(array)

    return Array.from(array, byte => charset[byte % charset.length]).join('')
  }

  const handleGenerate = () => {
    try {
      const password = generatePassword()
      setCurrentPassword(password)

      // Add to history
      const newEntry: GeneratedPassword = {
        password,
        strength: analyzePasswordStrength(password),
        timestamp: Date.now(),
      }

      setPasswordHistory(prev => [newEntry, ...prev.slice(0, 9)]) // Keep last 10
    } catch (error: any) {
      console.error('Password generation failed:', error)
    }
  }

  const generateBatch = () => {
    try {
      const passwords: string[] = []
      for (let i = 0; i < batchCount; i++) {
        passwords.push(generatePassword())
      }
      setBatchPasswords(passwords)
    } catch (error: any) {
      console.error('Batch generation failed:', error)
    }
  }

  const analyzePasswordStrength = (password: string): PasswordStrength => {
    let score = 0
    const feedback: string[] = []

    // Length scoring
    if (password.length >= 12) score += 25
    else if (password.length >= 8) score += 15
    else if (password.length >= 6) score += 10
    else feedback.push('Password is too short (minimum 8 characters)')

    // Character variety
    if (/[a-z]/.test(password)) score += 5
    else feedback.push('Add lowercase letters')

    if (/[A-Z]/.test(password)) score += 5
    else feedback.push('Add uppercase letters')

    if (/[0-9]/.test(password)) score += 5
    else feedback.push('Add numbers')

    if (/[^a-zA-Z0-9]/.test(password)) score += 10
    else feedback.push('Add special characters')

    // Pattern analysis
    if (!/(.)\1{2,}/.test(password)) score += 10
    else feedback.push('Avoid repeating characters')

    if (!/012|123|234|345|456|567|678|789|890|abc|bcd|cde|def/.test(password.toLowerCase()))
      score += 10
    else feedback.push('Avoid sequential characters')

    // Common patterns
    if (!/password|123456|qwerty|admin|login/.test(password.toLowerCase())) score += 10
    else feedback.push('Avoid common words and patterns')

    // Bonus for length
    if (password.length >= 16) score += 10
    if (password.length >= 20) score += 5

    // Calculate entropy
    let charsetSize = 0
    if (/[a-z]/.test(password)) charsetSize += 26
    if (/[A-Z]/.test(password)) charsetSize += 26
    if (/[0-9]/.test(password)) charsetSize += 10
    if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32

    const entropy = password.length * Math.log2(charsetSize)

    // Estimate crack time
    const combinations = Math.pow(charsetSize, password.length)
    const crackTime = estimateCrackTime(combinations)

    // Determine level and color
    let level: PasswordStrength['level']
    let color: string

    if (score >= 80) {
      level = 'Very Strong'
      color = 'text-green-600'
    } else if (score >= 60) {
      level = 'Strong'
      color = 'text-green-600'
    } else if (score >= 40) {
      level = 'Good'
      color = 'text-blue-600'
    } else if (score >= 25) {
      level = 'Fair'
      color = 'text-yellow-600'
    } else if (score >= 15) {
      level = 'Weak'
      color = 'text-orange-600'
    } else {
      level = 'Very Weak'
      color = 'text-red-600'
    }

    return {
      score: Math.min(100, score),
      level,
      feedback,
      entropy: Math.round(entropy),
      crackTime,
      color,
    }
  }

  const estimateCrackTime = (combinations: number): string => {
    // Assume 1 billion guesses per second
    const guessesPerSecond = 1e9
    const secondsToCrack = combinations / (2 * guessesPerSecond) // Average case

    if (secondsToCrack < 1) return 'Instantly'
    if (secondsToCrack < 60) return `${Math.round(secondsToCrack)} seconds`
    if (secondsToCrack < 3600) return `${Math.round(secondsToCrack / 60)} minutes`
    if (secondsToCrack < 86400) return `${Math.round(secondsToCrack / 3600)} hours`
    if (secondsToCrack < 31536000) return `${Math.round(secondsToCrack / 86400)} days`
    if (secondsToCrack < 31536000000) return `${Math.round(secondsToCrack / 31536000)} years`
    return 'Centuries'
  }

  const downloadPasswords = () => {
    const content = batchPasswords.length > 0 ? batchPasswords.join('\n') : currentPassword

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `passwords-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const updateOption = <K extends keyof PasswordOptions>(key: K, value: PasswordOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <ToolLayout
      title="Secure Password Generator"
      description="Generate cryptographically secure passwords with strength analysis and customization"
    >
      <div className="space-y-6">
        {/* Password Display */}
        {currentPassword && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Generated Password
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowPassword(!showPassword)}
                    variant="outline"
                    size="sm"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button onClick={() => copy(currentPassword)} variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    {isCopied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div
                  className={`font-mono text-lg p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 ${
                    strength?.level === 'Very Strong'
                      ? 'border-green-500'
                      : strength?.level === 'Strong'
                        ? 'border-green-400'
                        : strength?.level === 'Good'
                          ? 'border-blue-400'
                          : strength?.level === 'Fair'
                            ? 'border-yellow-400'
                            : 'border-red-400'
                  } break-all`}
                >
                  {showPassword ? currentPassword : '•'.repeat(currentPassword.length)}
                </div>
              </div>

              {strength && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Strength: </span>
                    <span className={`font-bold ${strength.color}`}>{strength.level}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        strength.score >= 80
                          ? 'bg-green-500'
                          : strength.score >= 60
                            ? 'bg-blue-500'
                            : strength.score >= 40
                              ? 'bg-yellow-500'
                              : strength.score >= 25
                                ? 'bg-orange-500'
                                : 'bg-red-500'
                      }`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>Score: {strength.score}/100</span>
                    <span>Entropy: {strength.entropy} bits</span>
                    <span>Crack Time: {strength.crackTime}</span>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Generator Options */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Password Options
          </h3>

          <div className="space-y-6">
            {/* Length */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">Password Length</label>
                <span className="text-sm text-gray-600">{options.length} characters</span>
              </div>
              <input
                type="range"
                min="4"
                max="128"
                value={options.length}
                onChange={e => updateOption('length', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>4</span>
                <span>32</span>
                <span>64</span>
                <span>128</span>
              </div>
            </div>

            {/* Character Sets */}
            <div>
              <label className="text-sm font-medium mb-3 block">Character Sets</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.uppercase}
                    onChange={e => updateOption('uppercase', e.target.checked)}
                    className="rounded"
                  />
                  <div>
                    <div className="font-medium">Uppercase (A-Z)</div>
                    <div className="text-xs text-gray-600">26 characters</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.lowercase}
                    onChange={e => updateOption('lowercase', e.target.checked)}
                    className="rounded"
                  />
                  <div>
                    <div className="font-medium">Lowercase (a-z)</div>
                    <div className="text-xs text-gray-600">26 characters</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.numbers}
                    onChange={e => updateOption('numbers', e.target.checked)}
                    className="rounded"
                  />
                  <div>
                    <div className="font-medium">Numbers (0-9)</div>
                    <div className="text-xs text-gray-600">10 characters</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.symbols}
                    onChange={e => updateOption('symbols', e.target.checked)}
                    className="rounded"
                  />
                  <div>
                    <div className="font-medium">Symbols (!@#$)</div>
                    <div className="text-xs text-gray-600">32 characters</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Advanced Options */}
            <div>
              <label className="text-sm font-medium mb-3 block">Advanced Options</label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={options.excludeSimilar}
                    onChange={e => updateOption('excludeSimilar', e.target.checked)}
                    className="rounded"
                  />
                  <div>
                    <span className="font-medium">Exclude similar characters</span>
                    <div className="text-xs text-gray-600">Removes i, l, 1, L, o, 0, O</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={options.excludeAmbiguous}
                    onChange={e => updateOption('excludeAmbiguous', e.target.checked)}
                    className="rounded"
                  />
                  <div>
                    <span className="font-medium">Exclude ambiguous characters</span>
                    <div className="text-xs text-gray-600">Removes {}[]()\/'"~,;&lt;&gt;</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={options.useCustom}
                    onChange={e => updateOption('useCustom', e.target.checked)}
                    className="rounded"
                  />
                  <span className="font-medium">Use custom character set</span>
                </label>

                {options.useCustom && (
                  <Input
                    type="text"
                    placeholder="Enter custom characters..."
                    value={options.customCharset}
                    onChange={e => updateOption('customCharset', e.target.value)}
                    className="font-mono"
                  />
                )}
              </div>
            </div>

            {/* Generation Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleGenerate} className="flex-1 sm:flex-none">
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate Password
              </Button>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={batchCount}
                  onChange={e => setBatchCount(parseInt(e.target.value) || 1)}
                  className="w-16 text-center"
                />
                <Button onClick={generateBatch} variant="outline">
                  <Zap className="w-4 h-4 mr-2" />
                  Batch Generate
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Strength Analysis */}
        {strength && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Strength Analysis
              </h3>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{strength.score}</div>
                  <div className="text-sm text-gray-600">Strength Score</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{strength.entropy}</div>
                  <div className="text-sm text-gray-600">Entropy (bits)</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">{strength.crackTime}</div>
                  <div className="text-sm text-gray-600">Crack Time</div>
                </div>
              </div>

              {strength.feedback.length > 0 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium mb-2 text-yellow-800">Recommendations:</h4>
                  <ul className="space-y-1">
                    {strength.feedback.map((feedback, index) => (
                      <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                        <Target className="w-3 h-3 mt-1 flex-shrink-0" />
                        {feedback}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Batch Results */}
        {batchPasswords.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Batch Generated Passwords ({batchPasswords.length})
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => copy(batchPasswords.join('\n'))}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All
                  </Button>
                  <Button onClick={downloadPasswords} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {batchPasswords.map((password, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <span className="text-sm text-gray-600 w-8">{index + 1}.</span>
                    <div className="flex-1 font-mono text-sm break-all">
                      {showPassword ? password : '•'.repeat(password.length)}
                    </div>
                    <Button onClick={() => copy(password)} variant="outline" size="sm">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Password History */}
        {passwordHistory.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Passwords
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {passwordHistory.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-mono text-sm break-all">
                      {showPassword ? entry.password : '•'.repeat(entry.password.length)}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          entry.strength.score >= 80
                            ? 'bg-green-100 text-green-700'
                            : entry.strength.score >= 60
                              ? 'bg-blue-100 text-blue-700'
                              : entry.strength.score >= 40
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {entry.strength.level}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <Button onClick={() => copy(entry.password)} variant="outline" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Security Guidelines */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Password Security Guidelines</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-green-600">✅ Best Practices</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Use at least 12 characters (16+ recommended)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Include uppercase, lowercase, numbers, and symbols
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Use unique passwords for each account
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Store passwords in a password manager
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Enable two-factor authentication when available
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-3 text-red-600">❌ Avoid These</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  Personal information (names, birthdays, addresses)
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  Common words and phrases
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  Sequential characters (123, abc, qwerty)
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  Reusing passwords across multiple sites
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  Sharing passwords via insecure channels
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </ToolLayout>
  )
}

export default PasswordGeneratorPage
