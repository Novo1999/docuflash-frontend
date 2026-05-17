'use client'

import { FileUploadContext } from '@/components/file/FileUploadContext'
import { useCallback, useRef, useState, type ReactNode } from 'react'
import { FileTrigger } from 'react-aria-components'

export interface FileUploadRootProps {
  children: ReactNode
  accept?: string[]
  maxFiles?: number
  maxSizeMB?: number
  onFilesChange?: (files: File[]) => void
  className?: string
  isDisabled?: boolean
}

const FileUploadRoot = ({ children, accept, maxFiles = 1, maxSizeMB, onFilesChange, className, isDisabled }: FileUploadRootProps) => {
  const [files, setFiles] = useState<File[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileTriggerRef = useRef<HTMLInputElement>(null)

  const validate = useCallback(
    (incoming: File[]): { valid: File[]; error: string | null } => {
      if (isDisabled) return { valid: [], error: null }
      let error: string | null = null
      const valid: File[] = []

      for (const file of incoming) {
        if (accept && accept.length > 0) {
          const matched = accept.some((type) => {
            if (type.startsWith('.')) {
              return file.name.toLowerCase().endsWith(type.toLowerCase())
            }
            if (type.endsWith('/*')) {
              return file.type.startsWith(type.slice(0, -1))
            }
            return file.type === type
          })
          if (!matched) {
            error = `File type "${file.type || file.name}" is not allowed.`
            continue
          }
        }
        if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
          error = `"${file.name}" exceeds the ${maxSizeMB} MB limit.`
          continue
        }
        valid.push(file)
      }
      return { valid, error }
    },
    [accept, maxSizeMB, isDisabled],
  )

  const addFiles = useCallback(
    (incoming: File[]) => {
      setErrorMessage(null)
      const remainingSlots = maxFiles === 1 ? 1 : Math.max(maxFiles - files.length, 0)
      const candidates = incoming.slice(0, remainingSlots)

      if (candidates.length === 0) return

      const { valid, error } = validate(candidates)
      if (error) {
        setErrorMessage(error)
        return
      }
      setFiles((prev) => {
        const merged = maxFiles === 1 ? valid.slice(0, 1) : [...prev, ...valid].slice(0, maxFiles)
        onFilesChange?.(merged)
        return merged
      })
    },
    [files.length, validate, maxFiles, onFilesChange],
  )

  const removeFile = useCallback(
    (name: string) => {
      if (isDisabled) return
      setFiles((prev) => {
        const next = prev.filter((f) => f.name !== name)
        onFilesChange?.(next)
        return next
      })
      if (fileTriggerRef.current) fileTriggerRef.current.value = ''
    },
    [onFilesChange, isDisabled],
  )

  const openFilePicker = useCallback(() => {
    if (isDisabled) return
    fileTriggerRef.current?.click()
  }, [isDisabled])

  return (
    <FileUploadContext.Provider
      value={{
        files,
        isDragOver,
        isInvalid: !!errorMessage,
        errorMessage,
        accept,
        maxFiles,
        maxSizeMB,
        addFiles,
        removeFile,
        openFilePicker,
        setIsDragOver,
        isDisabled,
      }}
    >
      <FileTrigger
        ref={fileTriggerRef}
        acceptedFileTypes={accept}
        allowsMultiple={maxFiles > 1}
        onSelect={(fileList) => {
          if (fileList) addFiles(Array.from(fileList))
          if (fileTriggerRef.current) fileTriggerRef.current.value = ''
        }}
      >
        <span className="sr-only" />
      </FileTrigger>

      <div className={className}>{children}</div>
    </FileUploadContext.Provider>
  )
}

export default FileUploadRoot
