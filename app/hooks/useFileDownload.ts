'use client'

import { useState } from 'react'
import { getFileDownloadUrl } from '@/app/lib/api/files'
import { triggerDownload } from '@/app/utils/shareFileUtil'

export const useFileDownload = () => {
  const [isDownloading, setIsDownloading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const downloadFile = async (shareToken: string, fileName: string, accessToken?: string) => {
    setIsDownloading(shareToken)
    setError(null)
    try {
      const { fileUrl } = await getFileDownloadUrl(shareToken, accessToken)
      triggerDownload(fileUrl, fileName)
      return true
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message ?? 'Download failed. Please try again.')
      } else {
        setError('Download failed. Please try again.')
      }
      return false
    } finally {
      setIsDownloading(null)
    }
  }

  return { 
    downloadFile, 
    isDownloading, // returns the shareToken of the file being downloaded, or null
    error, 
    setError 
  }
}
