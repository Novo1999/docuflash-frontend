'use client'

import { isEmailShareConfigured } from '@/app/constants/email'
import { ACCEPTED_UPLOAD_FILE_TYPES, MAX_UPLOAD_FILES, MAX_UPLOAD_FILE_SIZE_MB } from '@/app/constants/upload'
import useFileUploadForm from '@/app/hooks/useFileUploadForm'
import useFileUploadQR from '@/app/hooks/useFileUploadQR'
import useFileUploadState from '@/app/hooks/useFileUploadState'
import useFileUploadSubmit from '@/app/hooks/useFileUploadSubmit'
import { markAsCopied } from '@/app/utils/sessionStorage'
import FileUploadDropzone from '@/components/file/FileUploadDropzone'
import FileUploadList from '@/components/file/FileUploadList'
import FileUploadRoot from '@/components/file/FileUploadRoot'
import ShareToEmailModal, { type ShareEmailTarget } from '@/components/share/ShareToEmailModal'
import { Button, cn, FieldError, Input, Label, Spinner, TextField } from '@heroui/react'
import dynamic from 'next/dynamic'
import { ReactNode, useState } from 'react'
import { Controller } from 'react-hook-form'
import { LuCheck, LuCopy, LuDownload, LuEye, LuEyeOff, LuFile, LuFolder, LuGlobe, LuLink, LuLock, LuMail, LuQrCode, LuShare2 } from 'react-icons/lu'
import QRCode from 'react-qr-code'
import { FileAccessType, type UploadedShareLink } from '@/types/file'

const DynamicExpirySelector = dynamic(() => import('../shared/ExpirySelector'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center gap-4 h-[120px] justify-center">
      <Spinner className="text-ink-900" />
    </div>
  ),
})

interface UploadFormProps {
  formatBadges: ReactNode
  footer: ReactNode
}

