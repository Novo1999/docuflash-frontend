export enum FileType {
  PDF = 'pdf',
  DOCX = 'docx',
  XLS = 'xls',
  ZIP = 'zip',
  OTHER = 'other',
  TXT = 'txt'
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
