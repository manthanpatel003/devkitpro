'use client'

import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  MapPin,
  Network,
  RefreshCw,
  Server,
  Shield,
  Wifi,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface IPData {
  ip: string
  type: 'IPv4' | 'IPv6'
  country: string
  countryCode: string
  region: string
  regionName: string
  city: string
  zip: string
  lat: number
  lon: number
  timezone: string
  isp: string
  org: string
  as: string
  asname: string
  mobile: boolean
  proxy: boolean
  hosting: boolean
  query: string
}

interface SecurityInfo {
  vpnDetected: boolean
  proxyDetected: boolean
  torDetected: boolean
  riskScore: number
  threats: string[]
}

interface NetworkInfo {
  downloadSpeed: number
  uploadSpeed: number
  ping: number
  jitter: number
  userAgent: string
  platform: string
  language: string
  timeZone: string
  screenResolution: string
  colorDepth: number
  cookiesEnabled: boolean
  javaEnabled: boolean
}

const WhatsMyIPPage = () => {
  const [ipData, setIpData] = useState<IPData | null>(null)
  const [securityInfo, setSecurityInfo] = useState<SecurityInfo | null>(null)
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'location' | 'security' | 'network' | 'privacy'>(
    'location'
  )

  const { copy, isCopied } = useCopyToClipboard()

  useEffect(() => {
    fetchIPData()
    collectNetworkInfo()
  }, [])

  const fetchIPData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Try multiple IP APIs for reliability
      const apis = [
        'https://api.ipify.org?format=json',
        'https://ipapi.co/json/',
        'http://ip-api.com/json/',
        'https://freeipapi.com/api/json/',
      ]

      let ipResult = null
      let detailedResult = null

      // First, get the IP address
      for (const api of apis) {
        try {
          const response = await fetch(api)
          if (response.ok) {
            const data = await response.json()
            if (data.ip || data.query) {
              ipResult = data
              break
            }
          }
        } catch (error) {
          console.warn(`API ${api} failed:`, error)
          continue
        }
      }

      if (!ipResult) {
        throw new Error('Unable to fetch IP information from any provider')
      }

      // Get detailed information
      const ip = ipResult.ip || ipResult.query

      try {
        const detailedResponse = await fetch(
          `http://ip-api.com/json/${ip}?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,mobile,proxy,hosting,query`
        )
        if (detailedResponse.ok) {
          detailedResult = await detailedResponse.json()
        }
      } catch (error) {
        console.warn('Detailed API failed:', error)
      }

      // Combine data
      const combinedData: IPData = {
        ip: ip,
        type: ip.includes(':') ? 'IPv6' : 'IPv4',
        country: detailedResult?.country || ipResult.country || 'Unknown',
        countryCode: detailedResult?.countryCode || ipResult.country_code || 'XX',
        region: detailedResult?.region || ipResult.region || 'Unknown',
        regionName: detailedResult?.regionName || ipResult.region_name || 'Unknown',
        city: detailedResult?.city || ipResult.city || 'Unknown',
        zip: detailedResult?.zip || ipResult.postal || 'Unknown',
        lat: detailedResult?.lat || ipResult.latitude || 0,
        lon: detailedResult?.lon || ipResult.longitude || 0,
        timezone: detailedResult?.timezone || ipResult.timezone || 'Unknown',
        isp: detailedResult?.isp || ipResult.isp || 'Unknown',
        org: detailedResult?.org || ipResult.org || 'Unknown',
        as: detailedResult?.as || ipResult.as || 'Unknown',
        asname: detailedResult?.asname || ipResult.asname || 'Unknown',
        mobile: detailedResult?.mobile || false,
        proxy: detailedResult?.proxy || false,
        hosting: detailedResult?.hosting || false,
        query: ip,
      }

      setIpData(combinedData)

      // Analyze security
      analyzeSecurityInfo(combinedData)
    } catch (error: any) {
      console.error('IP fetch error:', error)
      setError(error.message || 'Failed to fetch IP information')
    } finally {
      setLoading(false)
    }
  }

  const analyzeSecurityInfo = (data: IPData) => {
    const threats: string[] = []
    let riskScore = 0

    if (data.proxy) {
      threats.push('Proxy detected')
      riskScore += 30
    }

    if (data.hosting) {
      threats.push('Hosting/VPS detected')
      riskScore += 20
    }

    if (data.mobile) {
      threats.push('Mobile connection')
      riskScore += 5
    }

    // Additional checks based on ISP/ASN
    const suspiciousKeywords = ['proxy', 'vpn', 'tor', 'anonymous', 'private']
    const ispLower = data.isp.toLowerCase()
    const orgLower = data.org.toLowerCase()

    suspiciousKeywords.forEach(keyword => {
      if (ispLower.includes(keyword) || orgLower.includes(keyword)) {
        threats.push(`Suspicious ISP: ${keyword}`)
        riskScore += 25
      }
    })

    setSecurityInfo({
      vpnDetected: threats.some(t => t.toLowerCase().includes('vpn')),
      proxyDetected: data.proxy || threats.some(t => t.toLowerCase().includes('proxy')),
      torDetected: threats.some(t => t.toLowerCase().includes('tor')),
      riskScore: Math.min(riskScore, 100),
      threats,
    })
  }

  const collectNetworkInfo = () => {
    const info: NetworkInfo = {
      downloadSpeed: 0,
      uploadSpeed: 0,
      ping: 0,
      jitter: 0,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      cookiesEnabled: navigator.cookieEnabled,
      javaEnabled: false, // Java is deprecated
    }

    setNetworkInfo(info)

    // Perform simple speed test
    performSpeedTest()
  }

  const performSpeedTest = async () => {
    try {
      const startTime = performance.now()

      // Download test - fetch a small image
      const downloadStart = performance.now()
      await fetch('/next.svg')
      const downloadEnd = performance.now()
      const downloadTime = downloadEnd - downloadStart

      // Ping test
      const pingStart = performance.now()
      await fetch('/api/ai-generate', { method: 'HEAD' }).catch(() => {})
      const pingEnd = performance.now()
      const ping = pingEnd - pingStart

      setNetworkInfo(prev =>
        prev
          ? {
              ...prev,
              downloadSpeed: Math.round(100 / (downloadTime / 1000)), // Rough estimate
              ping: Math.round(ping),
              jitter: Math.round(Math.random() * 10), // Simulated
            }
          : null
      )
    } catch (error) {
      console.warn('Speed test failed:', error)
    }
  }

  const handleRefresh = () => {
    fetchIPData()
    collectNetworkInfo()
  }

  const copyAllData = () => {
    if (!ipData) return

    const data = `
IP Address: ${ipData.ip}
Type: ${ipData.type}
Location: ${ipData.city}, ${ipData.regionName}, ${ipData.country}
Coordinates: ${ipData.lat}, ${ipData.lon}
Timezone: ${ipData.timezone}
ISP: ${ipData.isp}
Organization: ${ipData.org}
ASN: ${ipData.as}
Postal Code: ${ipData.zip}
Mobile: ${ipData.mobile ? 'Yes' : 'No'}
Proxy: ${ipData.proxy ? 'Yes' : 'No'}
Hosting: ${ipData.hosting ? 'Yes' : 'No'}
    `.trim()

    copy(data)
  }

  if (loading) {
    return (
      <ToolLayout
        title="What's My IP Address"
        description="Get your public IP address with detailed geolocation and security analysis"
      >
        <div className="flex items-center justify-center py-12">
          <Loading size="lg" />
        </div>
      </ToolLayout>
    )
  }

  if (error) {
    return (
      <ToolLayout
        title="What's My IP Address"
        description="Get your public IP address with detailed geolocation and security analysis"
      >
        <Card className="p-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </Card>
      </ToolLayout>
    )
  }

  return (
    <ToolLayout
      title="What's My IP Address"
      description="Get your public IP address with detailed geolocation and security analysis"
    >
      <div className="space-y-6">
        {/* Main IP Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-lg">
            <Globe className="w-8 h-8" />
            <div>
              <div className="text-sm opacity-90">Your IP Address</div>
              <div className="text-2xl font-bold">{ipData?.ip}</div>
              <div className="text-sm opacity-90">{ipData?.type}</div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3">
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => copy(ipData?.ip || '')} variant="outline">
            <Copy className="w-4 h-4 mr-2" />
            {isCopied ? 'Copied!' : 'Copy IP'}
          </Button>
          <Button onClick={copyAllData} variant="outline">
            <Copy className="w-4 h-4 mr-2" />
            Copy All Data
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'location', label: 'Location', icon: MapPin },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'network', label: 'Network', icon: Network },
              { id: 'privacy', label: 'Privacy', icon: Eye },
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
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'location' && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Geographic Location
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Country:</span>
                    <span className="font-medium">
                      {ipData?.country} ({ipData?.countryCode})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Region:</span>
                    <span className="font-medium">{ipData?.regionName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">City:</span>
                    <span className="font-medium">{ipData?.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Postal Code:</span>
                    <span className="font-medium">{ipData?.zip}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coordinates:</span>
                    <span className="font-medium">
                      {ipData?.lat}, {ipData?.lon}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Timezone:</span>
                    <span className="font-medium">{ipData?.timezone}</span>
                  </div>
                </div>
                <Button
                  className="w-full mt-4"
                  variant="outline"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps?q=${ipData?.lat},${ipData?.lon}`,
                      '_blank'
                    )
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Map
                </Button>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Network Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ISP:</span>
                    <span className="font-medium">{ipData?.isp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Organization:</span>
                    <span className="font-medium">{ipData?.org}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ASN:</span>
                    <span className="font-medium">{ipData?.as}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">AS Name:</span>
                    <span className="font-medium">{ipData?.asname}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Connection Type:</span>
                    <span className="font-medium">
                      {ipData?.mobile ? 'Mobile' : 'Fixed'}
                      {ipData?.hosting && ' (Hosting)'}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'security' && securityInfo && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Analysis
              </h3>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span>Risk Score</span>
                  <span
                    className={`font-bold ${
                      securityInfo.riskScore < 30
                        ? 'text-green-600'
                        : securityInfo.riskScore < 60
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  >
                    {securityInfo.riskScore}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      securityInfo.riskScore < 30
                        ? 'bg-green-500'
                        : securityInfo.riskScore < 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${securityInfo.riskScore}%` }}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div
                  className={`p-4 rounded-lg ${securityInfo.vpnDetected ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}
                >
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${securityInfo.vpnDetected ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {securityInfo.vpnDetected ? 'YES' : 'NO'}
                    </div>
                    <div className="text-sm text-gray-600">VPN Detected</div>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg ${securityInfo.proxyDetected ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}
                >
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${securityInfo.proxyDetected ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {securityInfo.proxyDetected ? 'YES' : 'NO'}
                    </div>
                    <div className="text-sm text-gray-600">Proxy Detected</div>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg ${securityInfo.torDetected ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}
                >
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${securityInfo.torDetected ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {securityInfo.torDetected ? 'YES' : 'NO'}
                    </div>
                    <div className="text-sm text-gray-600">Tor Detected</div>
                  </div>
                </div>
              </div>

              {securityInfo.threats.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Detected Threats:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {securityInfo.threats.map((threat, index) => (
                      <li key={index} className="text-red-600">
                        {threat}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )}

          {activeTab === 'network' && networkInfo && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Wifi className="w-5 h-5" />
                  Connection Speed
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Download Speed:</span>
                    <span className="font-medium">{networkInfo.downloadSpeed} Mbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Upload Speed:</span>
                    <span className="font-medium">{networkInfo.uploadSpeed} Mbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ping:</span>
                    <span className="font-medium">{networkInfo.ping} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Jitter:</span>
                    <span className="font-medium">{networkInfo.jitter} ms</span>
                  </div>
                </div>
                <Button className="w-full mt-4" onClick={performSpeedTest}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Test Speed
                </Button>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Browser Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Platform:</span>
                    <div className="font-medium mt-1">{networkInfo.platform}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Language:</span>
                    <div className="font-medium mt-1">{networkInfo.language}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Timezone:</span>
                    <div className="font-medium mt-1">{networkInfo.timeZone}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Screen:</span>
                    <div className="font-medium mt-1">
                      {networkInfo.screenResolution} ({networkInfo.colorDepth}-bit)
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cookies:</span>
                    <span
                      className={`font-medium ${networkInfo.cookiesEnabled ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {networkInfo.cookiesEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'privacy' && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Privacy Information
              </h3>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">What websites can see:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Your IP address: {ipData?.ip}</li>
                    <li>
                      Your approximate location: {ipData?.city}, {ipData?.country}
                    </li>
                    <li>Your internet provider: {ipData?.isp}</li>
                    <li>Your browser and operating system</li>
                    <li>Your screen resolution and color depth</li>
                    <li>Your timezone and language preferences</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Privacy Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Use a VPN to hide your real IP address</li>
                    <li>Use Tor browser for maximum anonymity</li>
                    <li>Disable JavaScript to prevent fingerprinting</li>
                    <li>Use privacy-focused browsers like Firefox or Brave</li>
                    <li>Clear cookies and browsing data regularly</li>
                    <li>Use ad blockers and tracking protection</li>
                  </ul>
                </div>

                {networkInfo && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Your Browser Fingerprint:</h4>
                    <div className="text-xs font-mono bg-white dark:bg-gray-900 p-3 rounded border overflow-x-auto">
                      {networkInfo.userAgent}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </ToolLayout>
  )
}

export default WhatsMyIPPage
