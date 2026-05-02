'use client'

import { getFileDownloadUrl, verifyFilePassword } from '@/app/lib/api/files'
import { FileAccessType, FileRecord, FileType } from '@/types/file'
import { Button, Card, CardContent, Chip, cn, Input } from '@heroui/react'
import { useState } from 'react'
import { LuCalendar, LuClock, LuDownload, LuFile, LuHardDrive, LuLock, LuShield } from 'react-icons/lu'

interface SharedFilePageProps {
  file: FileRecord
}

const getFileTypeInfo = (fileType: FileType) => {
  switch (fileType) {
    case FileType.PDF:
      return { color: 'text-red-500', bg: 'bg-red-50', label: 'PDF' }
    case FileType.DOCX:
      return { color: 'text-blue-500', bg: 'bg-blue-50', label: 'Word' }
    case FileType.XLS:
      return { color: 'text-green-500', bg: 'bg-green-50', label: 'Excel' }
    case FileType.ZIP:
      return { color: 'text-orange-500', bg: 'bg-orange-50', label: 'ZIP' }
    default:
      return { color: 'text-gray-500', bg: 'bg-gray-50', label: 'File' }
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const getRelativeTime = (dateString: string): string => {
  const diffDays = Math.ceil((new Date(dateString).getTime() - Date.now()) / 86400000)
  if (diffDays < 0) return 'Expired'
  if (diffDays === 0) return 'Expires today'
  if (diffDays === 1) return 'Expires in 1 day'
  if (diffDays < 7) return `Expires in ${diffDays} days`
  if (diffDays < 30) return `Expires in ${Math.floor(diffDays / 7)} weeks`
  return `Expires in ${Math.floor(diffDays / 30)} months`
}

const triggerDownload = (fileUrl: string, fileName: string) => {
  const a = document.createElement('a')
  a.href = fileUrl
  a.download = fileName
  a.click()
  a.remove()
}

export default function SharedFilePage({ file }: SharedFilePageProps) {
  const [password, setPassword] = useState('')
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const fileTypeInfo = getFileTypeInfo(file.fileType)
  const isExpired = new Date(file.expireAt) < new Date()
  const isProtected = file.accessType === FileAccessType.PROTECTED
  const isLocked = isProtected && !fileUrl

  // ---- Expired state ----
  if (isExpired) {
    return (
      <div className="min-h-screen bg-[var(--brand-50)] flex items-center justify-center p-4">
        <Card className="max-w-[480px] w-full border-none shadow-[0_4px_40px_rgba(15,28,46,0.07)]">
          <CardContent className="p-10 flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <LuClock className="text-red-500 w-7 h-7" />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-serif text-[var(--ink-900)]">This link has expired</h1>
              <p className="text-[var(--ink-600)] font-sans">The shared file is no longer available for download.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleVerifyPassword = async () => {
    if (!password) return
    setIsVerifying(true)
    setError(null)
    try {
      const result = await verifyFilePassword(file.shareToken, password)
      setFileUrl(result.fileUrl)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message ?? 'Invalid password')
      }
    } finally {
      setIsVerifying(false)
    }
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const url = fileUrl ?? (await getFileDownloadUrl(file.shareToken)).fileUrl
      triggerDownload(url, file.fileName)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message ?? 'Download failed. Please try again.')
      }
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--brand-50)]">
      <div className="max-w-[720px] mx-auto pt-[72px] pb-10 px-4">
        <div className="flex flex-col gap-6">
          {/* Header Card */}
          <Card className="w-full border-none shadow-[0_4px_40px_rgba(15,28,46,0.07)]">
            <CardContent className="p-8 flex flex-col gap-6">
              <div className="flex flex-row gap-4 items-start">
                <div className={`w-16 h-16 ${fileTypeInfo.bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <LuFile className={`${fileTypeInfo.color} w-8 h-8`} />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <h2 className="text-xl font-serif text-[var(--ink-900)] break-words">{file.fileName}</h2>
                  <div className="flex flex-row gap-2 flex-wrap">
                    <Chip size="sm" variant="secondary" className="font-medium px-2">
                      {fileTypeInfo.label}
                    </Chip>
                    <Chip size="sm" variant="secondary" className="font-medium px-2">
                      {formatFileSize(file.fileSize)}
                    </Chip>
                    {!isProtected ? (
                      <div className="flex flex-row items-center gap-1">
                        <LuShield className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">Public</span>
                      </div>
                    ) : (
                      <div className="flex flex-row items-center gap-1">
                        <LuLock className="w-3 h-3 text-orange-500" />
                        <span className="text-xs text-orange-600 font-medium">Protected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Password gate */}
              {isLocked && (
                <div className="flex flex-col gap-3 w-full">
                  <div className="flex flex-row gap-2 w-full">
                    <Input
                      type="password"
                      placeholder="Enter password to unlock download"
                      value={password}
                      onChange={(e) => {
                        const val = e.target.value
                        setPassword(val)
                        setError(null)
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword()}
                      className={cn(
                        'bg-[var(--brand-50)]',
                        'border-1',
                        error ? 'border-red-400' : 'border-black/10',
                        'rounded-xl',
                        'px-4',
                        'h-12',
                        'group-data-[focus=true]:border-[var(--brand-400)]',
                        'group-data-[focus=true]:ring-3',
                        'group-data-[focus=true]:ring-[var(--brand-400)]/10',
                        'text-md text-[var(--ink-900)] placeholder:text-[var(--ink-400)]',
                      )}
                    />
                    <Button onClick={handleVerifyPassword} isPending={isVerifying} className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl font-medium px-6 h-12 shrink-0">
                      Unlock
                    </Button>
                  </div>
                  {error && <p className="text-sm text-red-500 font-sans self-start">{error}</p>}
                </div>
              )}

              {/* Download button — shown when public or after unlock */}
              {!isLocked && (
                <Button className="w-full bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl text-md font-medium h-14" onClick={handleDownload} isPending={isDownloading}>
                  <LuDownload className="w-5 h-5" />
                  Download File
                </Button>
              )}
            </CardContent>
          </Card>

          {/* File Details Card */}
          <Card className="w-full border-none shadow-[0_4px_40px_rgba(15,28,46,0.07)]">
            <CardContent className="p-8 flex flex-col gap-5">
              <h2 className="text-xl font-serif text-[var(--ink-900)]">File Details</h2>
              <div className="flex flex-col gap-4">
                <div className="flex flex-row justify-between w-full">
                  <div className="flex flex-row items-center gap-3">
                    <LuCalendar className="w-4 h-4 text-[var(--ink-600)]" />
                    <span className="text-sm text-[var(--ink-600)] font-sans">Uploaded</span>
                  </div>
                  <span className="text-sm text-[var(--ink-900)] font-medium font-sans">{formatDate(file.uploadDate)}</span>
                </div>

                <div className="flex flex-row justify-between w-full">
                  <div className="flex flex-row items-center gap-3">
                    <LuClock className="w-4 h-4 text-[var(--ink-600)]" />
                    <span className="text-sm text-[var(--ink-600)] font-sans">Expires</span>
                  </div>
                  <span className={`text-sm font-medium font-sans ${getRelativeTime(file.expireAt) === 'Expired' ? 'text-red-600' : 'text-[var(--ink-900)]'}`}>{formatDate(file.expireAt)}</span>
                </div>

                <div className="flex flex-row justify-between w-full">
                  <div className="flex flex-row items-center gap-3">
                    <LuDownload className="w-4 h-4 text-[var(--ink-600)]" />
                    <span className="text-sm text-[var(--ink-600)] font-sans">Downloads</span>
                  </div>
                  <span className="text-sm text-[var(--ink-900)] font-medium font-sans">{file.downloadCount}</span>
                </div>

                <div className="flex flex-row justify-between w-full">
                  <div className="flex flex-row items-center gap-3">
                    <LuHardDrive className="w-4 h-4 text-[var(--ink-600)]" />
                    <span className="text-sm text-[var(--ink-600)] font-sans">File Size</span>
                  </div>
                  <span className="text-sm text-[var(--ink-900)] font-medium font-sans">{formatFileSize(file.fileSize)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
