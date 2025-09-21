import { FadeIn } from '@/components/animations/FadeIn'
import { SEO } from '@/components/layout/SEO'
import { ToolList } from '@/components/tools/ToolList'
import { ADVANCED_TOOLS, TOOL_CATEGORIES } from '@/lib/tools-config'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Developer Tools - 35+ Free Online Tools',
  description:
    'Browse our complete collection of 35+ free developer tools and utilities. JSON formatter, IP checker, SSL analyzer, QR generator, code formatter, and much more. No registration required.',
  keywords: [
    'developer tools',
    'free tools',
    'utilities',
    'online tools',
    'web development',
    'code formatter',
    'json formatter',
    'ip checker',
    'ssl checker',
    'qr generator',
    'password generator',
    'base64 converter',
    'hash generator',
    'url encoder',
    'image optimizer',
    'markdown editor',
    'unit converter',
    'timestamp converter',
    'regex tester',
    'api client',
    'jwt analyzer',
    'sql formatter',
    'diff checker',
    'keyword research',
    'social preview',
    'sitemap generator',
    'csv processor',
    'xml formatter',
    'yaml converter',
    'favicon generator',
    'uuid generator',
    'lorem ipsum',
    'color palette',
    'text analyzer',
    'cron generator',
    'port scanner',
    'dns lookup',
    'website monitor',
    'security headers',
    'speed test',
    'html encoder',
  ],
  openGraph: {
    title: 'All Developer Tools - 35+ Free Online Tools',
    description:
      'Browse our complete collection of 35+ free developer tools and utilities. JSON formatter, IP checker, SSL analyzer, QR generator, code formatter, and much more.',
    url: 'https://ultimate-tools-suite.vercel.app/tools',
    type: 'website',
    images: [
      {
        url: 'https://ultimate-tools-suite.vercel.app/og-tools.png',
        width: 1200,
        height: 630,
        alt: 'All Developer Tools - Ultimate Tools Suite',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Developer Tools - 35+ Free Online Tools',
    description: 'Browse our complete collection of 35+ free developer tools and utilities.',
    images: ['https://ultimate-tools-suite.vercel.app/og-tools.png'],
  },
}

export default function ToolsPage() {
  const featuredTools = ADVANCED_TOOLS.filter(tool => tool.featured)
  const popularTools = ADVANCED_TOOLS.filter(tool => tool.popular)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Developer Tools Collection',
    description: 'Complete collection of 35+ free developer tools and utilities',
    numberOfItems: ADVANCED_TOOLS.length,
    itemListElement: ADVANCED_TOOLS.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'WebApplication',
        name: tool.name,
        description: tool.description,
        url: `https://ultimate-tools-suite.vercel.app${tool.path}`,
        applicationCategory: 'DeveloperApplication',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        isAccessibleForFree: true,
      },
    })),
  }

  return (
    <>
      <SEO
        title="All Developer Tools - 35+ Free Online Tools"
        description="Browse our complete collection of 35+ free developer tools and utilities. JSON formatter, IP checker, SSL analyzer, QR generator, code formatter, and much more. No registration required."
        canonical="/tools"
        keywords={[
          'developer tools',
          'free tools',
          'utilities',
          'online tools',
          'web development',
          'code formatter',
          'json formatter',
          'ip checker',
          'ssl checker',
          'qr generator',
          'password generator',
          'base64 converter',
          'hash generator',
          'url encoder',
          'image optimizer',
          'markdown editor',
          'unit converter',
          'timestamp converter',
          'regex tester',
          'api client',
          'jwt analyzer',
          'sql formatter',
          'diff checker',
          'keyword research',
          'social preview',
          'sitemap generator',
          'csv processor',
          'xml formatter',
          'yaml converter',
          'favicon generator',
          'uuid generator',
          'lorem ipsum',
          'color palette',
          'text analyzer',
          'cron generator',
          'port scanner',
          'dns lookup',
          'website monitor',
          'security headers',
          'speed test',
          'html encoder',
        ]}
        openGraph={{
          title: 'All Developer Tools - 35+ Free Online Tools',
          description:
            'Browse our complete collection of 35+ free developer tools and utilities. JSON formatter, IP checker, SSL analyzer, QR generator, code formatter, and much more.',
          url: 'https://ultimate-tools-suite.vercel.app/tools',
          type: 'website',
          images: [
            {
              url: 'https://ultimate-tools-suite.vercel.app/og-tools.png',
              width: 1200,
              height: 630,
              alt: 'All Developer Tools - Ultimate Tools Suite',
            },
          ],
        }}
        twitter={{
          card: 'summary_large_image',
          title: 'All Developer Tools - 35+ Free Online Tools',
          description: 'Browse our complete collection of 35+ free developer tools and utilities.',
          images: ['https://ultimate-tools-suite.vercel.app/og-tools.png'],
        }}
        jsonLd={structuredData}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="border-b bg-muted/30">
          <div className="container px-4 py-12">
            <FadeIn>
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">All Developer Tools</h1>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  Discover our complete collection of free developer tools and utilities. Everything
                  you need to boost your productivity in one place.
                </p>
                <div className="flex justify-center space-x-8 text-sm text-muted-foreground">
                  <div>
                    <span className="font-semibold text-primary">{ADVANCED_TOOLS.length}</span>{' '}
                    Tools
                  </div>
                  <div>
                    <span className="font-semibold text-primary">{TOOL_CATEGORIES.length}</span>{' '}
                    Categories
                  </div>
                  <div>
                    <span className="font-semibold text-primary">100%</span> Free
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        <div className="container px-4 py-12">
          {/* Featured Tools */}
          {featuredTools.length > 0 && (
            <FadeIn delay={200}>
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Featured Tools</h2>
                <ToolList featuredOnly={true} showSearch={false} showCategories={false} />
              </div>
            </FadeIn>
          )}

          {/* Popular Tools */}
          {popularTools.length > 0 && (
            <FadeIn delay={400}>
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Popular Tools</h2>
                <ToolList popularOnly={true} showSearch={false} showCategories={false} />
              </div>
            </FadeIn>
          )}

          {/* All Tools with Search and Categories */}
          <FadeIn delay={600}>
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">All Tools</h2>
                <ToolList showSearch={true} showCategories={true} />
              </div>
            </div>
          </FadeIn>
        </div>
      </main>
    </>
  )
}
