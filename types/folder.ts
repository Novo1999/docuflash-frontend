import { FileRecord } from './file'

export type SafeFileRecord = Omit<FileRecord, 'id' | 'password' | 'storageKey' | 'deviceInfo' | 'clientId'>

export type CreateFolderPayload = {
  folderName: string
  fileIds: string[]
}

export type FolderRecord = {
  shareToken: string
  folderName: string
  createdAt: string
  files: FileRecord[]
  id: string
}

export type SafeFolderRecord = {
  shareToken: string
  folderName: string
  createdAt: string
  files: SafeFileRecord[]
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
