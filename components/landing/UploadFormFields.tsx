'use client'

import { PRESETS } from '@/app/constants/expiry'
import { ACCEPTED_UPLOAD_FILE_TYPES, MAX_UPLOAD_FILE_SIZE_MB, MAX_UPLOAD_FILES } from '@/app/constants/upload'
import useFileUploadForm from '@/app/hooks/useFileUploadForm'
import useFileUploadSubmit from '@/app/hooks/useFileUploadSubmit'
import { useAuth } from '@/components/auth/useAuth'
import FileUploadDropzone from '@/components/file/FileUploadDropzone'
import FileUploadList from '@/components/file/FileUploadList'
import FileUploadRoot from '@/components/file/FileUploadRoot'
import type { UploadedShareLink } from '@/types/file'
import { Button, cn, FieldError, Input, Label, Spinner, Switch, TextField } from '@heroui/react'
import dynamic from 'next/dynamic'
import { type CSSProperties, type ReactNode, useEffect, useState } from 'react'
import { Controller } from 'react-hook-form'
import { LuEye, LuEyeOff, LuFile, LuFlame, LuFolder, LuGlobe, LuLock } from 'react-icons/lu'

const DynamicExpirySelector = dynamic(() => import('../shared/ExpirySelector'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center gap-4 h-[120px] justify-center">
      <Spinner className="text-ink-900" />
    </div>
  ),
})

// Static: hoisted so it isn't recreated every render
const SWITCH_STYLE = {
  '--switch-control-bg-checked': 'var(--ink-900)',
  '--switch-control-bg-checked-hover': 'var(--ink-800)',
} as CSSProperties

const ACCESS_TYPE_OPTIONS = [
  { val: 'public', label: 'Public', desc: 'Anyone with the link', Icon: LuGlobe },
  { val: 'protected', label: 'Protected', desc: 'Password-locked', Icon: LuLock },
] as const

interface UploadFormFieldsProps {
  formatBadges: ReactNode
  footer: ReactNode
  /** Called with the resulting share links once upload succeeds. */
  onUploadSuccess: (shareLinks: UploadedShareLink[], lastShareToken: string | null) => void
}

