'use client'

import { useState } from 'react'
import { deleteFolderByShareToken } from '@/app/lib/api/folder'
import { useRouter } from 'next/navigation'

export const useFolderDelete = () => {
  const [isDeletingFolder, setIsDeletingFolder] = useState(false)
  const [folderDeleteError, setFolderDeleteError] = useState<string | null>(null)
  const router = useRouter()

  const removeFolder = async (shareToken: string) => {
    setIsDeletingFolder(true)
    setFolderDeleteError(null)
    try {
      await deleteFolderByShareToken(shareToken)
      router.push('/')
      return true
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFolderDeleteError(err.message ?? 'Failed to delete folder.')
      } else {
        setFolderDeleteError('Failed to delete folder.')
      }
      return false
    } finally {
      setIsDeletingFolder(false)
    }
  }

  return { removeFolder, isDeletingFolder, folderDeleteError }
}
