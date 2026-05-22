import { StoredItem, StoredUpload } from '@/types/file'
import { StoredFolder } from '@/types/folder'

const STORAGE_KEY = 'docuflash_recent_uploads'
export const RECENT_UPLOADS_UPDATED_EVENT = 'recent-uploads-updated'

export function getRecentUploads(): StoredItem[] {
  if (typeof window === 'undefined') return []
  const stored = sessionStorage.getItem(STORAGE_KEY)
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function saveRecentUploads(uploads: StoredItem[]) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(uploads.slice(0, 20)))
  window.dispatchEvent(new Event(RECENT_UPLOADS_UPDATED_EVENT))
}

export function addRecentUpload(upload: StoredUpload) {
  const current = getRecentUploads()
  const updated: StoredItem[] = [{ kind: 'file', ...upload }, ...current]
  saveRecentUploads(updated)
}

export function addRecentFolder(folder: StoredFolder) {
  const current = getRecentUploads()
  const updated: StoredItem[] = [{ kind: 'folder', ...folder }, ...current]
  saveRecentUploads(updated)
}

export function markAsCopied(shareToken: string) {
  const current = getRecentUploads()
  const updated = current.map((u) => (u.shareToken === shareToken ? { ...u, copied: true } : u))
  saveRecentUploads(updated)
}

export function removeRecentUpload(shareToken: string) {
  const current = getRecentUploads()
  const updated = current.filter((u) => u.shareToken !== shareToken)
  saveRecentUploads(updated)
}
