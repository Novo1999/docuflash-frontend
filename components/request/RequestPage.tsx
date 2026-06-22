'use client'

import { useFileDownload } from '@/app/hooks/useFileDownload'
import { useRequestRealtime, type UploadingPayload } from '@/app/hooks/useRequestRealtime'
import { fetchFolderByShareToken, uploadToRequest } from '@/app/lib/api/folder'
import { deleteUploadedStorageFile } from '@/app/lib/api/files'
import { useUploadThing } from '@/app/utils/generateReactHelpers'
import { formatFileSize, getFileTypeInfo } from '@/app/utils/shareFileUtil'
import { getClientId, getDeviceInfo, resolveFileType } from '@/app/utils/upload'
import { userAtom } from '@/components/auth/atoms/authAtom'
import { ACCEPTED_UPLOAD_FILE_TYPES, MAX_UPLOAD_FILES, MAX_UPLOAD_FILE_SIZE_MB } from '@/app/constants/upload'
import FileUploadDropzone from '@/components/file/FileUploadDropzone'
import FileUploadList from '@/components/file/FileUploadList'
import FileUploadRoot from '@/components/file/FileUploadRoot'
import type { RequestFileUpload } from '@/types/folder'
import { FolderRecord } from '@/types/folder'
import { Button, Card, CardContent, Chip, Spinner } from '@heroui/react'
import { useAtom, useAtomValue } from 'jotai'
import { atomWithQuery, queryClientAtom } from 'jotai-tanstack-query'
import { useMemo, useState } from 'react'
import { LuClock, LuDownload, LuFile, LuInbox, LuLoaderCircle } from 'react-icons/lu'

interface RequestPageProps {
  initialFolder: FolderRecord
  shareToken: string
}

