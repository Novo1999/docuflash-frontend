import { useState } from 'react'
import type { UploadedShareLink } from '@/types/file'

const useFileUploadState = () => {
  const [shareLinks, setShareLinks] = useState<UploadedShareLink[] | null>(null)
  const [lastShareToken, setLastShareToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  return { shareLinks, setShareLinks, lastShareToken, setLastShareToken, copied, setCopied, showPassword, setShowPassword }
}

export default useFileUploadState
