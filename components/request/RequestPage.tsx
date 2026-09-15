'use client'

import { useFileDownload } from '@/app/hooks/useFileDownload'
import { useRequestRealtime, type UploadingPayload } from '@/app/hooks/useRequestRealtime'
import { fetchFolderByShareToken, unlockFolderByShareToken, uploadToRequest } from '@/app/lib/api/folder'
import { deleteFileByShareToken, deleteUploadedStorageFile, getFilePreview } from '@/app/lib/api/files'
import { totalProgressToPercent, uploadFiles } from '@/app/utils/generateReactHelpers'
import { getClientId, getDeviceInfo, resolveFileType } from '@/app/utils/upload'
import { userAtom } from '@/components/auth/atoms/authAtom'
import { MAX_REQUEST_UPLOAD_FILE_SIZE_MB, MAX_UPLOAD_FILES } from '@/app/constants/upload'
import CollectedFileRow from '@/components/request/CollectedFileRow'
import DeleteCollectedFileModal from '@/components/request/DeleteCollectedFileModal'
import IncomingUploadBanner from '@/components/request/IncomingUploadBanner'
import UploadProgressPanel from '@/components/request/UploadProgressPanel'
import FilePreview from '@/components/file/FilePreview'
import FileUploadDropzone from '@/components/file/FileUploadDropzone'
import FileUploadList from '@/components/file/FileUploadList'
import FileUploadRoot from '@/components/file/FileUploadRoot'
import PasswordUnlockForm from '@/components/file/PasswordUnlockForm'
import { FileAccessType, FileType, type FilePreviewResponse, type FileRecord } from '@/types/file'
import type { RequestFileUpload } from '@/types/folder'
import { FolderRecord } from '@/types/folder'
import { Button, Card, CardContent, Chip } from '@heroui/react'
import { useAtom, useAtomValue } from 'jotai'
import { atomWithQuery, queryClientAtom } from 'jotai-tanstack-query'
import { useMemo, useRef, useState } from 'react'
import { LuClock, LuInbox, LuLock } from 'react-icons/lu'

type ActivePreview = { shareToken: string; fileName: string; preview: FilePreviewResponse }

interface RequestPageProps {
  initialFolder: FolderRecord
  shareToken: string
}

