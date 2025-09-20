'use client'

import React, { useState, useEffect } from 'react'
import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/components/ui/Toast'
import { 
  Globe, 
  MapPin, 
  Clock, 
  Wifi, 
  Shield, 
  Copy, 
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { copyToClipboard, formatBytes } from '@/lib/utils'
import { IPData } from '@/types'

export const metadata: Metadata = {
  title: 'What\'s My IP Address - Free IP Checker Tool',
  description: 'Check your public IP address, location, ISP, and network information instantly. Free IP geolocation tool with detailed network analysis.',
  keywords: ['IP address', 'IP checker', 'geolocation', 'network tools', 'public IP', 'ISP lookup'],
  openGraph: {
    title: 'What\'s My IP Address - Free IP Checker Tool',
    description: 'Check your public IP address, location, ISP, and network information instantly.',
  },
}

export default function WhatsMyIPPage() {
  const [ipData, setIpData] = useState<IPData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const { success, error: showError } = useToast()

  const fetchIPData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Try multiple APIs for reliability
      const apis = [
        'https://api.ipify.org?format=json',
        'https://ipapi.co/json/',
        'http://ip-api.com/json/',
        'https://freeipapi.com/api/json/'
      ]
      
      let data: IPData | null = null
      
      for (const api of apis) {
        try {
          const response = await fetch(api)
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          
          const result = await response.json()
          
          // Normalize data from different APIs
          if (api.includes('ipify')) {
            data = {
              ip: result.ip,
              country: result.country || 'Unknown',
              countryCode: result.country_code || 'Unknown',
              region: result.region || 'Unknown',
              regionName: result.region_name || 'Unknown',
              city: result.city || 'Unknown',
              zip: result.zip || 'Unknown',
              lat: result.latitude || 0,
              lon: result.longitude || 0,
              timezone: result.timezone || 'Unknown',
              isp: result.org || 'Unknown',
              org: result.org || 'Unknown',
              as: result.as || 'Unknown'
            }
          } else if (api.includes('ipapi')) {
            data = {
              ip: result.ip,
              country: result.country_name || 'Unknown',
              countryCode: result.country_code || 'Unknown',
              region: result.region || 'Unknown',
              regionName: result.region || 'Unknown',
              city: result.city || 'Unknown',
              zip: result.postal || 'Unknown',
              lat: result.latitude || 0,
              lon: result.longitude || 0,
              timezone: result.timezone || 'Unknown',
              isp: result.org || 'Unknown',
              org: result.org || 'Unknown',
              as: result.asn || 'Unknown'
            }
          } else if (api.includes('ip-api')) {
            data = {
              ip: result.query || result.ip,
              country: result.country || 'Unknown',
              countryCode: result.countryCode || 'Unknown',
              region: result.region || 'Unknown',
              regionName: result.regionName || 'Unknown',
              city: result.city || 'Unknown',
              zip: result.zip || 'Unknown',
              lat: result.lat || 0,
              lon: result.lon || 0,
              timezone: result.timezone || 'Unknown',
              isp: result.isp || 'Unknown',
              org: result.org || 'Unknown',
              as: result.as || 'Unknown'
            }
          } else if (api.includes('freeipapi')) {
            data = {
              ip: result.ipAddress || result.ip,
              country: result.countryName || 'Unknown',
              countryCode: result.countryCode || 'Unknown',
              region: result.stateProv || 'Unknown',
              regionName: result.stateProv || 'Unknown',
              city: result.cityName || 'Unknown',
              zip: result.zipCode || 'Unknown',
              lat: result.latitude || 0,
              lon: result.longitude || 0,
              timezone: result.timeZone || 'Unknown',
              isp: result.ispName || 'Unknown',
              org: result.ispName || 'Unknown',
              as: result.asn || 'Unknown'
            }
          }
          
          if (data?.ip) {
            break
          }
        } catch (apiError) {
          console.warn(`API ${api} failed:`, apiError)
          continue
        }
      }
      
      if (!data?.ip) {
        throw new Error('Unable to fetch IP data from any source')
      }
      
      setIpData(data)
      setLastUpdated(new Date())
      success('IP data updated successfully!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch IP data'
      setError(errorMessage)
      showError('Failed to fetch IP data', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIPData()
  }, [])

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      success(`${label} copied to clipboard!`)
    } else {
      showError('Failed to copy to clipboard')
    }
  }

  const getLocationString = () => {
    if (!ipData) return 'Unknown'
    const parts = [ipData.city, ipData.regionName, ipData.country].filter(Boolean)
    return parts.join(', ') || 'Unknown'
  }

  const getCoordinates = () => {
    if (!ipData?.lat || !ipData?.lon) return 'Unknown'
    return `${ipData.lat.toFixed(4)}, ${ipData.lon.toFixed(4)}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            What's My IP Address?
          </h1>
          <p className="text-xl text-gray-600">
            Check your public IP address, location, and network information instantly
          </p>
        </div>

        {/* Main IP Display */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Your Public IP Address</CardTitle>
                <CardDescription>
                  {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
                </CardDescription>
              </div>
              <Button
                onClick={fetchIPData}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <LoadingSpinner size="lg" text="Fetching your IP address..." />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading IP Data</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={fetchIPData}>
                  Try Again
                </Button>
              </div>
            ) : ipData ? (
              <div className="space-y-6">
                {/* IP Address Display */}
                <div className="text-center">
                  <div className="text-4xl font-mono font-bold text-primary-600 mb-2">
                    {ipData.ip}
                  </div>
                  <Button
                    onClick={() => handleCopy(ipData.ip, 'IP address')}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy IP
                  </Button>
                </div>

                {/* Location Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                      Location Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Location</span>
                        <span className="font-medium">{getLocationString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Country</span>
                        <span className="font-medium">{ipData.country || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Region</span>
                        <span className="font-medium">{ipData.regionName || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">City</span>
                        <span className="font-medium">{ipData.city || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">ZIP Code</span>
                        <span className="font-medium">{ipData.zip || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Wifi className="w-5 h-5 mr-2 text-green-600" />
                      Network Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">ISP</span>
                        <span className="font-medium">{ipData.isp || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Organization</span>
                        <span className="font-medium">{ipData.org || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">AS Number</span>
                        <span className="font-medium">{ipData.as || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Timezone</span>
                        <span className="font-medium">{ipData.timezone || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Coordinates</span>
                        <span className="font-medium">{getCoordinates()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => handleCopy(ipData.ip, 'IP address')}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy IP
                    </Button>
                    <Button
                      onClick={() => handleCopy(getLocationString(), 'Location')}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Location
                    </Button>
                    <Button
                      onClick={() => handleCopy(getCoordinates(), 'Coordinates')}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Coordinates
                    </Button>
                    <Button
                      onClick={() => window.open(`https://www.google.com/maps?q=${ipData.lat},${ipData.lon}`, '_blank')}
                      variant="outline"
                      size="sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Map
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                What is an IP Address?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                An IP (Internet Protocol) address is a unique identifier assigned to every device 
                connected to the internet. It's like a digital address that allows devices to 
                communicate with each other across the network.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2 text-green-600" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Your public IP address can reveal your approximate location and ISP. 
                For enhanced privacy, consider using a VPN service. This tool only shows 
                your public IP - your private network IP remains hidden.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}