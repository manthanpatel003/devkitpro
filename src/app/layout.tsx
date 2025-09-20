import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/Toast'
import { Navigation } from '@/components/Navigation'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'Ultimate Tools Suite - 35+ Free Online Tools',
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
    'QR code generator',
    'base64 converter',
    'hash generator',
    'URL encoder',
    'image optimizer',
    'markdown editor',
    'unit converter',
    'timestamp converter'
  ],
  authors: [{ name: 'Ultimate Tools Suite' }],
  creator: 'Ultimate Tools Suite',
  publisher: 'Ultimate Tools Suite',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ultimate-tools-suite.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ultimate-tools-suite.vercel.app',
    title: 'Ultimate Tools Suite - 35+ Free Online Tools',
    description: 'Professional-grade online tools for developers, designers, and businesses. Free tools for IP checking, SSL analysis, SEO optimization, code formatting, and much more.',
    siteName: 'Ultimate Tools Suite',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ultimate Tools Suite - Professional Online Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ultimate Tools Suite - 35+ Free Online Tools',
    description: 'Professional-grade online tools for developers, designers, and businesses.',
    images: ['/og-image.png'],
    creator: '@ultimatetools',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.allorigins.win" />
        <link rel="dns-prefetch" href="https://dns.google" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className={`${inter.className} h-full bg-gray-50 antialiased`}>
        <ErrorBoundary>
          <ToastProvider>
            <div className="min-h-full">
              <Navigation />
              <main className="flex-1">
                {children}
              </main>
            <footer className="bg-gray-900 text-white py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="col-span-1 md:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Ultimate Tools Suite</h3>
                    <p className="text-gray-300 mb-4">
                      Professional-grade online tools for developers, designers, and businesses. 
                      All tools are completely free and work entirely in your browser.
                    </p>
                    <div className="flex space-x-4">
                      <a href="#" className="text-gray-300 hover:text-white transition-colors">
                        GitHub
                      </a>
                      <a href="#" className="text-gray-300 hover:text-white transition-colors">
                        Twitter
                      </a>
                      <a href="#" className="text-gray-300 hover:text-white transition-colors">
                        LinkedIn
                      </a>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                      Tools
                    </h4>
                    <ul className="space-y-2">
                      <li><a href="/whats-my-ip" className="text-gray-300 hover:text-white transition-colors">IP Checker</a></li>
                      <li><a href="/ssl-checker" className="text-gray-300 hover:text-white transition-colors">SSL Checker</a></li>
                      <li><a href="/seo-analyzer" className="text-gray-300 hover:text-white transition-colors">SEO Analyzer</a></li>
                      <li><a href="/json-formatter" className="text-gray-300 hover:text-white transition-colors">JSON Formatter</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                      Resources
                    </h4>
                    <ul className="space-y-2">
                      <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Documentation</a></li>
                      <li><a href="#" className="text-gray-300 hover:text-white transition-colors">API Reference</a></li>
                      <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
                      <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a></li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-800">
                  <p className="text-gray-400 text-sm text-center">
                    © 2024 Ultimate Tools Suite. All rights reserved. Built with Next.js and TypeScript.
                  </p>
                </div>
              </div>
            </footer>
            </div>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}