const UploadForm = ({ formatBadges, footer }: UploadFormProps) => {
  const [activeTab, setActiveTab] = useState<'link' | 'qr'>('link')
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null)
  const [emailOpen, setEmailOpen] = useState(false)

  const { shareLinks, setShareLinks, setLastShareToken, copied, setCopied, showPassword, setShowPassword } = useFileUploadState()
  const { files, setError, clearErrors, reset, accessType, control, handleSubmit, setValue, setFocus, isSubmitting, errors } = useFileUploadForm()
  const { onSubmit } = useFileUploadSubmit({ clearErrors, setError, reset, setCopied, setLastShareToken, setShareLinks, setShowPassword })
  const shareLinkItems = shareLinks ?? []
  const primaryShareLink = shareLinkItems[0]
  const isBulkSelection = files.length > 1
  const isBulkResult = shareLinkItems.length > 1
  const isProtectedResult = primaryShareLink?.accessType === 'protected'
  const fileSizeMB = files[0] ? (files[0].size / (1024 * 1024)).toFixed(2) : null
  const totalFileSizeMB = files.length > 1 ? (files.reduce((total, file) => total + file.size, 0) / (1024 * 1024)).toFixed(2) : null
  const submitLabel = isBulkSelection ? 'Upload folder' : 'Upload & get link'
  const { handleQrDownload } = useFileUploadQR({ fileName: primaryShareLink?.fileName })
  const emailTarget: ShareEmailTarget | null = primaryShareLink
    ? {
        name: primaryShareLink.fileName,
        link: primaryShareLink.link,
        resourceType: primaryShareLink.kind === 'folder' ? 'folder' : 'file',
        isProtected: primaryShareLink.accessType === FileAccessType.PROTECTED,
      }
    : null

  const handleCopy = (linkItem?: UploadedShareLink) => {
    if (!shareLinks) return
    const linksToCopy = linkItem ? [linkItem] : shareLinks
    navigator.clipboard.writeText(linksToCopy.map(({ link }) => link).join('\n'))
    linksToCopy.forEach(({ shareToken }) => markAsCopied(shareToken))

    setCopiedLinkId(linkItem?.shareToken ?? 'all')
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
      setCopiedLinkId(null)
    }, 2000)
  }

  const handleReset = () => {
    setShareLinks(null)
    setLastShareToken(null)
    setShowPassword(false)
    setActiveTab('link')
    setCopiedLinkId(null)
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
      ) : (
        /* Success state */
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-14 h-14 bg-[var(--brand-alpha-12)] rounded-full flex items-center justify-center mx-auto">
                {primaryShareLink?.kind === 'folder' ? (
                  <LuFolder className="w-6 h-6 text-[var(--brand-400)]" />
                ) : (
                  <LuShare2 className="w-6 h-6 text-[var(--brand-400)]" />
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-surface">
                <LuCheck className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-xl font-serif text-[var(--ink-900)]">
              {primaryShareLink?.kind === 'folder' ? 'Your folder is ready to share' : isBulkResult ? 'Your folder is ready to share' : 'Your file is ready to share'}
            </p>
            <p className="text-sm text-[var(--ink-600)] font-sans text-center">
              {primaryShareLink?.kind === 'folder' 
                ? isProtectedResult
                  ? 'Share this link and password so others can unlock the folder.'
                  : 'Anyone with this link can view the files in the folder.'
                : isBulkResult 
                  ? `${shareLinkItems.length} files uploaded. Copy individual links or the full folder list.` 
                  : isProtectedResult
                    ? 'Share this link and password so others can unlock the file.'
                    : 'Anyone with this link can download the file. We don\'t track who.'}
            </p>
          </div>

          {isBulkResult ? (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-line bg-[var(--brand-alpha-4)] overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-line bg-ink-900/[0.03]">
                  <div className="w-9 h-9 rounded-lg bg-[var(--brand-alpha-12)] flex items-center justify-center shrink-0">
                    <LuFolder className="w-5 h-5 text-[var(--brand-400)]" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1 text-left">
                    <span className="text-sm font-medium text-[var(--ink-900)] font-sans">{shareLinkItems.length} files uploaded</span>
                    <span className="text-xs text-[var(--ink-600)] font-sans">Each file has its own share link</span>
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto">
                  {shareLinkItems.map((linkItem) => (
                    <div key={linkItem.shareToken} className="flex items-center gap-3 px-4 py-3 border-b border-line last:border-b-0">
                      <LuFile className="w-4 h-4 text-[var(--ink-600)] shrink-0" />
                      <div className="flex flex-col min-w-0 flex-1 text-left">
                        <span className="text-sm font-medium text-[var(--ink-900)] font-sans truncate">{linkItem.fileName}</span>
                        <span className="text-xs text-[var(--ink-600)] font-sans truncate">{linkItem.link}</span>
                      </div>
                      <button
                        type="button"
                        aria-label={`Copy ${linkItem.fileName} link`}
                        onClick={() => handleCopy(linkItem)}
                        className={cn('shrink-0 p-1.5 rounded-md transition-colors hover:bg-ink-900/[0.06]', copiedLinkId === linkItem.shareToken ? 'text-[var(--brand-400)]' : 'text-[var(--ink-600)]')}
                      >
                        <LuCopy className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <Button fullWidth onPress={() => handleCopy()} className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl text-base font-medium h-12 hover:bg-[var(--ink-800)] font-sans">
                {copied && copiedLinkId === 'all' ? 'Links copied to clipboard' : 'Copy all links'}
              </Button>
            </div>
          ) : (
            <>
          {/* Tab segmented control */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[var(--brand-alpha-4)] border border-line">
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
                    selected ? 'bg-surface shadow-[0_1px_3px_rgba(15,28,46,0.08)] border border-line text-[var(--ink-900)]' : 'border border-transparent text-[var(--ink-600)] hover:bg-ink-900/[0.04]',
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
            <div className="flex items-center justify-between gap-3 bg-[var(--brand-alpha-4)] border border-line rounded-xl px-4 py-3">
              <span className="text-sm text-[var(--ink-900)] font-sans overflow-hidden text-ellipsis whitespace-nowrap flex-1 text-left">{primaryShareLink?.link}</span>
              <button
                type="button"
                aria-label="Copy link"
                onClick={() => handleCopy(primaryShareLink)}
                className={cn('shrink-0 p-1.5 rounded-md transition-colors hover:bg-ink-900/[0.06]', copied ? 'text-[var(--brand-400)]' : 'text-[var(--ink-600)]')}
              >
                <LuCopy className="w-4 h-4" />
              </button>
            </div>

            <Button fullWidth onPress={() => handleCopy(primaryShareLink)} className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl text-base font-medium h-12 hover:bg-[var(--ink-800)] font-sans">
              {copied ? 'Link copied to clipboard' : 'Copy link'}
            </Button>
          </div>

          {/* QR tab */}
            <div className={activeTab === 'qr' ? 'flex flex-col items-center gap-4' : 'hidden'}>
              <div className="p-4 bg-white rounded-2xl border border-black/[0.06] shadow-[0_2px_12px_rgba(15,28,46,0.06)]">
              <QRCode id="share-qr-code" value={primaryShareLink?.link ?? ''} size={240} level="M" bgColor="#ffffff" fgColor="#0f1c2e" />
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
            </>
          )}

          {isEmailShareConfigured && primaryShareLink ? (
            <Button
              fullWidth
              variant="secondary"
              onPress={() => setEmailOpen(true)}
              className="rounded-xl text-base font-medium h-12 font-sans flex items-center justify-center gap-2"
            >
              <LuMail className="w-4 h-4" />
              Share via email
            </Button>
          ) : null}

          <Button fullWidth variant="ghost" onPress={handleReset} className="text-[var(--ink-600)] text-sm hover:text-[var(--ink-900)] hover:bg-ink-900/[0.06] font-sans">
            {primaryShareLink?.kind === 'folder' ? 'Upload another folder' : isBulkResult ? 'Upload another folder' : 'Upload another file'}
          </Button>

          <ShareToEmailModal isOpen={emailOpen} onOpenChange={setEmailOpen} target={emailTarget} />
        </div>
      )}
    </>
  )
}

export default UploadForm
