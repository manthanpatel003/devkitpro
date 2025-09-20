import Link from 'next/link'
import { Metadata } from 'next'
import { 
  Globe, 
  Code, 
  BarChart3, 
  Database, 
  Image, 
  Settings, 
  Zap,
  ArrowRight,
  CheckCircle2,
  Star,
  Users,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export const metadata: Metadata = {
  title: 'Ultimate Tools Suite - 35+ Free Online Tools for Developers',
  description: 'Professional-grade online tools for developers, designers, and businesses. Free tools for IP checking, SSL analysis, SEO optimization, code formatting, and much more.',
  keywords: [
    'online tools',
    'developer tools',
    'free tools',
    'IP checker',
    'SSL checker',
    'SEO tools',
    'code formatter',
    'JSON formatter',
    'password generator',
    'QR code generator'
  ],
  openGraph: {
    title: 'Ultimate Tools Suite - 35+ Free Online Tools',
    description: 'Professional-grade online tools for developers, designers, and businesses.',
    type: 'website',
  },
}

const categories = [
  {
    name: 'Network & Security',
    icon: Globe,
    color: 'from-blue-500 to-blue-600',
    tools: 7,
    description: 'IP checking, SSL analysis, port scanning, and security tools',
    featured: ['What\'s My IP', 'SSL Checker', 'Port Scanner']
  },
  {
    name: 'Development',
    icon: Code,
    color: 'from-green-500 to-green-600',
    tools: 8,
    description: 'Code formatting, API testing, regex tools, and development utilities',
    featured: ['JSON Formatter', 'Regex Tester', 'API Client']
  },
  {
    name: 'SEO & Marketing',
    icon: BarChart3,
    color: 'from-purple-500 to-purple-600',
    tools: 4,
    description: 'SEO analysis, keyword research, and social media tools',
    featured: ['SEO Analyzer', 'Keyword Research', 'Social Preview']
  },
  {
    name: 'Data & Conversion',
    icon: Database,
    color: 'from-orange-500 to-orange-600',
    tools: 6,
    description: 'Data conversion, encoding, and processing tools',
    featured: ['Base64 Converter', 'Hash Generator', 'CSV Processor']
  },
  {
    name: 'Image & Media',
    icon: Image,
    color: 'from-pink-500 to-pink-600',
    tools: 3,
    description: 'Image optimization, QR codes, and media tools',
    featured: ['Image Optimizer', 'QR Generator', 'Favicon Generator']
  },
  {
    name: 'Utilities',
    icon: Settings,
    color: 'from-gray-500 to-gray-600',
    tools: 3,
    description: 'Password generation, UUID creation, and utility tools',
    featured: ['Password Generator', 'UUID Generator', 'Lorem Generator']
  },
  {
    name: 'Advanced Tools',
    icon: Zap,
    color: 'from-indigo-500 to-indigo-600',
    tools: 7,
    description: 'AI-powered tools, advanced converters, and specialized utilities',
    featured: ['AI Color Palette', 'Text Analyzer', 'Markdown Editor']
  }
]

const features = [
  {
    icon: CheckCircle2,
    title: '100% Free',
    description: 'All tools are completely free with no hidden costs or limitations'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized for speed with sub-2 second load times and instant results'
  },
  {
    icon: Globe,
    title: 'No Registration',
    description: 'Use all tools without creating an account or providing personal information'
  },
  {
    icon: Code,
    title: 'Open Source',
    description: 'Built with modern technologies and open source principles'
  },
  {
    icon: BarChart3,
    title: 'Professional Grade',
    description: 'Enterprise-level functionality that rivals premium SaaS tools'
  },
  {
    icon: Users,
    title: 'Privacy First',
    description: 'All processing happens in your browser - your data never leaves your device'
  }
]

const stats = [
  { label: 'Total Tools', value: '35+' },
  { label: 'Categories', value: '7' },
  { label: 'Free Forever', value: '100%' },
  { label: 'Privacy Focused', value: 'Yes' }
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-purple-600/10"></div>
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Ultimate Tools Suite
              <span className="block gradient-text">35+ Professional Tools</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Professional-grade online tools for developers, designers, and businesses. 
              All completely free, fast, and secure. No registration required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-4">
                Start Using Tools
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                View All Tools
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Explore Tool Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Organized by purpose, each category contains specialized tools for specific tasks
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Card key={index} hover className="group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{category.tools}</div>
                      <div className="text-sm text-gray-500">tools</div>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{category.name}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-6">
                    {category.featured.map((tool, toolIndex) => (
                      <div key={toolIndex} className="flex items-center text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                        {tool}
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full group-hover:bg-primary-50 group-hover:border-primary-200 transition-colors">
                    View Tools
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Tools?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built with modern technology and user experience in mind
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Most Popular Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These are our most frequently used tools by developers and professionals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'What\'s My IP', href: '/whats-my-ip', description: 'Check your public IP address and location', icon: Globe },
              { name: 'JSON Formatter', href: '/json-formatter', description: 'Format, validate, and minify JSON data', icon: Code },
              { name: 'SEO Analyzer', href: '/seo-analyzer', description: 'Comprehensive SEO analysis with AI', icon: BarChart3 },
              { name: 'Password Generator', href: '/password-generator', description: 'Generate secure passwords instantly', icon: Settings }
            ].map((tool, index) => (
              <Card key={index} hover className="group">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-200 transition-colors">
                      <tool.icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span>4.9/5</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{tool.description}</p>
                  <Link href={tool.href}>
                    <Button variant="outline" size="sm" className="w-full group-hover:bg-primary-50 group-hover:border-primary-200 transition-colors">
                      Use Tool
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of developers and professionals who trust our tools for their daily work
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                Browse All Tools
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 bg-white/10 border-white/20 text-white hover:bg-white/20">
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}