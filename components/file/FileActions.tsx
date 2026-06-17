'use client'

import { getFilePreview, verifyFilePassword } from '@/app/lib/api/files'
import { useFileDownload } from '@/app/hooks/useFileDownload'
import FilePreview from '@/components/file/FilePreview'
import PasswordUnlockForm from '@/components/file/PasswordUnlockForm'
import { isPreviewableFileType, type FilePreviewResponse, type FileType } from '@/types/file'
import { Button, Card, CardContent, cn } from '@heroui/react'
import { type ReactNode, useState } from 'react'
import { LuDownload, LuEye } from 'react-icons/lu'

interface FileActionsProps {
  shareToken: string
  isProtected: boolean
  fileName: string
  fileType: FileType
  children: ReactNode
}

const PREVIEW_UNAVAILABLE_COPY = 'Preview is unavailable for this file. You can still download it.'

const FileActions = ({ shareToken, isProtected, fileName, fileType, children }: FileActionsProps) => {
  const [password, setPassword] = useState('')
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [preview, setPreview] = useState<FilePreviewResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const { downloadFile, isDownloading } = useFileDownload()

  const isLocked = isProtected && !accessToken
  const canPreview = isPreviewableFileType(fileType)

  const handleVerifyPassword = async () => {
    if (!password) return
    setIsVerifying(true)
    setError(null)
    setPreviewError(null)
    try {
      const result = await verifyFilePassword(shareToken, password)
      setAccessToken(result.accessToken)
      setPassword('')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message ?? 'Invalid password')
      }
    } finally {
      setIsVerifying(false)
    }
  }

  const handlePreview = async () => {
    if (!canPreview || isLocked) return

    setIsPreviewLoading(true)
    setPreviewError(null)
    try {
      const result = await getFilePreview(shareToken, accessToken ?? undefined)
      setPreview(result)
    } catch {
      setPreview(null)
      setPreviewError(PREVIEW_UNAVAILABLE_COPY)
    } finally {
      setIsPreviewLoading(false)
    }
  }

  const handleDownload = async () => {
    await downloadFile(shareToken, fileName, accessToken ?? undefined)
  }

  return (
    <>
      <Card className="w-full border-none shadow-[0_4px_40px_rgba(15,28,46,0.07)]">
        <CardContent className="p-8 flex flex-col gap-6">
          {children}

          {isLocked ? (
            <PasswordUnlockForm
              password={password}
              error={error}
              isVerifying={isVerifying}
              onPasswordChange={(value) => {
                setPassword(value)
                setError(null)
              }}
              onUnlock={handleVerifyPassword}
            />
          ) : (
            <div className="flex flex-col gap-3 w-full">
              <div className={cn('grid gap-2 w-full', canPreview ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1')}>
                {canPreview && (
                  <Button
                    variant="secondary"
                    onPress={handlePreview}
                    isPending={isPreviewLoading}
                    isDisabled={!!preview}
                    className="w-full rounded-xl text-md font-medium h-14 font-sans"
                  >
                    <LuEye className="w-5 h-5" />
                    {preview ? 'Previewing' : 'Preview File'}
                  </Button>
                )}
                <Button className="w-full bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl text-md font-medium h-14 font-sans" onPress={handleDownload} isPending={!!isDownloading}>
                  <LuDownload className="w-5 h-5" />
                  Download File
                </Button>
              </div>
              {previewError && <p className="text-sm text-red-500 font-sans self-start">{previewError}</p>}
              {error && <p className="text-sm text-red-500 font-sans self-start">{error}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {preview && <FilePreview fileName={fileName} preview={preview} />}
    </>
  )
}

export default FileActions
