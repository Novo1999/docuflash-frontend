export enum FileType {
  PDF = 'pdf',
  DOCX = 'docx',
  XLS = 'xls',
  ZIP = 'zip',
  OTHER = 'other',
  TXT = 'txt',
}

export enum FileAccessType {
  PUBLIC = 'public',
  PROTECTED = 'protected',
}

export interface DeviceInfo {
  browser: string
  os: string
  device: string
  ip: string
}

export interface FileDetails {
  id: string
  fileName: string
  fileType: FileType
  fileSize: number
  accessType: FileAccessType
  downloadCount: number
  uploadDate: string
  expireAt: string
  deviceInfo: DeviceInfo
}

export type UploadFilePayload = {
  fileName: string
  fileType: FileType
  fileSize: number
  storageKey: string
  clientId: string
  accessType: FileAccessType
  expireAt: string
  password?: string
  downloadCount?: number
  deviceInfo?: {
    userAgent?: string
    platform?: string
    [key: string]: unknown
  }
}

export type FileRecord = {
  shareToken: string
  fileName: string
  fileType: FileType
  fileSize: number
  accessType: FileAccessType
  expireAt: string
  downloadCount: number
  uploadDate: string
}

export interface StoredUpload {
  fileName: string
  fileSize: number
  fileType: FileType
  shareToken: string
  storageKey: string
  expireAt: string
  accessType: FileAccessType
  copied: boolean
  uploadDate: string
}
