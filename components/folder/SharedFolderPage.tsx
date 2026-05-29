'use client'

import { unlockFolderByShareToken } from '@/app/lib/api/folder'
import { formatDate } from '@/app/utils/shareFileUtil'
import PasswordUnlockForm from '@/components/file/PasswordUnlockForm'
import SharedFolder from '@/components/file/SharedFolder'
import ItemDeletion from '@/components/folder/ItemDeletion'
import { FileAccessType } from '@/types/file'
import { FolderRecord } from '@/types/folder'
import { Card, CardContent, Chip } from '@heroui/react'
import { useState } from 'react'
import { LuCalendar, LuFolder, LuLock, LuShield } from 'react-icons/lu'

interface SharedFolderPageProps {
  initialFolder: FolderRecord
  shareToken: string
}

const SharedFolderPage = ({ initialFolder, shareToken }: SharedFolderPageProps) => {
  const [folder, setFolder] = useState<FolderRecord>(() => ({
    ...initialFolder,
    shareToken: initialFolder.shareToken ?? shareToken,
    files: initialFolder.files ?? [],
  }))
  const [password, setPassword] = useState('')
  const [folderPassword, setFolderPassword] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(() => initialFolder.accessType !== FileAccessType.PROTECTED)

  const isProtected = folder.accessType === FileAccessType.PROTECTED
  const isLocked = isProtected && !isUnlocked
  const fileCount = isLocked ? 0 : folder.files.length
  const folderForActions = { ...folder, shareToken: folder.shareToken ?? shareToken }

  const handleUnlock = async () => {
    const trimmedPassword = password.trim()
    if (!trimmedPassword) return

    setIsUnlocking(true)
    setError(null)

    try {
      const unlockedFolder = await unlockFolderByShareToken(shareToken, trimmedPassword)
      setFolder({
        ...unlockedFolder,
        shareToken: unlockedFolder.shareToken ?? shareToken,
        files: unlockedFolder.files ?? [],
      })
      setFolderPassword(trimmedPassword)
      setPassword('')
      setIsUnlocked(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message || 'Invalid password' : 'Invalid password')
    } finally {
      setIsUnlocking(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--brand-50)]">
      <div className="max-w-[720px] mx-auto pt-[72px] pb-10 px-4">
        <div className="flex flex-col gap-6">
          <div className="flex flex-row gap-4 items-start">
            <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
              <LuFolder className="text-primary-500 w-8 h-8" />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="flex flex-row items-start justify-between gap-4">
                <h2 className="text-xl font-serif text-[var(--ink-900)] break-words leading-tight">{folder.folderName}</h2>
                {!isLocked && <ItemDeletion folder={folderForActions} />}
              </div>
              <div className="flex flex-row gap-2 flex-wrap items-center mt-1">
                <Chip size="sm" variant="secondary" className="font-medium px-2">
                  {fileCount} {fileCount === 1 ? 'File' : 'Files'}
                </Chip>
                {isProtected ? (
                  <div className="flex flex-row items-center gap-1">
                    <LuLock className="w-3 h-3 text-orange-500" />
                    <span className="text-xs text-orange-600 font-medium">Protected</span>
                  </div>
                ) : (
                  <div className="flex flex-row items-center gap-1">
                    <LuShield className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">Public</span>
                  </div>
                )}
                <div className="flex flex-row items-center gap-1">
                  <LuCalendar className="w-3 h-3 text-[var(--ink-600)]" />
                  <span className="text-xs text-[var(--ink-600)] font-medium">{formatDate(folder.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <Card className="w-full border-none shadow-[0_4px_40px_rgba(15,28,46,0.07)]">
            <CardContent className="p-8 flex flex-col gap-5">
              <h2 className="text-xl font-serif text-[var(--ink-900)]">{isLocked ? 'Unlock folder' : 'Files in this folder'}</h2>
              {isLocked ? (
                <PasswordUnlockForm
                  password={password}
                  error={error}
                  isVerifying={isUnlocking}
                  resourceLabel="folder"
                  onPasswordChange={(value) => {
                    setPassword(value)
                    setError(null)
                  }}
                  onUnlock={handleUnlock}
                />
              ) : (
                <SharedFolder folder={folderForActions} folderPassword={folderPassword} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SharedFolderPage
