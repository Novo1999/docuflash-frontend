'use client'

import { Button } from '@heroui/react'
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { DropZone, FileTrigger } from 'react-aria-components'
import { FiUploadCloud } from 'react-icons/fi'
import { LuFile, LuX } from 'react-icons/lu'

interface FileUploadContextValue {
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
}

interface FileUploadRootProps {
  children: ReactNode
  accept?: string[]
  maxFiles?: number
  maxSizeMB?: number
  onFilesChange?: (files: File[]) => void
  className?: string
}

interface FileUploadDropzoneProps {
  label?: string
  description?: string
  className?: string
}

interface FileUploadListProps {
  className?: string
}

const FileUploadContext = createContext<FileUploadContextValue | null>(null)

function useFileUpload() {
  const ctx = useContext(FileUploadContext)
  if (!ctx) throw new Error('FileUpload subcomponents must be used inside <FileUpload>')
  return ctx
}

function FileUploadRoot({ children, accept, maxFiles = 1, maxSizeMB, onFilesChange, className }: FileUploadRootProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileTriggerRef = useRef<HTMLInputElement>(null)

  const validate = useCallback(
    (incoming: File[]): { valid: File[]; error: string | null } => {
      let error: string | null = null
      const valid: File[] = []

      for (const file of incoming) {
        if (accept && accept.length > 0) {
          const matched = accept.some((type) => {
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
    [accept, maxSizeMB],
  )

  const addFiles = useCallback(
    (incoming: File[]) => {
      setErrorMessage(null)
      const { valid, error } = validate(incoming)
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
    [validate, maxFiles, onFilesChange],
  )

  const removeFile = useCallback(
    (name: string) => {
      setFiles((prev) => {
        const next = prev.filter((f) => f.name !== name)
        onFilesChange?.(next)
        return next
      })
    },
    [onFilesChange],
  )

  const openFilePicker = useCallback(() => {
    console.log('Opening file picker...')
    fileTriggerRef.current?.click()
  }, [])

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
      }}
    >
      <FileTrigger
        ref={fileTriggerRef}
        acceptedFileTypes={accept}
        allowsMultiple={maxFiles > 1}
        onSelect={(fileList) => {
          if (fileList) addFiles(Array.from(fileList))
        }}
      >
        <span className="sr-only" />
      </FileTrigger>

      <div className={className}>{children}</div>
    </FileUploadContext.Provider>
  )
}

function FileUploadDropzone({ label = 'Drop your file here', description, className }: FileUploadDropzoneProps) {
  const { addFiles, openFilePicker, isDragOver, setIsDragOver, isInvalid } = useFileUpload()

  return (
    <DropZone
      onDropEnter={() => setIsDragOver(true)}
      onDropExit={() => setIsDragOver(false)}
      onDrop={async (e) => {
        setIsDragOver(false)
        const dropped: File[] = []
        for (const item of e.items) {
          if (item.kind === 'file') {
            const file = await item.getFile()
            dropped.push(file)
          }
        }
        addFiles(dropped)
      }}
      className={[
        'w-full flex flex-col items-center justify-center gap-3 px-6 py-10',
        'border-[1.5px] border-dashed rounded-xl cursor-pointer transition-all duration-200 outline-none',
        isDragOver ? 'border-primary bg-primary/[0.08] scale-[1.01]' : isInvalid ? 'border-red-400 bg-red-50/50' : 'border-border bg-surface-secondary hover:border-primary/60 hover:bg-primary/[0.04]',
        'focus-visible:ring-2 focus-visible:ring-primary/30',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={openFilePicker}
    >
      <div className={['w-12 h-12 rounded-full flex items-center justify-center transition-colors', isDragOver ? 'bg-primary/20' : 'bg-surface'].join(' ')}>
        <FiUploadCloud className={['w-6 h-6 transition-colors', isDragOver ? 'text-primary' : 'text-muted'].join(' ')} />
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && <span className="text-xs text-muted">{description}</span>}
      </div>

      <Button size="sm" variant="outline" type="button" onPress={openFilePicker} className="mt-1">
        Browse files
      </Button>
    </DropZone>
  )
}

function FileUploadList({ className }: FileUploadListProps) {
  const { files, removeFile, errorMessage } = useFileUpload()

  if (files.length === 0 && !errorMessage) return null

  return (
    <div className={['flex flex-col gap-2 mt-3', className].filter(Boolean).join(' ')}>
      {files.map((file) => {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
        return (
          <div key={file.name} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-surface">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <LuFile className="w-4 h-4 text-primary" />
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium text-foreground truncate">{file.name}</span>
              <span className="text-xs text-muted">{sizeMB} MB</span>
            </div>

            <button
              type="button"
              aria-label={`Remove ${file.name}`}
              onClick={() => removeFile(file.name)}
              className="w-7 h-7 rounded-md flex items-center justify-center text-muted hover:text-foreground hover:bg-surface-secondary transition-colors shrink-0"
            >
              <LuX className="w-4 h-4" />
            </button>
          </div>
        )
      })}

      {errorMessage && <p className="text-sm text-danger px-1">{errorMessage}</p>}
    </div>
  )
}

export const FileUpload = Object.assign(FileUploadRoot, {
  Dropzone: FileUploadDropzone,
  List: FileUploadList,
})

export type { FileUploadDropzoneProps, FileUploadListProps, FileUploadRootProps }
