import { ToolLayout } from '@/components/tools/ToolLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Ultimate Tools Suite',
    default: 'Developer Tools - Ultimate Tools Suite',
  },
  description:
    'Professional-grade developer tools and utilities. Free online tools for developers, designers, and businesses including code formatters, validators, converters, and analyzers.',
  keywords: [
    'developer tools',
    'online tools',
    'free tools',
    'code formatter',
    'json validator',
    'regex tester',
    'api client',
    'jwt analyzer',
    'sql formatter',
    'diff checker',
    'base64 converter',
    'hash generator',
    'url encoder',
    'csv processor',
    'xml formatter',
    'yaml converter',
    'image optimizer',
    'qr generator',
    'favicon generator',
    'password generator',
    'uuid generator',
    'lorem ipsum',
    'color palette',
    'text analyzer',
    'markdown editor',
    'unit converter',
    'timestamp converter',
    'html encoder',
  ],
  openGraph: {
    title: 'Developer Tools - Ultimate Tools Suite',
    description:
      'Professional-grade developer tools and utilities. Free online tools for developers, designers, and businesses.',
    type: 'website',
    images: [
      {
        url: '/og-tools.png',
        width: 1200,
        height: 630,
        alt: 'Developer Tools - Ultimate Tools Suite',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Developer Tools - Ultimate Tools Suite',
    description:
      'Professional-grade developer tools and utilities. Free online tools for developers, designers, and businesses.',
    images: ['/og-tools.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/tools',
  },
}

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <ToolLayout>{children}</ToolLayout>
}
