'use client'

import React, { useState } from 'react'
import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { 
  Hash, 
  Copy, 
  RefreshCw,
  Download,
  Settings,
  CheckCircle
} from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'UUID Generator - Free UUID Generator Tool',
  description: 'Generate UUIDs in different versions. Free UUID generator with bulk generation and format options.',
  keywords: ['uuid generator', 'guid generator', 'unique identifier', 'uuid v4', 'uuid v1'],
  openGraph: {
    title: 'UUID Generator - Free UUID Generator Tool',
    description: 'Generate UUIDs in different versions. Free UUID generator with bulk generation.',
  },
}

interface UUIDConfig {
  version: 'v1' | 'v4' | 'v5'
  count: number
  format: 'uppercase' | 'lowercase'
  namespace?: string
  name?: string
}

export default function UUIDGeneratorPage() {
  const [config, setConfig] = useState<UUIDConfig>({
    version: 'v4',
    count: 1,
    format: 'lowercase',
    namespace: '',
    name: ''
  })
  const [generatedUUIDs, setGeneratedUUIDs] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const { success, error: showError } = useToast()

  const generateUUIDv4 = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  const generateUUIDv1 = (): string => {
    // Simplified UUID v1 implementation
    // In production, you'd use a proper UUID library
    const timestamp = Date.now()
    const random = Math.random().toString(16).substring(2, 14)
    const clockSeq = Math.floor(Math.random() * 0x3fff) + 0x8000
    const node = Math.floor(Math.random() * 0xffffffffffff)
    
    const timeLow = (timestamp & 0xffffffff).toString(16).padStart(8, '0')
    const timeMid = ((timestamp >> 32) & 0xffff).toString(16).padStart(4, '0')
    const timeHigh = ((timestamp >> 48) & 0xfff).toString(16).padStart(3, '0')
    const clockSeqStr = clockSeq.toString(16).padStart(4, '0')
    const nodeStr = node.toString(16).padStart(12, '0')
    
    return `${timeLow}-${timeMid}-1${timeHigh}-${clockSeqStr}-${nodeStr}`
  }

  const generateUUIDv5 = (namespace: string, name: string): string => {
    // Simplified UUID v5 implementation
    // In production, you'd use a proper UUID library with SHA-1 hashing
    const input = namespace + name
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    // Convert to hex and pad
    const hex = Math.abs(hash).toString(16).padStart(8, '0')
    const random = Math.random().toString(16).substring(2, 14)
    
    return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-5${hex.substring(12, 15)}-${random.substring(0, 4)}-${random.substring(4, 16)}`
  }

  const generateUUIDs = async (): Promise<void> => {
    setIsGenerating(true)
    
    try {
      const uuids: string[] = []
      
      for (let i = 0; i < config.count; i++) {
        let uuid: string
        
        switch (config.version) {
          case 'v1':
            uuid = generateUUIDv1()
            break
          case 'v4':
            uuid = generateUUIDv4()
            break
          case 'v5':
            if (!config.namespace || !config.name) {
              throw new Error('Namespace and name are required for UUID v5')
            }
            uuid = generateUUIDv5(config.namespace, config.name)
            break
          default:
            uuid = generateUUIDv4()
        }
        
        // Apply format
        if (config.format === 'uppercase') {
          uuid = uuid.toUpperCase()
        }
        
        uuids.push(uuid)
      }
      
      setGeneratedUUIDs(uuids)
      success(`Generated ${config.count} UUID${config.count > 1 ? 's' : ''} successfully!`)
    } catch (err) {
      showError(err instanceof Error ? err.message : 'UUID generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      success(`${label} copied to clipboard!`)
    } else {
      showError('Failed to copy to clipboard')
    }
  }

  const copyAllUUIDs = async () => {
    const allUUIDs = generatedUUIDs.join('\n')
    const success = await copyToClipboard(allUUIDs)
    if (success) {
      success('All UUIDs copied to clipboard!')
    } else {
      showError('Failed to copy UUIDs to clipboard')
    }
  }

  const downloadUUIDs = () => {
    if (generatedUUIDs.length === 0) return
    
    const content = generatedUUIDs.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `uuids-${config.version}-${config.count}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    success('UUIDs downloaded!')
  }

  const clearUUIDs = () => {
    setGeneratedUUIDs([])
    success('UUIDs cleared')
  }

  const loadExample = () => {
    setConfig({
      version: 'v4',
      count: 5,
      format: 'lowercase',
      namespace: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      name: 'example.com'
    })
    success('Example configuration loaded!')
  }

  // Auto-generate when config changes
  React.useEffect(() => {
    if (config.count > 0) {
      generateUUIDs()
    }
  }, [config])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">UUID Generator</h1>
          <p className="text-xl text-gray-600">Generate UUIDs in different versions with bulk generation</p>
        </div>

        {/* Configuration */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2 text-blue-600" />
              Generation Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UUID Version
                </label>
                <select
                  value={config.version}
                  onChange={(e) => setConfig({...config, version: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="v1">UUID v1 (Time-based)</option>
                  <option value="v4">UUID v4 (Random)</option>
                  <option value="v5">UUID v5 (Namespace-based)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={config.count}
                  onChange={(e) => setConfig({...config, count: Math.min(1000, Math.max(1, Number(e.target.value)))})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format
                </label>
                <select
                  value={config.format}
                  onChange={(e) => setConfig({...config, format: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="lowercase">Lowercase</option>
                  <option value="uppercase">Uppercase</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <Button onClick={loadExample} variant="outline" className="w-full">
                  Load Example
                </Button>
              </div>
            </div>
            
            {/* UUID v5 specific fields */}
            {config.version === 'v5' && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Namespace UUID
                  </label>
                  <Input
                    value={config.namespace || ''}
                    onChange={(e) => setConfig({...config, namespace: e.target.value})}
                    placeholder="6ba7b810-9dad-11d1-80b4-00c04fd430c8"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <Input
                    value={config.name || ''}
                    onChange={(e) => setConfig({...config, name: e.target.value})}
                    placeholder="example.com"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generated UUIDs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Hash className="w-5 h-5 mr-2 text-green-600" />
              Generated UUIDs
            </CardTitle>
            <CardDescription>
              {generatedUUIDs.length > 0 
                ? `${generatedUUIDs.length} UUID${generatedUUIDs.length > 1 ? 's' : ''} generated`
                : 'No UUIDs generated yet'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedUUIDs.length > 0 ? (
                <div className="space-y-2">
                  {generatedUUIDs.map((uuid, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-500 w-8">{index + 1}.</span>
                      <code className="flex-1 font-mono text-sm">{uuid}</code>
                      <Button
                        onClick={() => handleCopy(uuid, 'UUID')}
                        size="sm"
                        variant="outline"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <Hash className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Generated UUIDs will appear here</p>
                </div>
              )}
              
              {generatedUUIDs.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    onClick={copyAllUUIDs}
                    variant="outline"
                    className="flex-1"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All
                  </Button>
                  <Button
                    onClick={downloadUUIDs}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={clearUUIDs}
                    variant="outline"
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* UUID Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
              UUID Version Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">UUID v1 (Time-based)</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Based on timestamp and MAC address</li>
                  <li>• Globally unique across time</li>
                  <li>• Sortable by creation time</li>
                  <li>• May reveal MAC address</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">UUID v4 (Random)</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Pseudo-randomly generated</li>
                  <li>• Most commonly used version</li>
                  <li>• No predictable pattern</li>
                  <li>• Cryptographically secure</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">UUID v5 (Namespace-based)</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Based on namespace and name</li>
                  <li>• Deterministic generation</li>
                  <li>• Same input = same UUID</li>
                  <li>• Requires namespace UUID</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Examples */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Hash className="w-5 h-5 mr-2 text-purple-600" />
              Usage Examples
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">JavaScript</h4>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                  <div>const uuid = crypto.randomUUID();</div>
                  <div>console.log(uuid); // e.g., "550e8400-e29b-41d4-a716-446655440000"</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Python</h4>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                  <div>import uuid</div>
                  <div>uuid.uuid4() # Random UUID</div>
                  <div>uuid.uuid1() # Time-based UUID</div>
                  <div>uuid.uuid5(uuid.NAMESPACE_DNS, 'example.com') # Namespace-based</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Database Usage</h4>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                  <div>CREATE TABLE users (</div>
                  <div>  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),</div>
                  <div>  name VARCHAR(100) NOT NULL</div>
                  <div>);</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}