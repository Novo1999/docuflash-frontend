'use client'

import { getFileDownloadUrl, verifyFilePassword } from '@/app/lib/api/files'
import { triggerDownload } from '@/app/share/[shareToken]/shareFileUtil'
import { Button, Input, cn } from '@heroui/react'
import { useState } from 'react'
import { LuDownload } from 'react-icons/lu'

interface FileActionsProps {
  shareToken: string
  isProtected: boolean
  fileName: string
}

export default function FileActions({ shareToken, isProtected, fileName }: FileActionsProps) {
  const [password, setPassword] = useState('')
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const isLocked = isProtected && !fileUrl

  const handleVerifyPassword = async () => {
    if (!password) return
    setIsVerifying(true)
    setError(null)
    try {
      const result = await verifyFilePassword(shareToken, password)
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
      const url = fileUrl ?? (await getFileDownloadUrl(shareToken)).fileUrl
      triggerDownload(url, fileName)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message ?? 'Download failed. Please try again.')
      }
    } finally {
      setIsDownloading(false)
    }
  }

  if (isLocked) {
    return (
      <div className="flex flex-col gap-3 w-full">
        <div className="flex flex-row gap-2 w-full">
          <Input
            type="password"
            placeholder="Enter password to unlock download"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
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
    )
  }

  return (
    <Button className="w-full bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl text-md font-medium h-14" onClick={handleDownload} isPending={isDownloading}>
      <LuDownload className="w-5 h-5" />
      Download File
    </Button>
  )
}
