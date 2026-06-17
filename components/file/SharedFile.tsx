import { formatDate, formatFileSize, getFileTypeInfo, getRelativeTime } from '@/app/utils/shareFileUtil'
import FileActions from '@/components/file/FileActions'
import { FileAccessType, FileRecord } from '@/types/file'
import { Card, CardContent, Chip } from '@heroui/react'
import { LuCalendar, LuClock, LuDownload, LuFile, LuHardDrive, LuLock, LuShield } from 'react-icons/lu'

interface SharedFileProps {
  file: FileRecord
}

const SharedFile = ({ file }: SharedFileProps) => {
  const fileTypeInfo = getFileTypeInfo(file.fileType)
  const isProtected = file.accessType === FileAccessType.PROTECTED

  return (
    <div className="min-h-screen bg-[var(--brand-50)]">
      <div className="max-w-[720px] mx-auto pt-[72px] pb-10 px-4">
        <div className="flex flex-col gap-6">
          <FileActions shareToken={file.shareToken} isProtected={isProtected} fileName={file.fileName} fileType={file.fileType}>
            <div className="flex flex-row gap-4 items-start">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 ${fileTypeInfo.bg} rounded-xl flex items-center justify-center shrink-0`}>
                <LuFile className={`${fileTypeInfo.color} w-6 h-6 sm:w-8 sm:h-8`} />
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <h2 className="text-base sm:text-xl font-serif text-[var(--ink-900)] break-words">{file.fileName}</h2>
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
          </FileActions>

          {/* File Details Card */}
          <Card className="w-full border-none shadow-[0_4px_40px_rgba(15,28,46,0.07)]">
            <CardContent className="p-5 sm:p-8 flex flex-col gap-5">
              <h2 className="text-xl font-serif text-[var(--ink-900)]">File Details</h2>
              <div className="flex flex-col gap-4">
                <div className="flex flex-row justify-between items-start gap-4 w-full">
                  <div className="flex flex-row items-center gap-3 shrink-0">
                    <LuCalendar className="w-4 h-4 text-[var(--ink-600)]" />
                    <span className="text-sm text-[var(--ink-600)] font-sans">Uploaded</span>
                  </div>
                  <span className="text-sm text-[var(--ink-900)] font-medium font-sans text-right">{formatDate(file.uploadDate)}</span>
                </div>

                <div className="flex flex-row justify-between items-start gap-4 w-full">
                  <div className="flex flex-row items-center gap-3 shrink-0">
                    <LuClock className="w-4 h-4 text-[var(--ink-600)]" />
                    <span className="text-sm text-[var(--ink-600)] font-sans">Expires</span>
                  </div>
                  <span className={`text-sm font-medium font-sans text-right ${getRelativeTime(file.expireAt) === 'Expired' ? 'text-red-600' : 'text-[var(--ink-900)]'}`}>{formatDate(file.expireAt)}</span>
                </div>

                <div className="flex flex-row justify-between items-start gap-4 w-full">
                  <div className="flex flex-row items-center gap-3 shrink-0">
                    <LuDownload className="w-4 h-4 text-[var(--ink-600)]" />
                    <span className="text-sm text-[var(--ink-600)] font-sans">Downloads</span>
                  </div>
                  <span className="text-sm text-[var(--ink-900)] font-medium font-sans text-right">{file.downloadCount}</span>
                </div>

                <div className="flex flex-row justify-between items-start gap-4 w-full">
                  <div className="flex flex-row items-center gap-3 shrink-0">
                    <LuHardDrive className="w-4 h-4 text-[var(--ink-600)]" />
                    <span className="text-sm text-[var(--ink-600)] font-sans">File Size</span>
                  </div>
                  <span className="text-sm text-[var(--ink-900)] font-medium font-sans text-right">{formatFileSize(file.fileSize)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SharedFile
