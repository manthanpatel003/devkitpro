import { generateToolMetadata } from '@/lib/seo-utils'
import { ADVANCED_TOOLS } from '@/lib/tools-config'
import type { Metadata } from 'next'

const tool = ADVANCED_TOOLS.find(t => t.id === 'markdown-editor')!

export const metadata: Metadata = generateToolMetadata(tool)

export default function MarkdownEditorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
