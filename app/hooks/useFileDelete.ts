'use client'

import { deleteFile } from '@/app/actions/actions'
import { useState } from 'react'

export const useFileDelete = (folderToken?: string) => {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const removeFile = async (id: string) => {
    setIsDeleting(id)
    setError(null)
    try {
      await deleteFile(id, folderToken)
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
