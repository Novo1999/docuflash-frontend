'use client'

import { useState, useCallback } from 'react'

export const useCopyLink = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
      return true
    } catch (err) {
      console.error('Failed to copy text: ', err)
      return false
    }
  }, [])

  return { copyToClipboard, copiedId }
}
