'use client'

import { ACCEPTED_UPLOAD_FILE_TYPES, MAX_UPLOAD_FILE_SIZE_MB } from '@/app/constants/upload'
import useFileUploadForm from '@/app/hooks/useFileUploadForm'
import useFileUploadQR from '@/app/hooks/useFileUploadQR'
import useFileUploadState from '@/app/hooks/useFileUploadState'
import useFileUploadSubmit from '@/app/hooks/useFileUploadSubmit'
import { markAsCopied } from '@/app/utils/sessionStorage'
import FileUploadDropzone from '@/components/file/FileUploadDropzone'
import FileUploadList from '@/components/file/FileUploadList'
import FileUploadRoot from '@/components/file/FileUploadRoot'
import { Button, cn, FieldError, Input, Label, Spinner, TextField } from '@heroui/react'
import dynamic from 'next/dynamic'
import { ReactNode, useEffect, useState } from 'react'
import { Controller } from 'react-hook-form'
import { LuCheck, LuCopy, LuDownload, LuEye, LuEyeOff, LuFile, LuGlobe, LuLink, LuLock, LuQrCode, LuShare2 } from 'react-icons/lu'
import QRCode from 'react-qr-code'

const DynamicExpirySelector = dynamic(() => import('../shared/ExpirySelector'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center gap-4 h-[120px] justify-center">
      <Spinner className="text-black" />
    </div>
  ),
})

interface UploadFormProps {
  formatBadges: ReactNode
  footer: ReactNode
}

