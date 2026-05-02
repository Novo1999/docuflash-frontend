import { FileType } from '@/types/file'

const ACCEPTED_UPLOAD_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
]

const SUPPORTED_UPLOAD_FORMATS = ['PDF', 'DOCX', 'XLSX', 'ZIP']

const MIME_TO_FILE_TYPE: Record<string, FileType> = {
  'application/pdf': FileType.PDF,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileType.DOCX,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileType.XLS,
  'application/vnd.ms-excel': FileType.XLS,
  'application/zip': FileType.ZIP,
  'text/plain': FileType.TXT,
}

const SHARE_BASE_URL =
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://docuflash-frontend.vercel.app'

export {
  ACCEPTED_UPLOAD_MIME_TYPES,
  MIME_TO_FILE_TYPE,
  SHARE_BASE_URL,
  SUPPORTED_UPLOAD_FORMATS
}

