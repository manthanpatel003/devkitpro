import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/seo-utils'
import { ADVANCED_TOOLS } from '@/lib/tools-config'

const tool = ADVANCED_TOOLS.find(t => t.id === 'password-generator')!

export const metadata: Metadata = generateToolMetadata(tool)

export default function PasswordgeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
