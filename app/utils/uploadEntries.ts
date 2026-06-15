import { getFolderShareLink, getShareLink } from '@/app/utils/upload'
import type { UploadEntry } from '@/components/me/UploadItemCard'
import type { MyFileRecord } from '@/types/file'
import type { MyFolderRecord } from '@/types/folder'

export const formatBytes = (bytes: number) => {
  if (!bytes) return '0 B'
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(2)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export const fileCountLabel = (count: number) => `${count} ${count === 1 ? 'file' : 'files'}`

export const fileToEntry = (file: MyFileRecord): UploadEntry => ({
  kind: 'file',
  id: file.id,
  name: file.fileName,
  shareToken: file.shareToken,
  link: getShareLink(file.shareToken),
  accessType: file.accessType,
  expireAt: file.expireAt,
  meta: `${file.fileType} · ${formatBytes(file.fileSize)}`,
  downloadCount: file.downloadCount,
})

export const folderToEntry = (folder: MyFolderRecord): UploadEntry => ({
  kind: 'folder',
  id: folder.id,
  name: folder.folderName,
  shareToken: folder.shareToken,
  link: getFolderShareLink(folder.shareToken),
  accessType: folder.accessType,
  expireAt: folder.expireAt,
  meta: 'Folder',
  downloadCount: null,
})
