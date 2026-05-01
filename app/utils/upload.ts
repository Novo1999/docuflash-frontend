import { MIME_TO_FILE_TYPE, SHARE_BASE_URL } from '@/app/constants/upload'
import { FileType } from '@/types/file'

interface UploadDeviceInfo {
  [key: string]: unknown
  deviceType: 'desktop' | 'mobile'
  browser: string
  os: string
  userAgent: string
  platform: string
}

const CLIENT_ID_COOKIE_NAME = 'docuflash_client_id'
const CLIENT_ID_LOCAL_STORAGE_KEY = 'docuflash_client_id'
const CLIENT_ID_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

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

  return {
    deviceType: isMobile ? 'mobile' : 'desktop',
    browser,
    os,
    userAgent: ua,
    platform: navigator.platform,
  }
}

function resolveFileType(file: File): FileType | null {
  return MIME_TO_FILE_TYPE[file.type] ?? null
}

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null

  const cookie = document.cookie
    .split('; ')
    .find((value) => value.startsWith(`${name}=`))

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : null
}

function setClientIdCookie(clientId: string): boolean {
  if (typeof document === 'undefined') return false

  const secure = window.location.protocol === 'https:' ? '; Secure' : ''

  document.cookie = `${CLIENT_ID_COOKIE_NAME}=${encodeURIComponent(clientId)}; Path=/; Max-Age=${CLIENT_ID_MAX_AGE_SECONDS}; SameSite=Lax${secure}`

  return getCookieValue(CLIENT_ID_COOKIE_NAME) === clientId
}

function getStoredClientId(): string | null {
  try {
    return localStorage.getItem(CLIENT_ID_LOCAL_STORAGE_KEY)
  } catch {
    return null
  }
}

function setStoredClientId(clientId: string): void {
  try {
    localStorage.setItem(CLIENT_ID_LOCAL_STORAGE_KEY, clientId)
  } catch {
    // The upload can continue without persisted anonymous identity.
  }
}

function createClientId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

function getClientId(): string {
  const cookieClientId = getCookieValue(CLIENT_ID_COOKIE_NAME)
  if (cookieClientId) return cookieClientId

  const storedClientId = getStoredClientId()
  if (storedClientId) {
    if (!setClientIdCookie(storedClientId)) {
      setStoredClientId(storedClientId)
    }

    return storedClientId
  }

  const clientId = createClientId()

  if (!setClientIdCookie(clientId)) {
    setStoredClientId(clientId)
  }

  return clientId
}

function getShareLink(shareToken: string): string {
  return `${SHARE_BASE_URL}/share/${shareToken}`
}

export { getClientId, getDeviceInfo, getShareLink, resolveFileType }
