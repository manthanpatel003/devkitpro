'use client'

import { copyToClipboard } from '@/lib/utils'
import { useState } from 'react'

export function useCopyToClipboard() {
  const [isCopied, setIsCopied] = useState(false)

  const copy = async (text: string) => {
    try {
      const success = await copyToClipboard(text)
      setIsCopied(success)

      if (success) {
        // Reset the copied state after 2 seconds
        setTimeout(() => setIsCopied(false), 2000)
      }

      return success
    } catch (error) {
      console.error('Failed to copy text:', error)
      setIsCopied(false)
      return false
    }
  }

  return { isCopied, copy }
}
