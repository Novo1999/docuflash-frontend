import { formatDate, formatFileSize, getFileTypeInfo, getRelativeTime } from '@/app/share/[shareToken]/shareFileUtil'
import FileActions from '@/components/file/FileActions'
import { FileAccessType, FileRecord } from '@/types/file'
import { Card, CardContent, Chip } from '@heroui/react'
import { LuCalendar, LuClock, LuDownload, LuFile, LuHardDrive, LuLock, LuShield } from 'react-icons/lu'

interface SharedFilePageProps {
  file: FileRecord
}

export default function SharedFilePage({ file }: SharedFilePageProps) {
  const fileTypeInfo = getFileTypeInfo(file.fileType)
  const isProtected = file.accessType === FileAccessType.PROTECTED

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

              {/* Only the interactive part is client-side */}
              <FileActions
                shareToken={file.shareToken}
                isProtected={isProtected}
                fileName={file.fileName}
              />
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
                  <span className={`text-sm font-medium font-sans ${getRelativeTime(file.expireAt) === 'Expired' ? 'text-red-600' : 'text-[var(--ink-900)]'}`}>
                    {formatDate(file.expireAt)}
                  </span>
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