const UploadFormFields = ({ formatBadges, footer, onUploadSuccess }: UploadFormFieldsProps) => {
  const [showPassword, setShowPassword] = useState(false)

  const { files, setError, clearErrors, reset, accessType, control, handleSubmit, setValue, setFocus, isSubmitting, errors } = useFileUploadForm()

  // NOTE: setCopied/setLastShareToken here are passthroughs to keep useFileUploadSubmit's
  // existing signature intact. Now that copy-state lives inside ShareResult, double-check
  // whether this hook still needs setCopied at all — if not, drop it from the hook's params.
  const { onSubmit } = useFileUploadSubmit({
    clearErrors,
    setError,
    reset,
    setCopied: () => {},
    setLastShareToken: (token: string | null) => onUploadSuccess([], token),
    setShareLinks: (links: UploadedShareLink[] | null) => {
      if (links) onUploadSuccess(links, null)
    },
    setShowPassword,
  })

  const isBulkSelection = files.length > 1
  const fileSizeMB = files[0] ? (files[0].size / (1024 * 1024)).toFixed(2) : null
  const totalFileSizeMB = files.length > 1 ? (files.reduce((total, file) => total + file.size, 0) / (1024 * 1024)).toFixed(2) : null
  const submitLabel = isBulkSelection ? 'Upload folder' : 'Upload & get link'

  const { user } = useAuth()

  // Sync form expiry default with logged-in user's preference
  useEffect(() => {
    if (!user) return
    const def = user.defaultExpiry
    if (!def) return
    const parsed = Date.parse(def)
    if (!Number.isNaN(parsed)) {
      setValue('expireAt', new Date(parsed).toISOString())
      return
    }
    const preset = PRESETS.find((p) => p.key === def)
    if (preset) setValue('expireAt', new Date(Date.now() + preset.hours * 60 * 60 * 1000).toISOString())
  }, [user?.defaultExpiry, setValue])

  // Sync form privacy default with logged-in user's preference
  useEffect(() => {
    if (!user) return
    const pref = user.defaultPrivacy
    if (!pref) return
    setValue('accessType', pref)
    if (pref !== 'protected') {
      setValue('password', '')
      setShowPassword(false)
    } else {
      setTimeout(() => setFocus('password'), 0)
    }
  }, [user?.defaultPrivacy, setValue, setFocus])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('flex flex-col gap-5 transition-opacity', isSubmitting && 'opacity-60 pointer-events-none')}>
      {/* File dropzone */}
      <Controller
        name="files"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col gap-1">
            <FileUploadRoot
              maxFiles={MAX_UPLOAD_FILES}
              maxSizeMB={MAX_UPLOAD_FILE_SIZE_MB}
              accept={ACCEPTED_UPLOAD_FILE_TYPES}
              isDisabled={isSubmitting}
              onFilesChange={(files) => {
                clearErrors('root')
                field.onChange(files)
              }}
            >
              <FileUploadDropzone
                label="Drop your file here"
                description={`PDF, DOCX, XLSX, ZIP, TXT - ${MAX_UPLOAD_FILE_SIZE_MB} MB each, ${MAX_UPLOAD_FILES} files max`}
                className={errors.files ? 'border-red-400' : undefined}
              />
              <FileUploadList />
            </FileUploadRoot>
            {errors.files && <p className="text-sm text-red-500 font-sans">{errors.files.message}</p>}
          </div>
        )}
      />

      {/* Format badges + file size */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {formatBadges}
        {isBulkSelection && totalFileSizeMB ? (
          <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--brand-alpha-12)] border border-[var(--brand-alpha-30)]">
            <LuFolder className="w-3 h-3 text-[var(--brand-400)]" />
            <span className="text-[10px] font-medium text-[var(--brand-400)] font-sans tracking-tight">
              {files.length} files / {totalFileSizeMB} MB
            </span>
          </span>
        ) : fileSizeMB ? (
          <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--brand-alpha-12)] border border-[var(--brand-alpha-30)]">
            <LuFile className="w-3 h-3 text-[var(--brand-400)]" />
            <span className="text-[10px] font-medium text-[var(--brand-400)] font-sans tracking-tight">{fileSizeMB} MB</span>
          </span>
        ) : null}
      </div>

      {/* Folder Name — only when multiple files */}
      {isBulkSelection && (
        <Controller
          name="folderName"
          control={control}
          render={({ field }) => (
            <TextField className="w-full" isInvalid={!!errors.folderName} validationBehavior="aria" isDisabled={isSubmitting}>
              <Label className="text-left text-[var(--ink-900)] flex items-center gap-1.5 font-sans text-sm font-medium">
                <LuFolder className="w-4 h-4" />
                <span>Folder Name</span>
              </Label>
              <div className="relative w-full mt-1.5">
                <Input
                  {...field}
                  type="text"
                  placeholder="Enter folder name"
                  className={cn(
                    'w-full bg-[var(--brand-alpha-4)] border rounded-xl px-4 h-12 text-[15px] text-[var(--ink-900)] font-sans',
                    'placeholder:text-[var(--ink-600)]/60 focus-visible:border-[var(--brand-400)] focus-visible:ring-2 focus-visible:ring-[var(--brand-400)]/10 outline-none transition-colors',
                    errors.folderName ? 'border-red-400' : 'border-line',
                  )}
                />
              </div>
              {errors.folderName && <FieldError className="text-sm text-red-500 font-sans">{errors.folderName.message}</FieldError>}
            </TextField>
          )}
        />
      )}

      {/* Access Type — segmented control */}
      <Controller
        name="accessType"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col gap-2">
            <span className="text-left text-sm font-medium text-[var(--ink-900)] font-sans">Who can access {isBulkSelection ? 'this folder' : 'this file'}?</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 rounded-xl bg-[var(--brand-alpha-4)] border border-line">
              {ACCESS_TYPE_OPTIONS.map(({ val, label, desc, Icon }) => {
                const selected = field.value === val
                return (
                  <button
                    key={val}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      field.onChange(val)
                      if (val !== 'protected') {
                        setValue('password', '')
                        setShowPassword(false)
                      } else {
                        setTimeout(() => setFocus('password'), 0)
                      }
                    }}
                    className={cn(
                      'flex items-start gap-2.5 px-3 py-3 rounded-lg text-left transition-all',
                      selected ? 'bg-surface shadow-[0_1px_3px_rgba(15,28,46,0.08)] border border-line' : 'border border-transparent hover:bg-ink-900/[0.04]',
                      isSubmitting && 'cursor-not-allowed',
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                        selected ? 'bg-[var(--brand-alpha-12)] text-[var(--brand-400)]' : 'bg-ink-900/[0.06] text-[var(--ink-600)]',
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className={cn('text-sm font-medium font-sans', selected ? 'text-[var(--ink-900)]' : 'text-[var(--ink-800)]')}>{label}</span>
                      <span className="text-[11px] text-[var(--ink-600)] font-sans leading-tight">{desc}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      />

      {/* Password — only when protected */}
      {accessType === 'protected' && (
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField className="w-full" isInvalid={!!errors.password} validationBehavior="aria" isDisabled={isSubmitting}>
              <Label className="text-left text-[var(--ink-900)] flex items-center gap-1.5 font-sans text-sm font-medium">
                <LuLock className="w-4 h-4" />
                <span>Password</span>
              </Label>
              <div className="relative w-full mt-1.5">
                <Input
                  {...field}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={`Set a password for ${isBulkSelection ? 'this folder' : 'this file'}`}
                  className={cn(
                    'w-full bg-[var(--brand-alpha-4)] border rounded-xl px-4 h-12 pr-12 text-[15px] text-[var(--ink-900)] font-sans',
                    'placeholder:text-[var(--ink-600)]/60 focus-visible:border-[var(--brand-400)] focus-visible:ring-2 focus-visible:ring-[var(--brand-400)]/10 outline-none transition-colors',
                    errors.password ? 'border-red-400' : 'border-line',
                  )}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((curr) => !curr)}
                  disabled={isSubmitting}
                  className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 rounded-md text-[var(--ink-600)] hover:bg-ink-900/[0.06] transition-colors disabled:cursor-not-allowed"
                >
                  {showPassword ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <FieldError className="text-sm text-red-500 font-sans">{errors.password.message}</FieldError>}
            </TextField>
          )}
        />
      )}

      {/* Expiration */}
      <Controller
        name="expireAt"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col gap-1">
            <DynamicExpirySelector value={field.value} onChange={field.onChange} isInvalid={!!errors.expireAt} isDisabled={isSubmitting} />
            {errors.expireAt && <p className="text-sm text-red-500 font-sans">{errors.expireAt.message}</p>}
          </div>
        )}
      />

      {/* Delete after download */}
      <Controller
        name="deleteAfterDownload"
        control={control}
        render={({ field }) => (
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--brand-alpha-4)] border border-line">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--brand-alpha-12)] text-[var(--brand-400)] flex items-center justify-center shrink-0">
                <LuFlame className="w-4 h-4" />
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-sm font-medium text-[var(--ink-900)] font-sans">Delete after first download</span>
                <span className="text-[11px] text-[var(--ink-600)] font-sans leading-tight">
                  {isBulkSelection ? 'Each file is removed once it has been downloaded once.' : 'The file is removed once it has been downloaded once.'}
                </span>
              </div>
            </div>
            <Switch isSelected={field.value} onChange={field.onChange} isDisabled={isSubmitting} aria-label="Delete after first download" style={SWITCH_STYLE}>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch>
          </div>
        )}
      />

      {errors.root && <p className="text-sm text-red-500 font-sans text-center">{errors.root.message}</p>}

      <Button
        type="submit"
        fullWidth
        isDisabled={isSubmitting || files.length === 0}
        isPending={isSubmitting}
        className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl text-base font-medium h-12 hover:bg-[var(--ink-800)] disabled:opacity-40 disabled:cursor-not-allowed font-sans"
      >
        {isSubmitting ? <Spinner className="text-[var(--brand-50)]" /> : submitLabel}
      </Button>

      {footer}
    </form>
  )
}

export default UploadFormFields