const RequestPage = ({ initialFolder, shareToken }: RequestPageProps) => {
  const user = useAtomValue(userAtom)
  const queryClient = useAtomValue(queryClientAtom)

  const folderQueryAtom = useMemo(
    () =>
      atomWithQuery(() => ({
        queryKey: ['request-folder', shareToken],
        queryFn: () => fetchFolderByShareToken(shareToken),
        initialData: initialFolder,
      })),
    [shareToken, initialFolder],
  )
  const [folderQuery] = useAtom(folderQueryAtom)
  const folder = folderQuery.data ?? initialFolder
  const files = folder.files ?? []

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [resetKey, setResetKey] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [incoming, setIncoming] = useState<UploadingPayload | null>(null)

  const { downloadFile, isDownloading, error: downloadError } = useFileDownload()

  const { broadcastUploading, broadcastComplete } = useRequestRealtime(shareToken, {
    onUploading: (payload) => {
      setIncoming(payload)
      window.setTimeout(() => setIncoming((current) => (current === payload ? null : current)), 15000)
    },
    onComplete: () => {
      setIncoming(null)
      void queryClient.invalidateQueries({ queryKey: ['request-folder', shareToken] })
    },
  })

  const { startUpload } = useUploadThing('fileUploader', {
    onUploadError: () => setError('Upload failed. Please try again.'),
  })

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    const filesWithTypes = selectedFiles.map((file) => ({ file, fileType: resolveFileType(file) }))
    const unsupported = filesWithTypes.find(({ fileType }) => !fileType)?.file
    if (unsupported) {
      setError(`"${unsupported.name}" is not supported.`)
      return
    }

    setError(null)
    setIsUploading(true)

    const uploaderName = user?.displayName ?? null
    const representativeName = selectedFiles.length > 1 ? `${selectedFiles.length} files` : selectedFiles[0].name
    broadcastUploading({ fileName: representativeName, uploaderName })

    try {
      const uploaded = (await startUpload(selectedFiles)) ?? []
      if (uploaded.length !== filesWithTypes.length) {
        throw new Error('Upload did not return every storage key')
      }

      const clientId = getClientId()
      const deviceInfo = getDeviceInfo()

      const payload: RequestFileUpload[] = uploaded.map((file, index) => {
        const fileType = filesWithTypes[index]?.fileType
        if (!fileType) throw new Error(`Could not resolve file type for ${file.name}`)
        return {
          fileName: file.name,
          fileType,
          fileSize: file.size,
          storageKey: file.key,
          clientId,
          deviceInfo,
        }
      })

      try {
        await uploadToRequest(shareToken, payload)
      } catch (attachError) {
        await Promise.allSettled(uploaded.map((file) => deleteUploadedStorageFile(file.key)))
        throw attachError
      }

      await queryClient.invalidateQueries({ queryKey: ['request-folder', shareToken] })
      broadcastComplete()

      setSelectedFiles([])
      setResetKey((key) => key + 1)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message || 'Upload failed. Please try again.' : 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--brand-50)]">
      <div className="max-w-[720px] mx-auto pt-[72px] pb-10 px-4 flex flex-col gap-6">
        <div className="flex flex-row gap-4 items-start">
          <div className="w-16 h-16 bg-[var(--brand-alpha-12)] rounded-xl flex items-center justify-center shrink-0">
            <LuInbox className="text-[var(--brand-400)] w-8 h-8" />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <h1 className="text-xl font-serif text-[var(--ink-900)] break-words leading-tight">{folder.folderName}</h1>
            <p className="text-sm text-[var(--ink-600)] font-sans">Upload files here to send them. They&apos;re deleted automatically 2 hours after upload.</p>
            <div className="flex flex-row gap-2 flex-wrap items-center mt-1">
              <Chip size="sm" variant="secondary" className="font-medium px-2">
                {files.length} {files.length === 1 ? 'File' : 'Files'} collected
              </Chip>
            </div>
          </div>
        </div>

        <Card className="w-full border-none shadow-[0_4px_40px_rgba(15,28,46,0.07)]">
          <CardContent className="p-8 flex flex-col gap-5">
            <FileUploadRoot
              key={resetKey}
              maxFiles={MAX_UPLOAD_FILES}
              maxSizeMB={MAX_UPLOAD_FILE_SIZE_MB}
              accept={ACCEPTED_UPLOAD_FILE_TYPES}
              isDisabled={isUploading}
              onFilesChange={(next) => {
                setError(null)
                setSelectedFiles(next)
              }}
            >
              <FileUploadDropzone
                label="Drop files to upload"
                description={`PDF, DOCX, XLSX, ZIP, TXT - ${MAX_UPLOAD_FILE_SIZE_MB} MB each, ${MAX_UPLOAD_FILES} files max`}
              />
              <FileUploadList />
            </FileUploadRoot>

            {error && <p className="text-sm text-red-500 font-sans">{error}</p>}

            <Button
              fullWidth
              onPress={handleUpload}
              isDisabled={isUploading || selectedFiles.length === 0}
              isPending={isUploading}
              className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl text-base font-medium h-12 hover:bg-[var(--ink-800)] disabled:opacity-40 disabled:cursor-not-allowed font-sans"
            >
              {isUploading ? <Spinner className="text-[var(--brand-50)]" /> : 'Upload'}
            </Button>
          </CardContent>
        </Card>

        {incoming && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--brand-alpha-4)] border border-[var(--brand-alpha-30)]">
            <LuLoaderCircle className="w-4 h-4 text-[var(--brand-400)] animate-spin shrink-0" />
            <span className="text-sm text-[var(--ink-900)] font-sans">
              {incoming.uploaderName ?? 'A user'} is uploading <span className="font-medium">{incoming.fileName}</span>
            </span>
          </div>
        )}

        <Card className="w-full border-none shadow-[0_4px_40px_rgba(15,28,46,0.07)]">
          <CardContent className="p-8 flex flex-col gap-5">
            <h2 className="text-xl font-serif text-[var(--ink-900)]">Collected files</h2>
            <div className="flex flex-col gap-3">
              {files.length === 0 ? (
                <p className="text-center py-8 text-[var(--ink-500)] font-sans">No files yet. Uploads will appear here.</p>
              ) : (
                files.map((file) => {
                  const fileTypeInfo = getFileTypeInfo(file.fileType)
                  return (
                    <div key={file.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-ink-900/[0.04] transition-colors border border-line">
                      <div className={`w-10 h-10 ${fileTypeInfo.bg} rounded-lg flex items-center justify-center shrink-0`}>
                        <LuFile className={`${fileTypeInfo.color} w-5 h-5`} />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-medium text-[var(--ink-900)] truncate">{file.fileName}</span>
                        <span className="text-xs text-[var(--ink-500)] font-sans">{formatFileSize(file.fileSize)}</span>
                      </div>
                      <Button
                        isIconOnly
                        variant="ghost"
                        onPress={() => downloadFile(file.shareToken, file.fileName)}
                        isPending={isDownloading === file.shareToken}
                        className="w-8 h-8 rounded-lg min-w-0 hover:bg-ink-900/[0.06] transition-colors"
                        aria-label="Download file"
                      >
                        {isDownloading !== file.shareToken ? <LuDownload className="w-4 h-4 text-[var(--ink-600)]" /> : null}
                      </Button>
                    </div>
                  )
                })
              )}
              {downloadError && <p className="text-sm text-red-500 font-sans">{downloadError}</p>}
            </div>
            <div className="flex items-center gap-2 text-[var(--ink-500)]">
              <LuClock className="w-3.5 h-3.5" />
              <span className="text-xs font-sans">Files are removed automatically 2 hours after they are uploaded.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RequestPage
