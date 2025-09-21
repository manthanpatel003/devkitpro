import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Navigation } from '@/components/Navigation'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { ToastProvider } from '@/components/ui/Toast'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Ultimate Tools Suite - 35+ Free Online Tools',
    template: '%s | Ultimate Tools Suite',
  },
  description:
    'Professional-grade online tools for developers, designers, and businesses. 35+ free tools including IP checker, SSL analyzer, SEO tools, code formatter, JSON validator, password generator, QR code creator, and much more. No registration required.',
  keywords: [
    'online tools',
    'developer tools',
    'free tools',
    'web tools',
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
    'timestamp converter',
    'regex tester',
    'API client',
    'JWT analyzer',
    'SQL formatter',
    'diff checker',
    'keyword research',
    'social preview',
    'sitemap generator',
    'CSV processor',
    'XML formatter',
    'YAML converter',
    'favicon generator',
    'UUID generator',
    'lorem ipsum',
    'color palette',
    'text analyzer',
    'cron generator',
    'port scanner',
    'DNS lookup',
    'website monitor',
    'security headers',
    'speed test',
    'html encoder',
  ],
  authors: [{ name: 'Ultimate Tools Suite', url: 'https://ultimate-tools-suite.vercel.app' }],
  creator: 'Ultimate Tools Suite',
  publisher: 'Ultimate Tools Suite',
  applicationName: 'Ultimate Tools Suite',
  category: 'Technology',
  classification: 'Developer Tools',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ultimate-tools-suite.vercel.app'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ultimate-tools-suite.vercel.app',
    title: 'Ultimate Tools Suite - 35+ Free Online Tools',
    description:
      'Professional-grade online tools for developers, designers, and businesses. 35+ free tools including IP checker, SSL analyzer, SEO tools, code formatter, and much more.',
    siteName: 'Ultimate Tools Suite',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ultimate Tools Suite - Professional Online Tools',
        type: 'image/png',
      },
      {
        url: '/og-image-square.png',
        width: 1200,
        height: 1200,
        alt: 'Ultimate Tools Suite - Professional Online Tools',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@ultimate_tools',
    creator: '@ultimate_tools',
    title: 'Ultimate Tools Suite - 35+ Free Online Tools',
    description:
      'Professional-grade online tools for developers, designers, and businesses. 35+ free tools including IP checker, SSL analyzer, SEO tools, code formatter, and much more.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    other: {
      'msvalidate.01': 'your-bing-verification-code',
      'yandex-verification': 'your-yandex-verification-code',
    },
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Ultimate Tools Suite',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#2563eb',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#2563eb',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* Inline theme script to prevent FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('ultimate-tools-theme') || 'system';
                  var root = document.documentElement;
                  
                  if (theme === 'system') {
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    root.classList.add(prefersDark ? 'dark' : 'light');
                  } else {
                    root.classList.add(theme);
                  }
                  
                  // Add theme transition class for smooth transitions
                  root.classList.add('theme-transition');
                  
                  // Remove transition class after theme is applied
                  setTimeout(function() {
                    root.classList.remove('theme-transition');
                  }, 10);
                } catch (e) {
                  // Fallback to light theme if localStorage fails
                  document.documentElement.classList.add('light');
                }
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.allorigins.win" />
        <link rel="dns-prefetch" href="https://dns.google" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className={`${inter.className} h-full bg-background text-foreground antialiased`}>
        <ErrorBoundary>
          <ThemeProvider
            defaultTheme="system"
            storageKey="ultimate-tools-theme"
            enableSystem={true}
            disableTransitionOnChange={true}
          >
            <ToastProvider>
              <div className="min-h-full flex flex-col">
                <Navigation />
                <main className="flex-1">{children}</main>
                <footer className="bg-card border-t">
                  <div className="container py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                      <div className="col-span-1 md:col-span-2">
                        <h3 className="text-lg font-semibold mb-4">Ultimate Tools Suite</h3>
                        <p className="text-muted-foreground mb-4">
                          Professional-grade online tools for developers, designers, and businesses.
                          All tools are completely free and work entirely in your browser.
                        </p>
                        <div className="flex space-x-4">
                          <a
                            href="https://github.com/ultimate-tools-suite"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            GitHub
                          </a>
                          <a
                            href="https://twitter.com/ultimate_tools"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Twitter
                          </a>
                          <a
                            href="https://linkedin.com/company/ultimate-tools-suite"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            LinkedIn
                          </a>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                          Popular Tools
                        </h4>
                        <ul className="space-y-2">
                          <li>
                            <a
                              href="/whats-my-ip"
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              IP Checker
                            </a>
                          </li>
                          <li>
                            <a
                              href="/ssl-checker"
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              SSL Checker
                            </a>
                          </li>
                          <li>
                            <a
                              href="/seo-analyzer"
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              SEO Analyzer
                            </a>
                          </li>
                          <li>
                            <a
                              href="/json-formatter"
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              JSON Formatter
                            </a>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                          Resources
                        </h4>
                        <ul className="space-y-2">
                          <li>
                            <a
                              href="/tools"
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              All Tools
                            </a>
                          </li>
                          <li>
                            <a
                              href="/api-tester"
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              API Tester
                            </a>
                          </li>
                          <li>
                            <a
                              href="#"
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              Privacy Policy
                            </a>
                          </li>
                          <li>
                            <a
                              href="#"
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              Terms of Service
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="mt-8 pt-8 border-t">
                      <p className="text-muted-foreground text-sm text-center">
                        © 2024 Ultimate Tools Suite. All rights reserved. Built with Next.js and
                        TypeScript.
                      </p>
                    </div>
                  </div>
                </footer>
              </div>
            </ToastProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
