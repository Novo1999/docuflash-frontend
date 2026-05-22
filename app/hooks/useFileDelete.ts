'use client'

import { useState } from 'react'
import { deleteFile } from '@/app/lib/api/files'

export const useFileDelete = () => {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const removeFile = async (id: string) => {
    setIsDeleting(id)
    setError(null)
    try {
      await deleteFile(id)
      return true
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message ?? 'Failed to delete file.')
      } else {
        setError('Failed to delete file.')
      }
      return false
    } finally {
      setIsDeleting(null)
    }
  }

  return { removeFile, isDeleting, error }
}
