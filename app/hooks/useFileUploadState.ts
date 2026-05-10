import { useState } from 'react'

const useFileUploadState = () => {
  const [shareLinks, setShareLinks] = useState<string | null>(null)
  const [lastShareToken, setLastShareToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  return { shareLinks, setShareLinks, lastShareToken, setLastShareToken, copied, setCopied, showPassword, setShowPassword }
}

export default useFileUploadState
