'use client'

import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/ui/Loading'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle,
  Copy,
  ExternalLink,
  Globe,
  Mail,
  Network,
  RefreshCw,
  Server,
  Shield,
} from 'lucide-react'
import { useState } from 'react'

interface DNSRecord {
  name: string
  type: string
  TTL: number
  data: string
  priority?: number
  weight?: number
  port?: number
  target?: string
}

interface DNSResponse {
  Status: number
  TC: boolean
  RD: boolean
  RA: boolean
  AD: boolean
  CD: boolean
  Question: Array<{
    name: string
    type: number
  }>
  Answer?: DNSRecord[]
  Authority?: DNSRecord[]
  Additional?: DNSRecord[]
}

interface DNSLookupResult {
  domain: string
  records: Record<string, DNSRecord[]>
  summary: {
    totalRecords: number
    recordTypes: string[]
    hasIPv4: boolean
    hasIPv6: boolean
    hasMX: boolean
    hasTXT: boolean
  }
  performance: {
    queryTime: number
    resolver: string
  }
  security: {
    dnssec: boolean
    warnings: string[]
  }
}

const DNS_RECORD_TYPES = [
  { type: 'A', name: 'A Record', description: 'IPv4 Address', icon: Globe },
  { type: 'AAAA', name: 'AAAA Record', description: 'IPv6 Address', icon: Globe },
  { type: 'MX', name: 'MX Record', description: 'Mail Exchange', icon: Mail },
  { type: 'CNAME', name: 'CNAME Record', description: 'Canonical Name', icon: ExternalLink },
  { type: 'TXT', name: 'TXT Record', description: 'Text Record', icon: Shield },
  { type: 'NS', name: 'NS Record', description: 'Name Server', icon: Server },
  { type: 'SOA', name: 'SOA Record', description: 'Start of Authority', icon: Shield },
  { type: 'PTR', name: 'PTR Record', description: 'Pointer Record', icon: ExternalLink },
  { type: 'SRV', name: 'SRV Record', description: 'Service Record', icon: Network },
  {
    type: 'CAA',
    name: 'CAA Record',
    description: 'Certificate Authority Authorization',
    icon: Shield,
  },
]

