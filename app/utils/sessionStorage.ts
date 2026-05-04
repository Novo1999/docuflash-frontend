import { StoredUpload } from '@/types/file'

const STORAGE_KEY = 'docuflash_recent_uploads'

export function getRecentUploads(): StoredUpload[] {
  if (typeof window === 'undefined') return []
  const stored = sessionStorage.getItem(STORAGE_KEY)
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function saveRecentUploads(uploads: StoredUpload[]) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(uploads.slice(0, 20)))
  // Dispatch custom event to notify other components
  window.dispatchEvent(new Event('recent-uploads-updated'))
}

export function addRecentUpload(upload: StoredUpload) {
  const current = getRecentUploads()
  const updated = [upload, ...current]
  saveRecentUploads(updated)
}

export function markAsCopied(shareToken: string) {
  const current = getRecentUploads()
  const updated = current.map((u) => (u.shareToken === shareToken ? { ...u, copied: true } : u))
  saveRecentUploads(updated)
}

export function removeRecentUpload(storageKey: string) {
  const current = getRecentUploads()
  const updated = current.filter((u) => u.storageKey !== storageKey)
  saveRecentUploads(updated)
}
