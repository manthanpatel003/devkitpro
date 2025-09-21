import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/seo-utils'
import { ADVANCED_TOOLS } from '@/lib/tools-config'

const tool = ADVANCED_TOOLS.find(t => t.id === 'diff-checker')!

export const metadata: Metadata = generateToolMetadata(tool)

export default function DiffcheckerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