const RequestPage = ({ initialFolder, shareToken }: RequestPageProps) => {
  const user = useAtomValue(userAtom)
  const queryClient = useAtomValue(queryClientAtom)

  const isProtected = initialFolder.accessType === FileAccessType.PROTECTED

  // A protected request only exposes its files through /unlock, so the query stays disabled
  // for it — otherwise a refetch would overwrite the unlocked folder with the empty payload.
  const folderQueryAtom = useMemo(
    () =>
      atomWithQuery(() => ({
        queryKey: ['request-folder', shareToken],
        queryFn: () => fetchFolderByShareToken(shareToken),
        initialData: initialFolder,
        enabled: !isProtected,
      })),
    [shareToken, initialFolder, isProtected],
  )
  const [folderQuery] = useAtom(folderQueryAtom)

  const [unlockedFolder, setUnlockedFolder] = useState<FolderRecord | null>(null)
  const [folderPassword, setFolderPassword] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [unlockError, setUnlockError] = useState<string | null>(null)
  const [isUnlocking, setIsUnlocking] = useState(false)

  const isUnlocked = !isProtected || unlockedFolder !== null
  const folder = (isProtected ? unlockedFolder : folderQuery.data) ?? initialFolder
  const files = isUnlocked ? (folder.files ?? []) : []

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [resetKey, setResetKey] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [incoming, setIncoming] = useState<UploadingPayload | null>(null)
  const [pendingDelete, setPendingDelete] = useState<FileRecord | null>(null)
  const [deletingToken, setDeletingToken] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Progress per selected file, keyed by the index it holds in `selectedFiles`.
  const [fileProgress, setFileProgress] = useState<Record<number, number>>({})
  const [totalProgress, setTotalProgress] = useState(0)
  const lastBroadcastProgress = useRef(0)

  const refreshFolder = async () => {
    if (!isProtected) {
      await queryClient.invalidateQueries({ queryKey: ['request-folder', shareToken] })
      return
    }
    if (!folderPassword) return
    const refreshed = await unlockFolderByShareToken(shareToken, folderPassword)
    setUnlockedFolder({ ...refreshed, files: refreshed.files ?? [] })
  }

  const handleUnlock = async () => {
    const trimmedPassword = password.trim()
    if (!trimmedPassword) return

    setIsUnlocking(true)
    setUnlockError(null)

    try {
      const unlocked = await unlockFolderByShareToken(shareToken, trimmedPassword)
      setUnlockedFolder({ ...unlocked, files: unlocked.files ?? [] })
      setFolderPassword(trimmedPassword)
      setPassword('')
    } catch (err: unknown) {
      setUnlockError(err instanceof Error ? err.message || 'Invalid password' : 'Invalid password')
    } finally {
      setIsUnlocking(false)
    }
  }

  const { downloadFile, isDownloading, error: downloadError } = useFileDownload()

  const [activePreview, setActivePreview] = useState<ActivePreview | null>(null)
  const [previewLoadingToken, setPreviewLoadingToken] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)

  const handlePreview = async (shareToken: string, fileName: string) => {
    setPreviewError(null)
    setPreviewLoadingToken(shareToken)
    try {
      const preview = await getFilePreview(shareToken)
      setActivePreview({ shareToken, fileName, preview })
    } catch {
      setActivePreview(null)
      setPreviewError('Preview is unavailable for this file. You can still download it.')
    } finally {
      setPreviewLoadingToken(null)
    }
  }

  const { broadcastUploading, broadcastComplete } = useRequestRealtime(shareToken, {
    onUploading: (payload) => {
      setIncoming(payload)
      window.setTimeout(() => setIncoming((current) => (current === payload ? null : current)), 15000)
    },
    onComplete: () => {
      setIncoming(null)
      if (isUnlocked) void refreshFolder()
    },
  })

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    const filesWithTypes = selectedFiles.map((file) => ({ file, fileType: resolveFileType(file) ?? FileType.OTHER }))

    setError(null)
    setIsUploading(true)
    setFileProgress({})
    setTotalProgress(0)
    lastBroadcastProgress.current = 0

    const uploaderName = user?.displayName ?? null
    const representativeName = selectedFiles.length > 1 ? `${selectedFiles.length} files` : selectedFiles[0].name
    broadcastUploading({ fileName: representativeName, uploaderName, progress: 0 })

    try {
      // uploadFiles (rather than the useUploadThing hook) because only it reports
      // progress per file — the hook hands back a single combined percentage.
      const uploaded = await uploadFiles('requestUploader', {
        files: selectedFiles,
        onUploadProgress: ({ file, progress, totalProgress: total }) => {
          // Match on identity rather than name so duplicate file names can't cross over.
          const index = selectedFiles.indexOf(file)
          if (index !== -1) {
            const rounded = Math.round(progress)
            setFileProgress((prev) => (prev[index] === rounded ? prev : { ...prev, [index]: rounded }))
          }

          // Rounded so React bails out instead of re-rendering on every XHR tick.
          const totalPercent = Math.round(totalProgressToPercent(total))
          setTotalProgress(totalPercent)

          // The channel is shared and progress events are frequent, so only tell
          // the watcher about meaningful jumps.
          if (totalPercent - lastBroadcastProgress.current >= 5) {
            lastBroadcastProgress.current = totalPercent
            broadcastUploading({ fileName: representativeName, uploaderName, progress: totalPercent })
          }
        },
      })

      setTotalProgress(100)
      setFileProgress(Object.fromEntries(selectedFiles.map((_, index) => [index, 100])))

      if (uploaded.length !== filesWithTypes.length) {
        throw new Error('Upload did not return every storage key')
      }

      const clientId = getClientId()
      const deviceInfo = getDeviceInfo()

      const payload: RequestFileUpload[] = uploaded.map((file, index) => ({
        fileName: file.name,
        fileType: filesWithTypes[index]?.fileType ?? FileType.OTHER,
        fileSize: file.size,
        storageKey: file.key,
        clientId,
        deviceInfo,
      }))

      try {
        await uploadToRequest(shareToken, payload, folderPassword ?? undefined)
      } catch (attachError) {
        await Promise.allSettled(uploaded.map((file) => deleteUploadedStorageFile(file.key)))
        throw attachError
      }

      await refreshFolder()
      broadcastComplete()

      setSelectedFiles([])
      setResetKey((key) => key + 1)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message || 'Upload failed. Please try again.' : 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
      setFileProgress({})
      setTotalProgress(0)
    }
  }

  const handleDelete = async () => {
    if (!pendingDelete) return
    const { shareToken: fileToken } = pendingDelete

    setDeletingToken(fileToken)
    setDeleteError(null)

    try {
      // The backend drops the object from UploadThing before removing the row,
      // so a success here means the file is gone from storage too.
      await deleteFileByShareToken(fileToken)
      if (activePreview?.shareToken === fileToken) setActivePreview(null)
      setPendingDelete(null)
      await refreshFolder()
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message || 'Could not delete that file.' : 'Could not delete that file.')
    } finally {
      setDeletingToken(null)
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
              {isProtected && (
                <div className="flex flex-row items-center gap-1">
                  <LuLock className="w-3 h-3 text-orange-500" />
                  <span className="text-xs text-orange-600 font-medium">Protected</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {!isUnlocked && (
          <Card className="w-full border-none shadow-[0_4px_40px_rgba(15,28,46,0.07)]">
            <CardContent className="p-8 flex flex-col gap-5">
              <h2 className="text-xl font-serif text-[var(--ink-900)]">Unlock this link</h2>
              <p className="text-sm text-[var(--ink-600)] font-sans">This dropzone is password protected. Enter the password you were given to upload files.</p>
              <PasswordUnlockForm
                password={password}
                error={unlockError}
                isVerifying={isUnlocking}
                resourceLabel="folder"
                onPasswordChange={(value) => {
                  setPassword(value)
                  setUnlockError(null)
                }}
                onUnlock={handleUnlock}
              />
            </CardContent>
          </Card>
        )}

        {isUnlocked && (
          <Card className="w-full border-none shadow-[0_4px_40px_rgba(15,28,46,0.07)]">
            <CardContent className="p-8 flex flex-col gap-5">
              {isUploading ? (
                <UploadProgressPanel files={selectedFiles} progressByIndex={fileProgress} totalProgress={totalProgress} />
              ) : (
                <>
                  <FileUploadRoot
                    key={resetKey}
                    maxFiles={MAX_UPLOAD_FILES}
                    maxSizeMB={MAX_REQUEST_UPLOAD_FILE_SIZE_MB}
                    onFilesChange={(next) => {
                      setError(null)
                      setSelectedFiles(next)
                    }}
                  >
                    <FileUploadDropzone
                      label="Drop files to upload"
                      description={`Any file type - ${MAX_REQUEST_UPLOAD_FILE_SIZE_MB} MB each, ${MAX_UPLOAD_FILES} files max`}
                    />
                    <FileUploadList />
                  </FileUploadRoot>

                  {error && <p className="text-sm text-red-500 font-sans">{error}</p>}

                  <Button
                    fullWidth
                    onPress={handleUpload}
                    isDisabled={selectedFiles.length === 0}
                    className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl text-base font-medium h-12 hover:bg-[var(--ink-800)] disabled:opacity-40 disabled:cursor-not-allowed font-sans"
                  >
                    Upload
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {incoming && <IncomingUploadBanner incoming={incoming} />}

        {isUnlocked && (
        <Card className="w-full border-none shadow-[0_4px_40px_rgba(15,28,46,0.07)]">
          <CardContent className="p-8 flex flex-col gap-5">
            <h2 className="text-xl font-serif text-[var(--ink-900)]">Collected files</h2>
            <div className="flex flex-col gap-3">
              {files.length === 0 ? (
                <p className="text-center py-8 text-[var(--ink-500)] font-sans">No files yet. Uploads will appear here.</p>
              ) : (
                files.map((file) => (
                  <CollectedFileRow
                    key={file.id}
                    file={file}
                    isPreviewActive={activePreview?.shareToken === file.shareToken}
                    isPreviewLoading={previewLoadingToken === file.shareToken}
                    isDownloading={isDownloading === file.shareToken}
                    isDeleting={deletingToken === file.shareToken}
                    onPreview={() => handlePreview(file.shareToken, file.fileName)}
                    onDownload={() => downloadFile(file.shareToken, file.fileName)}
                    onDelete={() => setPendingDelete(file)}
                  />
                ))
              )}
              {previewError && <p className="text-sm text-red-500 font-sans">{previewError}</p>}
              {downloadError && <p className="text-sm text-red-500 font-sans">{downloadError}</p>}
              {deleteError && <p className="text-sm text-red-500 font-sans">{deleteError}</p>}
            </div>
            <div className="flex items-center gap-2 text-[var(--ink-500)]">
              <LuClock className="w-3.5 h-3.5" />
              <span className="text-xs font-sans">Files are removed automatically 2 hours after they are uploaded.</span>
            </div>
          </CardContent>
        </Card>
        )}

        {activePreview && <FilePreview fileName={activePreview.fileName} preview={activePreview.preview} />}

        <DeleteCollectedFileModal
          fileName={pendingDelete?.fileName ?? null}
          isDeleting={deletingToken !== null}
          onConfirm={handleDelete}
          onClose={() => setPendingDelete(null)}
        />
      </div>
    </div>
  )
}

export default RequestPage