const DNSLookupPage = () => {
  const [domain, setDomain] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    'A',
    'AAAA',
    'MX',
    'CNAME',
    'TXT',
    'NS',
  ])
  const [result, setResult] = useState<DNSLookupResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { isCopied, copy } = useCopyToClipboard()

  const lookupDNS = async () => {
    if (!domain.trim()) {
      setError('Please enter a domain name')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const cleanDomain = domain
        .trim()
        .replace(/^https?:\/\//, '')
        .replace(/\/.*$/, '')
      const startTime = performance.now()

      // Perform DNS lookups for selected record types
      const lookupPromises = selectedTypes.map(async recordType => {
        try {
          // Use Google DNS over HTTPS API
          const response = await fetch(
            `https://dns.google/resolve?name=${cleanDomain}&type=${recordType}&do=1`,
            {
              headers: {
                Accept: 'application/dns-json',
              },
            }
          )

          if (!response.ok) {
            throw new Error(`DNS query failed: ${response.statusText}`)
          }

          const data: DNSResponse = await response.json()
          return { type: recordType, data }
        } catch (error) {
          console.warn(`DNS lookup for ${recordType} failed:`, error)
          return { type: recordType, data: null }
        }
      })

      const results = await Promise.all(lookupPromises)
      const endTime = performance.now()
      const queryTime = Math.round(endTime - startTime)

      // Process results
      const records: Record<string, DNSRecord[]> = {}
      let totalRecords = 0
      const recordTypes: string[] = []
      let hasIPv4 = false
      let hasIPv6 = false
      let hasMX = false
      let hasTXT = false
      let dnssec = false

      results.forEach(({ type, data }) => {
        if (data && data.Answer) {
          records[type] = data.Answer.map(record => ({
            name: record.name,
            type: record.type.toString(),
            TTL: record.TTL,
            data: record.data,
            priority: record.priority,
            weight: record.weight,
            port: record.port,
            target: record.target,
          }))

          totalRecords += data.Answer.length
          if (!recordTypes.includes(type)) {
            recordTypes.push(type)
          }

          // Update flags
          if (type === 'A') hasIPv4 = true
          if (type === 'AAAA') hasIPv6 = true
          if (type === 'MX') hasMX = true
          if (type === 'TXT') hasTXT = true

          // Check for DNSSEC
          if (data.AD) dnssec = true
        } else {
          records[type] = []
        }
      })

      // Security analysis
      const warnings: string[] = []
      if (!hasIPv4 && !hasIPv6) {
        warnings.push('No A or AAAA records found - domain may not be accessible')
      }
      if (!dnssec) {
        warnings.push('DNSSEC not enabled - domain vulnerable to DNS spoofing')
      }
      if (records.TXT && records.TXT.some(r => r.data.includes('v=spf1'))) {
        // SPF record found - good for email security
      } else if (hasMX) {
        warnings.push('No SPF record found - email may be vulnerable to spoofing')
      }

      const lookupResult: DNSLookupResult = {
        domain: cleanDomain,
        records,
        summary: {
          totalRecords,
          recordTypes,
          hasIPv4,
          hasIPv6,
          hasMX,
          hasTXT,
        },
        performance: {
          queryTime,
          resolver: 'Google DNS (8.8.8.8)',
        },
        security: {
          dnssec,
          warnings,
        },
      }

      setResult(lookupResult)
    } catch (err: any) {
      setError(`DNS lookup failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const toggleRecordType = (type: string) => {
    setSelectedTypes(prev => (prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]))
  }

  const selectAllTypes = () => {
    setSelectedTypes(DNS_RECORD_TYPES.map(t => t.type))
  }

  const clearSelection = () => {
    setSelectedTypes([])
  }

  const copyResults = () => {
    if (!result) return

    let report = `DNS Lookup Report for ${result.domain}\n`
    report += `Generated: ${new Date().toLocaleString()}\n`
    report += `Query Time: ${result.performance.queryTime}ms\n`
    report += `Resolver: ${result.performance.resolver}\n\n`

    Object.entries(result.records).forEach(([type, records]) => {
      if (records.length > 0) {
        report += `${type} Records:\n`
        records.forEach(record => {
          report += `  ${record.name} ${record.TTL} IN ${type} ${record.data}\n`
          if (record.priority !== undefined) report += `    Priority: ${record.priority}\n`
          if (record.weight !== undefined) report += `    Weight: ${record.weight}\n`
          if (record.port !== undefined) report += `    Port: ${record.port}\n`
        })
        report += '\n'
      }
    })

    if (result.security.warnings.length > 0) {
      report += 'Security Warnings:\n'
      result.security.warnings.forEach(warning => {
        report += `- ${warning}\n`
      })
    }

    copy(report)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      lookupDNS()
    }
  }

  const getRecordTypeInfo = (type: string) => {
    return (
      DNS_RECORD_TYPES.find(t => t.type === type) || {
        type,
        name: `${type} Record`,
        description: 'DNS Record',
        icon: Globe,
      }
    )
  }

  return (
    <ToolLayout
      title="Advanced DNS Lookup"
      description="Complete DNS record analysis including A, AAAA, MX, CNAME, TXT, and NS records"
    >
      <div className="space-y-6">
        {/* Input Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">DNS Lookup</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter domain (e.g., google.com)"
                  value={domain}
                  onChange={e => setDomain(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full"
                />
              </div>
              <Button
                onClick={lookupDNS}
                disabled={loading || !domain.trim() || selectedTypes.length === 0}
                className="px-8"
              >
                {loading ? <Loading size="sm" /> : <Globe className="w-4 h-4 mr-2" />}
                {loading ? 'Looking up...' : 'Lookup DNS'}
              </Button>
            </div>

            {/* Record Type Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Record Types ({selectedTypes.length} selected)
                </label>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={selectAllTypes}>
                    Select All
                  </Button>
                  <Button size="sm" variant="outline" onClick={clearSelection}>
                    Clear
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {DNS_RECORD_TYPES.map(recordType => {
                  const isSelected = selectedTypes.includes(recordType.type)
                  const Icon = recordType.icon
                  return (
                    <button
                      key={recordType.type}
                      onClick={() => toggleRecordType(recordType.type)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                      }`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-sm font-medium">{recordType.type}</div>
                      <div className="text-xs text-gray-500">{recordType.description}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-red-700">{error}</div>
            </div>
          )}
        </Card>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">DNS Summary</h3>
                <Button onClick={copyResults} variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  {isCopied ? 'Copied!' : 'Copy Report'}
                </Button>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {result.summary.totalRecords}
                  </div>
                  <div className="text-sm text-gray-600">Total Records</div>
                </div>

                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {result.performance.queryTime}ms
                  </div>
                  <div className="text-sm text-gray-600">Query Time</div>
                </div>

                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {result.summary.recordTypes.length}
                  </div>
                  <div className="text-sm text-gray-600">Record Types</div>
                </div>

                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div
                    className={`text-2xl font-bold ${result.security.dnssec ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {result.security.dnssec ? 'YES' : 'NO'}
                  </div>
                  <div className="text-sm text-gray-600">DNSSEC</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {result.summary.hasIPv4 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    IPv4
                  </span>
                )}
                {result.summary.hasIPv6 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    IPv6
                  </span>
                )}
                {result.summary.hasMX && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Mail className="w-3 h-3 mr-1" />
                    Email
                  </span>
                )}
                {result.summary.hasTXT && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Shield className="w-3 h-3 mr-1" />
                    TXT Records
                  </span>
                )}
              </div>
            </Card>

            {/* Security Warnings */}
            {result.security.warnings.length > 0 && (
              <Card className="p-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                <h3 className="text-lg font-semibold mb-4 text-yellow-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Security Warnings
                </h3>
                <ul className="space-y-2">
                  {result.security.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start gap-2 text-yellow-800">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{warning}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* DNS Records */}
            <div className="grid gap-6">
              {Object.entries(result.records).map(([type, records]) => {
                if (records.length === 0) return null

                const recordInfo = getRecordTypeInfo(type)
                const Icon = recordInfo.icon

                return (
                  <Card key={type} className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      {recordInfo.name} ({records.length})
                    </h3>
                    <div className="space-y-3">
                      {records.map((record, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Name:</span>
                              <div className="font-mono">{record.name}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">TTL:</span>
                              <div className="font-mono">{record.TTL}s</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Type:</span>
                              <div className="font-mono">{type}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Data:</span>
                              <div className="font-mono break-all">{record.data}</div>
                            </div>
                          </div>

                          {/* Additional fields for specific record types */}
                          {(record.priority !== undefined ||
                            record.weight !== undefined ||
                            record.port !== undefined) && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                {record.priority !== undefined && (
                                  <div>
                                    <span className="text-gray-600">Priority:</span>
                                    <div className="font-mono">{record.priority}</div>
                                  </div>
                                )}
                                {record.weight !== undefined && (
                                  <div>
                                    <span className="text-gray-600">Weight:</span>
                                    <div className="font-mono">{record.weight}</div>
                                  </div>
                                )}
                                {record.port !== undefined && (
                                  <div>
                                    <span className="text-gray-600">Port:</span>
                                    <div className="font-mono">{record.port}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(`https://www.whatsmydns.net/#A/${result.domain}`, '_blank')
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Global DNS Check
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(`https://dnschecker.org/#A/${result.domain}`, '_blank')
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  DNS Propagation
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(`https://www.whois.net/whois/${result.domain}`, '_blank')
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  WHOIS Lookup
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDomain('')
                    setResult(null)
                    setError(null)
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Lookup
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  )
}

export default DNSLookupPage
