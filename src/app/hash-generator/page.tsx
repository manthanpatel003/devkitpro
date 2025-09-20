'use client'

import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import CryptoJS from 'crypto-js'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileText,
  Hash,
  Key,
  RotateCcw,
  Shield,
  Upload,
  Zap,
} from 'lucide-react'
import { useRef, useState } from 'react'

interface HashResult {
  algorithm: string
  hash: string
  input: string
  inputType: 'text' | 'file'
  fileInfo?: {
    name: string
    size: number
    type: string
  }
  stats: {
    inputSize: number
    processingTime: number
    hashLength: number
  }
}

const HASH_ALGORITHMS = [
  {
    id: 'md5',
    name: 'MD5',
    description: '128-bit hash (weak, for checksums only)',
    security: 'weak',
  },
  {
    id: 'sha1',
    name: 'SHA-1',
    description: '160-bit hash (deprecated for security)',
    security: 'weak',
  },
  { id: 'sha256', name: 'SHA-256', description: '256-bit hash (recommended)', security: 'strong' },
  { id: 'sha512', name: 'SHA-512', description: '512-bit hash (very strong)', security: 'strong' },
  {
    id: 'sha3',
    name: 'SHA-3',
    description: '256-bit SHA-3 hash (latest standard)',
    security: 'strong',
  },
  {
    id: 'ripemd160',
    name: 'RIPEMD-160',
    description: '160-bit hash (Bitcoin uses this)',
    security: 'medium',
  },
  {
    id: 'hmac-sha256',
    name: 'HMAC-SHA256',
    description: 'Keyed hash for authentication',
    security: 'strong',
  },
  {
    id: 'pbkdf2',
    name: 'PBKDF2',
    description: 'Password-based key derivation',
    security: 'strong',
  },
]

