'use client'

import { MAX_AVATAR_SIZE_BYTES, MAX_AVATAR_SIZE_MB } from '@/app/constants/auth'
import { useUploadThing } from '@/app/utils/generateReactHelpers'
import { useAuth } from '@/components/auth/useAuth'
import { Spinner } from '@heroui/react'
import { useRef, useState, type ChangeEvent } from 'react'
import { LuCamera } from 'react-icons/lu'

const AvatarUploader = () => {
  const { user, updateProfile } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const { startUpload, isUploading } = useUploadThing('avatarUploader', {
    onUploadError: () => setError('Upload failed. Please try again.'),
  })

  if (!user) return null

  const busy = isUploading || isSaving
  const initials = (user.displayName?.trim() || user.email)[0]?.toUpperCase() ?? '?'

  const handleSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    // Reset so picking the same file again still fires onChange.
    event.target.value = ''
    if (!file) return

    setError(null)

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setError(`Image must be ${MAX_AVATAR_SIZE_MB}MB or smaller.`)
      return
    }

    try {
      const result = await startUpload([file])
      const avatarUrl = result?.[0]?.ufsUrl
      if (!avatarUrl) throw new Error('Upload did not return a URL')

      setIsSaving(true)
      await updateProfile({ avatarUrl })
    } catch {
      setError('Could not update your avatar. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        aria-label="Change profile picture"
        className="group relative w-16 h-16 rounded-full bg-[var(--ink-900)] text-[var(--brand-50)] text-xl font-medium flex items-center justify-center overflow-hidden disabled:cursor-not-allowed"
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt={user.displayName || user.email} className="w-16 h-16 object-cover" />
        ) : (
          initials
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity">
          {busy ? <Spinner className="text-white w-5 h-5" /> : <LuCamera className="w-5 h-5 text-white" />}
        </span>
      </button>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleSelect} />
      {error && <p className="absolute top-full left-0 mt-1.5 text-xs text-red-500 whitespace-nowrap">{error}</p>}
    </div>
  )
}

export default AvatarUploader
