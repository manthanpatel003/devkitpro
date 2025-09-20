'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Menu, 
  X, 
  Search, 
  Globe, 
  Code, 
  BarChart3, 
  Database, 
  Image, 
  Settings, 
  Zap,
  ChevronDown
} from 'lucide-react'

const tools = [
  {
    category: 'Network & Security',
    icon: Globe,
    color: 'text-blue-600',
    tools: [
      { name: 'What\'s My IP', href: '/whats-my-ip', description: 'Check your public IP address and location' },
      { name: 'SSL Certificate Checker', href: '/ssl-checker', description: 'Verify SSL certificate validity and details' },
      { name: 'Port Scanner', href: '/port-scanner', description: 'Scan open ports on any host' },
      { name: 'DNS Lookup', href: '/dns-lookup', description: 'Query DNS records for any domain' },
      { name: 'Website Uptime Monitor', href: '/website-monitor', description: 'Monitor website availability and response times' },
      { name: 'Security Headers Analyzer', href: '/security-headers', description: 'Analyze website security headers' },
      { name: 'Internet Speed Test', href: '/speed-test', description: 'Test your internet connection speed' }
    ]
  },
  {
    category: 'Development',
    icon: Code,
    color: 'text-green-600',
    tools: [
      { name: 'JSON Formatter', href: '/json-formatter', description: 'Format, validate, and minify JSON' },
      { name: 'Regex Tester', href: '/regex-tester', description: 'Test and debug regular expressions' },
      { name: 'REST API Client', href: '/api-client', description: 'Test API endpoints and requests' },
      { name: 'Code Minifier', href: '/code-minifier', description: 'Minify CSS, JS, HTML, and more' },
      { name: 'JWT Token Analyzer', href: '/jwt-analyzer', description: 'Decode and analyze JWT tokens' },
      { name: 'SQL Formatter', href: '/sql-formatter', description: 'Format and beautify SQL queries' },
      { name: 'Cron Expression Builder', href: '/cron-generator', description: 'Generate and validate cron expressions' },
      { name: 'Diff Checker', href: '/diff-checker', description: 'Compare text and code differences' }
    ]
  },
  {
    category: 'SEO & Marketing',
    icon: BarChart3,
    color: 'text-purple-600',
    tools: [
      { name: 'SEO Analyzer', href: '/seo-analyzer', description: 'Comprehensive SEO analysis with AI recommendations' },
      { name: 'Keyword Research', href: '/keyword-research', description: 'Find relevant keywords and search volume' },
      { name: 'Social Media Preview', href: '/social-preview', description: 'Preview how your content looks on social media' },
      { name: 'XML Sitemap Generator', href: '/sitemap-generator', description: 'Generate XML sitemaps for your website' }
    ]
  },
  {
    category: 'Data & Conversion',
    icon: Database,
    color: 'text-orange-600',
    tools: [
      { name: 'Base64 Converter', href: '/base64-converter', description: 'Encode and decode Base64 strings' },
      { name: 'Hash Generator', href: '/hash-generator', description: 'Generate MD5, SHA1, SHA256 hashes' },
      { name: 'URL Encoder/Decoder', href: '/url-encoder', description: 'Encode and decode URL strings' },
      { name: 'CSV Data Processor', href: '/csv-processor', description: 'Process and convert CSV data' },
      { name: 'XML Formatter', href: '/xml-formatter', description: 'Format and validate XML documents' },
      { name: 'YAML Converter', href: '/yaml-converter', description: 'Convert between YAML and JSON' }
    ]
  },
  {
    category: 'Image & Media',
    icon: Image,
    color: 'text-pink-600',
    tools: [
      { name: 'Image Optimizer', href: '/image-optimizer', description: 'Compress and optimize images' },
      { name: 'QR Code Generator', href: '/qr-generator', description: 'Generate QR codes for any text or URL' },
      { name: 'Favicon Generator', href: '/favicon-generator', description: 'Generate favicons from images' }
    ]
  },
  {
    category: 'Utilities',
    icon: Settings,
    color: 'text-gray-600',
    tools: [
      { name: 'Password Generator', href: '/password-generator', description: 'Generate secure passwords' },
      { name: 'UUID Generator', href: '/uuid-generator', description: 'Generate UUIDs and GUIDs' },
      { name: 'Lorem Ipsum Generator', href: '/lorem-generator', description: 'Generate placeholder text' }
    ]
  },
  {
    category: 'Advanced Tools',
    icon: Zap,
    color: 'text-indigo-600',
    tools: [
      { name: 'AI Color Palette', href: '/color-palette', description: 'Generate color palettes with AI' },
      { name: 'Text Analyzer', href: '/text-analyzer', description: 'Analyze text statistics and readability' },
      { name: 'Markdown Editor', href: '/markdown-editor', description: 'Live markdown editor with preview' },
      { name: 'Unit Converter', href: '/unit-converter', description: 'Convert between different units' },
      { name: 'Code Formatter', href: '/code-formatter', description: 'Format code in multiple languages' },
      { name: 'Timestamp Converter', href: '/timestamp-converter', description: 'Convert timestamps and dates' },
      { name: 'HTML Entity Encoder', href: '/html-encoder', description: 'Encode and decode HTML entities' }
    ]
  }
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const pathname = usePathname()

  const filteredTools = tools.map(category => ({
    ...category,
    tools: category.tools.filter(tool =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.tools.length > 0)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Ultimate Tools</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link
              href="/"
              className={cn(
                'text-sm font-medium transition-colors',
                pathname === '/' ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Home
            </Link>
            <div className="relative group">
              <button className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                <span>Tools</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    {tools.slice(0, 4).map(category => (
                      <div key={category.category}>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          {category.category}
                        </h3>
                        <ul className="space-y-1">
                          {category.tools.slice(0, 3).map(tool => (
                            <li key={tool.href}>
                              <Link
                                href={tool.href}
                                className="text-sm text-gray-600 hover:text-primary-600 transition-colors block py-1"
                              >
                                {tool.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link
                      href="/tools"
                      className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      View all tools →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <Link
              href="/about"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              About
            </Link>
          </div>

          {/* Search and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="py-4 border-t border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                autoFocus
              />
            </div>
            {searchQuery && (
              <div className="mt-4 max-h-96 overflow-y-auto">
                {filteredTools.map(category => (
                  <div key={category.category} className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      {category.category}
                    </h3>
                    <div className="space-y-1">
                      {category.tools.map(tool => (
                        <Link
                          key={tool.href}
                          href={tool.href}
                          className="block p-2 rounded-lg hover:bg-gray-50 transition-colors"
                          onClick={() => setShowSearch(false)}
                        >
                          <div className="font-medium text-gray-900">{tool.name}</div>
                          <div className="text-sm text-gray-500">{tool.description}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white">
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
            <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Ultimate Tools</span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="h-full overflow-y-auto pb-20">
            <div className="p-4 space-y-6">
              {tools.map(category => (
                <div key={category.category}>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                    <category.icon className={`w-4 h-4 mr-2 ${category.color}`} />
                    {category.category}
                  </h3>
                  <div className="space-y-1">
                    {category.tools.map(tool => (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="font-medium text-gray-900">{tool.name}</div>
                        <div className="text-sm text-gray-500 mt-1">{tool.description}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}