const UploadForm = ({ formatBadges, footer }: UploadFormProps) => {
  const [activeTab, setActiveTab] = useState<'link' | 'qr'>('link')

  const { shareLinks, setShareLinks, lastShareToken, setLastShareToken, copied, setCopied, showPassword, setShowPassword } = useFileUploadState()
  const { files, setError, clearErrors, reset, accessType, control, handleSubmit, setValue, setFocus, isSubmitting, errors } = useFileUploadForm()
  const { onSubmit } = useFileUploadSubmit({ clearErrors, setError, reset, setCopied, setLastShareToken, setShareLinks, setShowPassword })
  const fileSizeMB = files?.[0] ? (files[0].size / (1024 * 1024)).toFixed(2) : null
  const { handleQrDownload } = useFileUploadQR({ files })

  const handleCopy = () => {
    if (!shareLinks) return
    navigator.clipboard.writeText(shareLinks)
    if (lastShareToken) {
      markAsCopied(lastShareToken)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    setShareLinks(null)
    setLastShareToken(null)
    setShowPassword(false)
    setActiveTab('link')
    clearErrors('root')
    reset()
  }

  return (
    <>
      {!shareLinks ? (
        <form onSubmit={handleSubmit(onSubmit)} className={cn('flex flex-col gap-5 transition-opacity', isSubmitting && 'opacity-60 pointer-events-none')}>
          {/* File dropzone */}
          <Controller
            name="files"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-1">
                <FileUploadRoot
                  maxFiles={1}
                  maxSizeMB={MAX_UPLOAD_FILE_SIZE_MB}
                  accept={ACCEPTED_UPLOAD_FILE_TYPES}
                  isDisabled={isSubmitting}
                  onFilesChange={(files) => {
                    clearErrors('root')
                    field.onChange(files)
                  }}
                >
                  <FileUploadDropzone label="Drop your file here" description={`PDF, DOCX, XLSX, ZIP, TXT - up to ${MAX_UPLOAD_FILE_SIZE_MB} MB`} className={errors.files ? 'border-red-400' : undefined} />
                  <FileUploadList />
                </FileUploadRoot>
                {errors.files && <p className="text-sm text-red-500 font-sans">{errors.files.message}</p>}
              </div>
            )}
          />

          {/* Format badges + file size */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            {formatBadges}
            {fileSizeMB && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--brand-alpha-12)] border border-[var(--brand-alpha-30)]">
                <LuFile className="w-3 h-3 text-[var(--brand-400)]" />
                <span className="text-[10px] font-medium text-[var(--brand-400)] font-sans tracking-tight">{fileSizeMB} MB</span>
              </span>
            )}
          </div>

          {/* Access Type — segmented control */}
          <Controller
            name="accessType"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                <span className="text-left text-sm font-medium text-[var(--ink-900)] font-sans">Who can access this file?</span>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[var(--brand-alpha-4)] border border-black/[0.06]">
                  {[
                    { val: 'public', label: 'Public', desc: 'Anyone with the link', Icon: LuGlobe },
                    { val: 'protected', label: 'Protected', desc: 'Password-locked', Icon: LuLock },
                  ].map(({ val, label, desc, Icon }) => {
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
                          selected ? 'bg-white shadow-[0_1px_3px_rgba(15,28,46,0.08)] border border-black/[0.08]' : 'border border-transparent hover:bg-white/60',
                          isSubmitting && 'cursor-not-allowed',
                        )}
                      >
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                            selected ? 'bg-[var(--brand-alpha-12)] text-[var(--brand-400)]' : 'bg-black/[0.04] text-[var(--ink-600)]',
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
                      placeholder="Set a password for this file"
                      className={cn(
                        'w-full bg-[var(--brand-alpha-4)] border rounded-xl px-4 h-12 pr-12 text-[15px] text-[var(--ink-900)] font-sans',
                        'placeholder:text-[var(--ink-600)]/60 focus-visible:border-[var(--brand-400)] focus-visible:ring-2 focus-visible:ring-[var(--brand-400)]/10 outline-none transition-colors',
                        errors.password ? 'border-red-400' : 'border-black/10',
                      )}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((curr) => !curr)}
                      disabled={isSubmitting}
                      className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 rounded-md text-[var(--ink-600)] hover:bg-black/5 transition-colors disabled:cursor-not-allowed"
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

          {errors.root && <p className="text-sm text-red-500 font-sans text-center">{errors.root.message}</p>}

          <Button
            type="submit"
            fullWidth
            isDisabled={isSubmitting || files.length === 0}
            isPending={isSubmitting}
            className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl text-base font-medium h-12 hover:bg-[var(--ink-800)] disabled:opacity-40 disabled:cursor-not-allowed font-sans"
          >
            {isSubmitting ? <Spinner className="text-[var(--brand-50)]" /> : 'Upload & get link'}
          </Button>

          {footer}
        </form>
      ) : (
        /* Success state */
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-14 h-14 bg-[var(--brand-alpha-12)] rounded-full flex items-center justify-center mx-auto">
                <LuShare2 className="w-6 h-6 text-[var(--brand-400)]" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-white">
                <LuCheck className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-xl font-serif text-[var(--ink-900)]">Your file is ready to share</p>
            <p className="text-sm text-[var(--ink-600)] font-sans text-center">Anyone with this link can download the file. We don&apos;t track who.</p>
          </div>

          {/* Tab segmented control */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[var(--brand-alpha-4)] border border-black/[0.06]">
            {[
              { val: 'link', label: 'Link', Icon: LuLink },
              { val: 'qr', label: 'QR Code', Icon: LuQrCode },
            ].map(({ val, label, Icon }) => {
              const selected = activeTab === val
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setActiveTab(val as 'link' | 'qr')}
                  className={cn(
                    'flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium font-sans transition-all',
                    selected ? 'bg-white shadow-[0_1px_3px_rgba(15,28,46,0.08)] border border-black/[0.08] text-[var(--ink-900)]' : 'border border-transparent text-[var(--ink-600)] hover:bg-white/60',
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              )
            })}
          </div>

          {/* Link tab */}
          <div className={cn(activeTab === 'link' ? 'flex flex-col gap-4' : 'hidden')}>
            <div className="flex items-center justify-between gap-3 bg-[var(--brand-alpha-4)] border border-black/10 rounded-xl px-4 py-3">
              <span className="text-sm text-[var(--ink-900)] font-sans overflow-hidden text-ellipsis whitespace-nowrap flex-1 text-left">{shareLinks}</span>
              <button
                type="button"
                aria-label="Copy link"
                onClick={handleCopy}
                className={cn('shrink-0 p-1.5 rounded-md transition-colors hover:bg-black/5', copied ? 'text-[var(--brand-400)]' : 'text-[var(--ink-600)]')}
              >
                <LuCopy className="w-4 h-4" />
              </button>
            </div>

            <Button fullWidth onPress={handleCopy} className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl text-base font-medium h-12 hover:bg-[var(--ink-800)] font-sans">
              {copied ? '✓ Link copied to clipboard' : 'Copy link'}
            </Button>
          </div>

          {/* QR tab */}
          <div className={activeTab === 'qr' ? 'flex flex-col items-center gap-4' : 'hidden'}>
            <div className="p-4 bg-white rounded-2xl border border-black/[0.06] shadow-[0_2px_12px_rgba(15,28,46,0.06)]">
              <QRCode id="share-qr-code" value={shareLinks!} size={240} level="M" bgColor="#ffffff" fgColor="#0f1c2e" />
            </div>

            <Button
              fullWidth
              onPress={handleQrDownload}
              className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl text-base font-medium h-12 hover:bg-[var(--ink-800)] font-sans flex items-center justify-center gap-2"
            >
              <LuDownload className="w-4 h-4" />
              Download QR
            </Button>
          </div>

          <Button fullWidth variant="ghost" onPress={handleReset} className="text-[var(--ink-600)] text-sm hover:text-[var(--ink-900)] hover:bg-black/5 font-sans">
            Upload another file
          </Button>
        </div>
      )}
    </>
  )
}

export default UploadForm