const HashGeneratorPage = () => {
  const [inputText, setInputText] = useState('')
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>(['md5', 'sha256'])
  const [results, setResults] = useState<HashResult[]>([])
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hmacKey, setHmacKey] = useState('')
  const [pbkdf2Salt, setPbkdf2Salt] = useState('')
  const [pbkdf2Iterations, setPbkdf2Iterations] = useState('10000')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [compareHash, setCompareHash] = useState('')

  const { copyToClipboard, copied } = useCopyToClipboard()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateHashes = async (input: string, file?: File) => {
    if (!input && !file) {
      setError('Please provide input text or upload a file')
      return
    }

    if (selectedAlgorithms.length === 0) {
      setError('Please select at least one hash algorithm')
      return
    }

    setProcessing(true)
    setError(null)
    const startTime = performance.now()

    try {
      const hashResults: HashResult[] = []
      let inputData: string
      let inputSize: number
      let fileInfo: HashResult['fileInfo']

      if (file) {
        // Handle file input
        const arrayBuffer = await file.arrayBuffer()
        const bytes = new Uint8Array(arrayBuffer)
        inputData = String.fromCharCode(...bytes)
        inputSize = file.size
        fileInfo = {
          name: file.name,
          size: file.size,
          type: file.type,
        }
      } else {
        inputData = input
        inputSize = new Blob([input]).size
      }

      // Generate hashes for selected algorithms
      for (const algorithm of selectedAlgorithms) {
        const algoStartTime = performance.now()
        let hash: string

        switch (algorithm) {
          case 'md5':
            hash = CryptoJS.MD5(inputData).toString()
            break
          case 'sha1':
            hash = CryptoJS.SHA1(inputData).toString()
            break
          case 'sha256':
            hash = CryptoJS.SHA256(inputData).toString()
            break
          case 'sha512':
            hash = CryptoJS.SHA512(inputData).toString()
            break
          case 'sha3':
            hash = CryptoJS.SHA3(inputData, { outputLength: 256 }).toString()
            break
          case 'ripemd160':
            hash = CryptoJS.RIPEMD160(inputData).toString()
            break
          case 'hmac-sha256':
            if (!hmacKey) {
              setError('HMAC requires a secret key')
              continue
            }
            hash = CryptoJS.HmacSHA256(inputData, hmacKey).toString()
            break
          case 'pbkdf2':
            if (!pbkdf2Salt) {
              setError('PBKDF2 requires a salt value')
              continue
            }
            const iterations = parseInt(pbkdf2Iterations) || 10000
            hash = CryptoJS.PBKDF2(inputData, pbkdf2Salt, {
              keySize: 256 / 32,
              iterations: iterations,
            }).toString()
            break
          default:
            continue
        }

        const algoEndTime = performance.now()

        hashResults.push({
          algorithm,
          hash,
          input: inputData,
          inputType: file ? 'file' : 'text',
          fileInfo,
          stats: {
            inputSize,
            processingTime: Math.round(algoEndTime - algoStartTime),
            hashLength: hash.length,
          },
        })
      }

      setResults(hashResults)
    } catch (err: any) {
      setError(`Hash generation failed: ${err.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleFileUpload = (file: File) => {
    if (file.size > 100 * 1024 * 1024) {
      // 100MB limit
      setError('File size must be under 100MB')
      return
    }

    generateHashes('', file)
  }

  const toggleAlgorithm = (algorithm: string) => {
    setSelectedAlgorithms(prev =>
      prev.includes(algorithm) ? prev.filter(a => a !== algorithm) : [...prev, algorithm]
    )
  }

  const selectAllAlgorithms = () => {
    setSelectedAlgorithms(HASH_ALGORITHMS.map(a => a.id))
  }

  const clearSelection = () => {
    setSelectedAlgorithms([])
  }

  const verifyHash = (originalHash: string, algorithm: string) => {
    const result = results.find(r => r.algorithm === algorithm)
    if (!result) return null

    return result.hash.toLowerCase() === originalHash.toLowerCase()
  }

  const exportResults = () => {
    if (results.length === 0) return

    const exportData = {
      input: results[0].inputType === 'file' ? '[File Data]' : results[0].input.substring(0, 100),
      inputType: results[0].inputType,
      fileInfo: results[0].fileInfo,
      hashes: results.map(r => ({
        algorithm: r.algorithm,
        hash: r.hash,
        stats: r.stats,
      })),
      timestamp: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hash-results-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const loadSampleText = () => {
    setInputText('Hello, World! This is a sample text for hash generation. 🔐')
  }

  const clearAll = () => {
    setInputText('')
    setResults([])
    setError(null)
    setCompareHash('')
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getAlgorithmInfo = (id: string) => {
    return (
      HASH_ALGORITHMS.find(a => a.id === id) || { name: id, description: '', security: 'unknown' }
    )
  }

  const getSecurityColor = (security: string) => {
    switch (security) {
      case 'strong':
        return 'text-green-600 bg-green-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'weak':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <ToolLayout
      title="Hash Generator Suite"
      description="Generate MD5, SHA1, SHA256, SHA512, and other hashes with file support and verification"
    >
      <div className="space-y-6">
        {/* Controls */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Hash className="w-5 h-5" />
              Hash Generator
            </h3>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowAdvanced(!showAdvanced)} variant="outline" size="sm">
                {showAdvanced ? (
                  <EyeOff className="w-4 h-4 mr-2" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                {showAdvanced ? 'Hide' : 'Show'} Advanced
              </Button>
              <Button onClick={() => setCompareMode(!compareMode)} variant="outline" size="sm">
                <Shield className="w-4 h-4 mr-2" />
                {compareMode ? 'Hide' : 'Show'} Verify
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Algorithm Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">
                  Hash Algorithms ({selectedAlgorithms.length} selected)
                </label>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={selectAllAlgorithms}>
                    Select All
                  </Button>
                  <Button size="sm" variant="outline" onClick={clearSelection}>
                    Clear
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {HASH_ALGORITHMS.map(algo => {
                  const isSelected = selectedAlgorithms.includes(algo.id)
                  return (
                    <button
                      key={algo.id}
                      onClick={() => toggleAlgorithm(algo.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{algo.name}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${getSecurityColor(algo.security)}`}
                        >
                          {algo.security}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">{algo.description}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Advanced Options */}
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <h4 className="font-medium">Advanced Options</h4>

                {selectedAlgorithms.includes('hmac-sha256') && (
                  <div>
                    <label className="block text-sm font-medium mb-2">HMAC Secret Key</label>
                    <Input
                      type="text"
                      placeholder="Enter secret key for HMAC"
                      value={hmacKey}
                      onChange={e => setHmacKey(e.target.value)}
                    />
                  </div>
                )}

                {selectedAlgorithms.includes('pbkdf2') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">PBKDF2 Salt</label>
                      <Input
                        type="text"
                        placeholder="Enter salt value"
                        value={pbkdf2Salt}
                        onChange={e => setPbkdf2Salt(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Iterations</label>
                      <Input
                        type="number"
                        placeholder="10000"
                        value={pbkdf2Iterations}
                        onChange={e => setPbkdf2Iterations(e.target.value)}
                        min="1000"
                        max="1000000"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Hash Verification */}
            {compareMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg"
              >
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Hash Verification
                </h4>
                <Input
                  type="text"
                  placeholder="Paste hash to verify against generated hashes"
                  value={compareHash}
                  onChange={e => setCompareHash(e.target.value)}
                  className="font-mono"
                />
                <div className="text-xs text-gray-600 mt-2">
                  Enter a hash to compare with the generated results for verification
                </div>
              </motion.div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button onClick={loadSampleText} variant="outline" size="sm">
                <Zap className="w-4 h-4 mr-2" />
                Load Sample
              </Button>
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
              <Button
                onClick={exportResults}
                variant="outline"
                size="sm"
                disabled={results.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Results
              </Button>
              <Button onClick={clearAll} variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />
          </div>
        </Card>

        {/* Input */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Input Text
            </h3>
            <Button
              onClick={() => generateHashes(inputText)}
              disabled={processing || (!inputText.trim() && !results.length)}
            >
              {processing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Hash className="w-4 h-4 mr-2" />
              )}
              {processing ? 'Generating...' : 'Generate Hashes'}
            </Button>
          </div>

          <Textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Enter text to hash..."
            className="font-mono text-sm min-h-[200px]"
          />

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-red-700">{error}</div>
            </div>
          )}
        </Card>

        {/* Results */}
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Hash Results ({results.length})
                </h3>
                <div className="text-sm text-gray-600">
                  Generated in {Math.max(...results.map(r => r.stats.processingTime))}ms
                </div>
              </div>

              {results[0].fileInfo && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium mb-2">File Information</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <div className="font-medium">{results[0].fileInfo.name}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Size:</span>
                      <div className="font-medium">{formatFileSize(results[0].fileInfo.size)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <div className="font-medium">{results[0].fileInfo.type || 'Unknown'}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {results.map((result, index) => {
                  const algoInfo = getAlgorithmInfo(result.algorithm)
                  const isMatch = compareHash && verifyHash(compareHash, result.algorithm)

                  return (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{algoInfo.name}</span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${getSecurityColor(algoInfo.security)}`}
                          >
                            {algoInfo.security}
                          </span>
                          {compareHash && (
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                isMatch === true
                                  ? 'bg-green-100 text-green-700'
                                  : isMatch === false
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {isMatch === true ? 'MATCH' : isMatch === false ? 'NO MATCH' : 'N/A'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">
                            {result.stats.processingTime}ms
                          </span>
                          <Button
                            onClick={() => copyToClipboard(result.hash)}
                            variant="outline"
                            size="sm"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="font-mono text-sm bg-white dark:bg-gray-900 p-3 rounded border break-all">
                        {result.hash}
                      </div>

                      <div className="mt-2 text-xs text-gray-600">
                        {algoInfo.description} • {result.stats.hashLength} characters
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Hash Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Hash Algorithm Guide</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-green-600">Recommended for Security</h4>
              <div className="space-y-2">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="font-medium">SHA-256</div>
                  <div className="text-sm text-gray-600">
                    Best balance of security and performance
                  </div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="font-medium">SHA-512</div>
                  <div className="text-sm text-gray-600">Maximum security for sensitive data</div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="font-medium">PBKDF2</div>
                  <div className="text-sm text-gray-600">Best for password hashing</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 text-red-600">Deprecated/Weak</h4>
              <div className="space-y-2">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="font-medium">MD5</div>
                  <div className="text-sm text-gray-600">Only for checksums, not security</div>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="font-medium">SHA-1</div>
                  <div className="text-sm text-gray-600">Deprecated, vulnerable to attacks</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-blue-800 mb-1">Security Tips:</div>
                <ul className="text-blue-700 space-y-1">
                  <li>• Use SHA-256 or higher for cryptographic security</li>
                  <li>• Add salt when hashing passwords</li>
                  <li>• Use PBKDF2/bcrypt/scrypt for password storage</li>
                  <li>• Never use MD5 or SHA-1 for security purposes</li>
                  <li>• HMAC provides authentication and integrity</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </ToolLayout>
  )
}

export default HashGeneratorPage
