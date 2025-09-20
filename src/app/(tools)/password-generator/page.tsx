'use client'

import React, { useState } from 'react'
import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { 
  Key, 
  Copy, 
  RefreshCw,
  Shield,
  Settings
} from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'
import { GeneratorOptions } from '@/types'

export const metadata: Metadata = {
  title: 'Password Generator - Free Secure Password Creator',
  description: 'Generate secure passwords with customizable options. Free password generator with strength analysis and multiple character sets.',
  keywords: ['password generator', 'secure password', 'password creator', 'random password', 'password tool'],
  openGraph: {
    title: 'Password Generator - Free Secure Password Creator',
    description: 'Generate secure passwords with customizable options. Free password generator with strength analysis.',
  },
}

export default function PasswordGeneratorPage() {
  const [password, setPassword] = useState('')
  const [length, setLength] = useState(16)
  const [options, setOptions] = useState<GeneratorOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false
  })
  const [strength, setStrength] = useState(0)
  const { success, error: showError } = useToast()

  const generatePassword = (): string => {
    const charset = {
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    }
    
    let chars = ''
    if (options.includeLowercase) chars += charset.lowercase
    if (options.includeUppercase) chars += charset.uppercase
    if (options.includeNumbers) chars += charset.numbers
    if (options.includeSymbols) chars += charset.symbols
    
    if (options.excludeSimilar) {
      chars = chars.replace(/[il1Lo0O]/g, '')
    }
    
    if (options.excludeAmbiguous) {
      chars = chars.replace(/[{}[\]()\/\\~,;.<>]/g, '')
    }
    
    if (chars.length === 0) return ''
    
    let result = ''
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length]
    }
    
    return result
  }

  const calculateStrength = (pwd: string): number => {
    let score = 0
    
    if (pwd.length >= 8) score += 1
    if (pwd.length >= 12) score += 1
    if (pwd.length >= 16) score += 1
    if (pwd.length >= 20) score += 1
    
    if (/[a-z]/.test(pwd)) score += 1
    if (/[A-Z]/.test(pwd)) score += 1
    if (/[0-9]/.test(pwd)) score += 1
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1
    
    return Math.min(score, 8)
  }

  const handleGenerate = () => {
    const newPassword = generatePassword()
    setPassword(newPassword)
    setStrength(calculateStrength(newPassword))
    success('Password generated successfully!')
  }

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      success(`${label} copied to clipboard!`)
    } else {
      showError('Failed to copy to clipboard')
    }
  }

  const getStrengthColor = (strength: number) => {
    if (strength < 3) return 'text-red-600 bg-red-50 border-red-200'
    if (strength < 5) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    if (strength < 7) return 'text-blue-600 bg-blue-50 border-blue-200'
    return 'text-green-600 bg-green-50 border-green-200'
  }

  const getStrengthLabel = (strength: number) => {
    if (strength < 3) return 'Weak'
    if (strength < 5) return 'Fair'
    if (strength < 7) return 'Good'
    return 'Strong'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Password Generator</h1>
          <p className="text-xl text-gray-600">Generate secure passwords with customizable options</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2 text-blue-600" />
                Password Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Length */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Length: {length}
                  </label>
                  <input
                    type="range"
                    min="4"
                    max="128"
                    value={length}
                    onChange={(e) => {
                      const newLength = parseInt(e.target.value)
                      setLength(newLength)
                      setOptions(prev => ({ ...prev, length: newLength }))
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>4</span>
                    <span>128</span>
                  </div>
                </div>

                {/* Character Sets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Character Sets
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={options.includeUppercase}
                        onChange={(e) => setOptions(prev => ({ ...prev, includeUppercase: e.target.checked }))}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Uppercase letters (A-Z)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={options.includeLowercase}
                        onChange={(e) => setOptions(prev => ({ ...prev, includeLowercase: e.target.checked }))}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Lowercase letters (a-z)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={options.includeNumbers}
                        onChange={(e) => setOptions(prev => ({ ...prev, includeNumbers: e.target.checked }))}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Numbers (0-9)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={options.includeSymbols}
                        onChange={(e) => setOptions(prev => ({ ...prev, includeSymbols: e.target.checked }))}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Symbols (!@#$%^&*)</span>
                    </label>
                  </div>
                </div>

                {/* Exclusions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Exclusions
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={options.excludeSimilar}
                        onChange={(e) => setOptions(prev => ({ ...prev, excludeSimilar: e.target.checked }))}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Exclude similar characters (il1Lo0O)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={options.excludeAmbiguous}
                        onChange={(e) => setOptions(prev => ({ ...prev, excludeAmbiguous: e.target.checked }))}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Exclude ambiguous characters ({ } [ ] ( ) / \ ~ , ; . < >)</span>
                    </label>
                  </div>
                </div>

                <Button onClick={handleGenerate} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="w-5 h-5 mr-2 text-green-600" />
                Generated Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {password ? (
                  <>
                    {/* Password Display */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="font-mono text-lg text-gray-900 break-all">
                        {password}
                      </div>
                    </div>

                    {/* Strength Indicator */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Password Strength</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStrengthColor(strength)}`}>
                          {getStrengthLabel(strength)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            strength < 3 ? 'bg-red-500' :
                            strength < 5 ? 'bg-yellow-500' :
                            strength < 7 ? 'bg-blue-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${(strength / 8) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Password Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="font-medium text-gray-900">{password.length}</div>
                        <div className="text-gray-600">Characters</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="font-medium text-gray-900">
                          {Math.pow(2, Math.log2(password.length))}
                        </div>
                        <div className="text-gray-600">Possible Combinations</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleCopy(password, 'Password')}
                        variant="outline"
                        className="flex-1"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Password
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Click "Generate Password" to create a secure password</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              Password Security Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Best Practices</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Use at least 12 characters</li>
                  <li>• Include uppercase, lowercase, numbers, and symbols</li>
                  <li>• Avoid dictionary words and personal information</li>
                  <li>• Use unique passwords for each account</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Security Features</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Cryptographically secure random generation</li>
                  <li>• Configurable character sets</li>
                  <li>• Strength analysis and feedback</li>
                  <li>• Easy copy and use functionality</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}