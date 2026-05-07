import { FileType } from '@/types/file'

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

export { formatDate, formatFileSize, getFileTypeInfo, getRelativeTime, triggerDownload }
