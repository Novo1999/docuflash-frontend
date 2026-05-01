import { MIME_TO_FILE_TYPE, SHARE_BASE_URL } from '@/app/constants/upload'
import { FileType } from '@/types/file'

interface UploadDeviceInfo {
  deviceType: 'desktop' | 'mobile'
  browser: string
  os: string
}

function getDeviceInfo(): UploadDeviceInfo {
  const ua = navigator.userAgent
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua)

  let browser = 'Unknown'
  if (/Edg\//i.test(ua)) browser = 'Edge'
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = 'Chrome'
  else if (/Firefox\//i.test(ua)) browser = 'Firefox'
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari'
  else if (/OPR\/|Opera\//i.test(ua)) browser = 'Opera'

  let os = 'Unknown'
  if (/Windows NT/i.test(ua)) os = 'Windows'
  else if (/Mac OS X/i.test(ua) && !/iPhone|iPad/i.test(ua)) os = 'macOS'
  else if (/Android/i.test(ua)) os = 'Android'
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS'
  else if (/Linux/i.test(ua)) os = 'Linux'

  return { deviceType: isMobile ? 'mobile' : 'desktop', browser, os }
}

function resolveFileType(file: File): FileType | null {
  return MIME_TO_FILE_TYPE[file.type] ?? null
}

function getShareLink(fileKey: string): string {
  return `${SHARE_BASE_URL}/share/${fileKey}`
}

export { getDeviceInfo, getShareLink, resolveFileType }
