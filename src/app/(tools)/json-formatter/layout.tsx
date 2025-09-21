import { generateToolMetadata } from '@/lib/seo-utils'
import { ADVANCED_TOOLS } from '@/lib/tools-config'
import type { Metadata } from 'next'

const tool = ADVANCED_TOOLS.find(t => t.id === 'json-formatter')!

export const metadata: Metadata = generateToolMetadata(tool)

export default function JSONFormatterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
