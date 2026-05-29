import { FileType } from '@/types/file'

const ACCEPTED_UPLOAD_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/plain',
]

const ACCEPTED_UPLOAD_EXTENSIONS = ['.pdf', '.docx', '.xlsx', '.xls', '.zip', '.txt']

const ACCEPTED_UPLOAD_FILE_TYPES = [...ACCEPTED_UPLOAD_MIME_TYPES, ...ACCEPTED_UPLOAD_EXTENSIONS]

const MAX_UPLOAD_FILES = 5
const MAX_UPLOAD_FILE_SIZE_MB = 16
const MAX_UPLOAD_FILE_SIZE_BYTES = MAX_UPLOAD_FILE_SIZE_MB * 1024 * 1024
const DEFAULT_UPLOAD_FOLDER_NAME = 'New Folder'

const SUPPORTED_UPLOAD_FORMATS = ['PDF', 'DOCX', 'XLSX', 'ZIP', 'TXT']

const MIME_TO_FILE_TYPE: Record<string, FileType> = {
  'application/pdf': FileType.PDF,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileType.DOCX,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileType.XLS,
  'application/vnd.ms-excel': FileType.XLS,
  'application/zip': FileType.ZIP,
  'text/plain': FileType.TXT,
}

const EXTENSION_TO_FILE_TYPE: Record<string, FileType> = {
  pdf: FileType.PDF,
  docx: FileType.DOCX,
  xlsx: FileType.XLS,
  xls: FileType.XLS,
  zip: FileType.ZIP,
  txt: FileType.TXT,
}

const SHARE_BASE_URL =
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://docuflash-frontend.vercel.app'

export {
  ACCEPTED_UPLOAD_EXTENSIONS,
  ACCEPTED_UPLOAD_FILE_TYPES,
  ACCEPTED_UPLOAD_MIME_TYPES,
  DEFAULT_UPLOAD_FOLDER_NAME,
  EXTENSION_TO_FILE_TYPE,
  MAX_UPLOAD_FILES,
  MAX_UPLOAD_FILE_SIZE_BYTES,
  MAX_UPLOAD_FILE_SIZE_MB,
  MIME_TO_FILE_TYPE,
  SHARE_BASE_URL,
  SUPPORTED_UPLOAD_FORMATS
}
