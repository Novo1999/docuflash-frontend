import { FileAccessType, FileRecord, FileType } from './file'

export type SafeFileRecord = Omit<FileRecord, 'id' | 'password' | 'storageKey' | 'deviceInfo' | 'clientId'>

export type CreateFolderPayload = {
  folderName: string
  fileIds: string[]
  expireAt: string
  accessType: FileAccessType
  password?: string
  clientId: string
}

export type FolderRecord = {
  shareToken: string
  folderName: string
  createdAt: string
  expireAt?: string
  accessType: FileAccessType
  files: FileRecord[]
  id: string
  acceptsUploads?: boolean
}

export type UploadRequestRecord = {
  shareToken: string
  folderName: string
  acceptsUploads: boolean
  expireAt: string
}

export type RequestFileUpload = {
  fileName: string
  fileType: FileType
  fileSize: number
  storageKey: string
  clientId: string
  deviceInfo: unknown
}

export type SafeFolderRecord = {
  shareToken: string
  folderName: string
  createdAt: string
  expireAt?: string
  accessType: FileAccessType
  files: SafeFileRecord[]
}

export type MyFolderRecord = {
  id: string
  folderName: string
  shareToken: string
  accessType: FileAccessType
  ownerId: string
  expireAt: string
  createdAt: string
}

export type StoredFolder = {
  folderName: string
  shareToken: string
  createdAt: string
  expireAt: string
  accessType: string
  copied: boolean
  fileCount: number
}

export type FolderShareLink = {
  folderName: string
  shareToken: string
  link: string
}
