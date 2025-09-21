'use client'

import { useState } from 'react'
// Metadata removed - client components cannot export metadata
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/components/ui/Toast'
import { copyToClipboard } from '@/lib/utils'
import { DNSRecord } from '@/types'
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Globe,
  Info,
  RefreshCw,
  Search,
  Server,
} from 'lucide-react'

// Metadata removed - client components cannot export metadata

const recordTypes = [
  { value: 'A', label: 'A (IPv4 Address)', description: 'Maps domain to IPv4 address' },
  { value: 'AAAA', label: 'AAAA (IPv6 Address)', description: 'Maps domain to IPv6 address' },
  { value: 'CNAME', label: 'CNAME (Canonical Name)', description: 'Alias for another domain' },
  { value: 'MX', label: 'MX (Mail Exchange)', description: 'Mail server for domain' },
  { value: 'TXT', label: 'TXT (Text Record)', description: 'Text information for domain' },
  { value: 'NS', label: 'NS (Name Server)', description: 'Authoritative name servers' },
  { value: 'SOA', label: 'SOA (Start of Authority)', description: 'Zone authority information' },
  { value: 'PTR', label: 'PTR (Pointer)', description: 'Reverse DNS lookup' },
  { value: 'SRV', label: 'SRV (Service)', description: 'Service location record' },
  {
    value: 'CAA',
    label: 'CAA (Certificate Authority)',
    description: 'Certificate authority authorization',
  },
]

export default function DNSLookupPage() {
  const [domain, setDomain] = useState('')
  const [recordType, setRecordType] = useState('A')
  const [results, setResults] = useState<DNSRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastQuery, setLastQuery] = useState<{ domain: string; type: string } | null>(null)
  const { success, error: showError } = useToast()

  const lookupDNS = async () => {
    if (!domain.trim()) {
      showError('Please enter a domain name')
      return
    }

    setLoading(true)
    setError(null)
    setResults([])

    try {
      const cleanDomain = domain
        .trim()
        .replace(/^https?:\/\//, '')
        .replace(/\/$/, '')

      // Use Google DNS API
      const response = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(cleanDomain)}&type=${recordType}`,
        {
          headers: {
            Accept: 'application/dns-json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.Status !== 0) {
        throw new Error(`DNS Error: ${data.Comment || 'Unknown error'}`)
      }

      const records: DNSRecord[] =
        data.Answer?.map((record: any) => ({
          type: record.type,
          name: record.name,
          value: record.data,
          ttl: record.TTL,
          priority: record.priority,
        })) || []

      setResults(records)
      setLastQuery({ domain: cleanDomain, type: recordType })
      success(`Found ${records.length} ${recordType} record(s)`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to lookup DNS records'
      setError(errorMessage)
      showError('DNS Lookup Failed', errorMessage)
    } finally {
      setLoading(false)
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

  const getRecordTypeInfo = (type: string) => {
    return recordTypes.find(r => r.value === type)
  }

  const formatValue = (record: DNSRecord) => {
    if (record.type === 'MX' && record.priority) {
      return `${record.priority} ${record.value}`
    }
    return record.value
  }

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'A':
      case 'AAAA':
        return <Globe className="w-4 h-4 text-blue-600" />
      case 'MX':
        return <Server className="w-4 h-4 text-green-600" />
      case 'CNAME':
        return <Info className="w-4 h-4 text-purple-600" />
      case 'TXT':
        return <AlertCircle className="w-4 h-4 text-orange-600" />
      case 'NS':
        return <Server className="w-4 h-4 text-indigo-600" />
      default:
        return <Info className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">DNS Lookup Tool</h1>
          <p className="text-xl text-gray-600">
            Query DNS records for any domain. Check A, AAAA, MX, TXT, CNAME, NS records and more.
          </p>
        </div>

        {/* Input Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>DNS Lookup</CardTitle>
            <CardDescription>
              Enter a domain name and select the record type to query
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="example.com or subdomain.example.com"
                  value={domain}
                  onChange={e => setDomain(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && lookupDNS()}
                  className="flex-1"
                  icon={<Globe className="w-5 h-5" />}
                />
                <select
                  value={recordType}
                  onChange={e => setRecordType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {recordTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <Button onClick={lookupDNS} disabled={loading || !domain.trim()} className="px-8">
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Lookup
                    </>
                  )}
                </Button>
              </div>

              {/* Record Type Description */}
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <strong>{getRecordTypeInfo(recordType)?.label}:</strong>{' '}
                {getRecordTypeInfo(recordType)?.description}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading && (
          <Card className="mb-8">
            <CardContent className="py-12">
              <div className="text-center">
                <LoadingSpinner size="lg" text="Looking up DNS records..." />
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="mb-8">
            <CardContent className="py-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">DNS Lookup Failed</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={lookupDNS}>Try Again</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {results.length > 0 && (
          <div className="space-y-6">
            {/* Results Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                  DNS Lookup Results
                </CardTitle>
                <CardDescription>
                  {lastQuery &&
                    `Found ${results.length} ${recordType} record(s) for ${lastQuery.domain}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.map((record, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getRecordIcon(record.type)}
                        <div>
                          <div className="font-medium text-gray-900">{record.name}</div>
                          <div className="text-sm text-gray-600">
                            Type: {record.type} | TTL: {record.ttl || 'N/A'}s
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <div className="font-mono text-sm text-gray-900">
                            {formatValue(record)}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleCopy(formatValue(record), 'DNS Record')}
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() =>
                      handleCopy(results.map(r => formatValue(r)).join('\n'), 'All Records')
                    }
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All Records
                  </Button>
                  <Button
                    onClick={() => handleCopy(lastQuery?.domain || '', 'Domain')}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Domain
                  </Button>
                  <Button onClick={lookupDNS} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2 text-blue-600" />
                What is DNS?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                DNS (Domain Name System) is like a phone book for the internet. It translates
                human-readable domain names like "example.com" into IP addresses that computers use
                to identify each other on the network.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="w-5 h-5 mr-2 text-green-600" />
                Common Record Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>A:</strong> IPv4 address mapping
                </div>
                <div>
                  <strong>AAAA:</strong> IPv6 address mapping
                </div>
                <div>
                  <strong>MX:</strong> Mail server records
                </div>
                <div>
                  <strong>CNAME:</strong> Domain aliases
                </div>
                <div>
                  <strong>TXT:</strong> Text records for verification
                </div>
                <div>
                  <strong>NS:</strong> Name server records
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
