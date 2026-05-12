'use client'

import { createContext, useContext } from 'react'

export interface FileUploadContextValue {
  files: File[]
  isDragOver: boolean
  isInvalid: boolean
  errorMessage: string | null
  accept: string[] | undefined
  maxFiles: number
  maxSizeMB: number | undefined
  addFiles: (incoming: File[]) => void
  removeFile: (name: string) => void
  openFilePicker: () => void
  setIsDragOver: (v: boolean) => void
  isDisabled?: boolean
}

export const FileUploadContext = createContext<FileUploadContextValue | null>(null)

export const useFileUpload = () => {
  const ctx = useContext(FileUploadContext)
  if (!ctx) throw new Error('FileUpload subcomponents must be used inside <FileUpload>')
  return ctx
}
