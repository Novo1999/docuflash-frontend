'use client'

import { ACCESS_TYPES } from '@/app/constants/accessTypes'
import { ACCEPTED_UPLOAD_MIME_TYPES, SUPPORTED_UPLOAD_FORMATS } from '@/app/constants/upload'
import { deleteUploadedStorageFile, uploadFile } from '@/app/lib/api/files'
import { useUploadThing } from '@/app/utils/generateReactHelpers'
import { getClientId, getDeviceInfo, getShareLink, resolveFileType } from '@/app/utils/upload'
import { uploadSchema, type UploadFormValues } from '@/app/zod/uploadSchema'
import { FileUpload } from '@/components/file/FileUpload'
import { FileAccessType } from '@/types/file'
import { Button, Card, FieldError, Input, Label, ListBox, Select, Spinner, TextField } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { LuClock, LuCopy, LuEye, LuEyeOff, LuFile, LuLock, LuShare2, LuShield } from 'react-icons/lu'
const DynamicDateTimeField = dynamic(() => import('../shared/DateTimeField').then((mod) => mod.DateTimeField), {
  ssr: false,
  loading: () => (
    <div className="flex items-center gap-4">
      <Spinner className='text-black mx-auto' />
    </div>
  ),
})

export function UploadSection() {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    setFocus,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      files: [],
      accessType: 'public',
      password: '',
      expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  })

  const files = watch('files')
  const accessType = watch('accessType')

  const [shareLinks, setShareLinks] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const fileSizeMB = files?.[0] ? (files[0].size / (1024 * 1024)).toFixed(2) : null

  const { startUpload } = useUploadThing('fileUploader', {
    onUploadError: (error) => {
      setError('root', { message: 'Upload failed. Please try again.' })
      console.error('Upload error:', error)
    },
  })

  const onSubmit = async (data: UploadFormValues) => {
    const file = data.files[0]
    const fileType = resolveFileType(file)
    const deviceInfo = getDeviceInfo()
    const fileAccessType = data.accessType as FileAccessType

    setShareLinks(null)
    setCopied(false)
    clearErrors('root')

    if (!fileType) {
      setError('root', { message: 'This file type is not supported.' })
      return
    }

    try {
      const uploadResult = await startUpload(data.files, {
        accessType: fileAccessType,
        password: data.accessType === 'protected' ? data.password : undefined,
        expireAt: data.expireAt,
        fileType,
        deviceInfo: JSON.stringify(deviceInfo),
      })

      const uploadedFile = uploadResult?.[0]

      if (!uploadedFile) {
        throw new Error('Upload did not return a storage key')
      }

      try {
        const fileRecord = await uploadFile({
          fileName: uploadedFile.name,
          fileType,
          fileSize: uploadedFile.size,
          storageKey: uploadedFile.key,
          clientId: getClientId(),
          accessType: fileAccessType,
          expireAt: data.expireAt,
          password: data.accessType === 'protected' ? data.password : undefined,
          deviceInfo,
        })

        setShareLinks(getShareLink(fileRecord.shareToken))
        setShowPassword(false)
        reset()
      } catch (metadataError) {
        try {
          await deleteUploadedStorageFile(uploadedFile.key)
        } catch (cleanupError) {
          console.error('Upload cleanup failed:', {
            storageKey: uploadedFile.key,
            error: cleanupError,
          })
        }

        throw metadataError
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('root', { message: 'Upload failed. Please try again.' })
    }
  }

  const handleCopy = () => {
    if (!shareLinks) return
    navigator.clipboard.writeText(shareLinks)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    setShareLinks(null)
    setShowPassword(false)
    clearErrors('root')
    reset()
  }

  return (
    <>
      {/* Heading */}
      <h1 className="text-4xl md:text-5xl leading-tight text-foreground font-serif tracking-tight">
        Share any document/zip, <em className="text-primary italic">instantly</em>
      </h1>

      <p className="text-default-500 text-center font-sans">Upload a PDF, Word doc, Excel sheet, or ZIP — get a shareable link in seconds. No account needed.</p>

      {/* Upload Card */}
      <Card className="w-full bg-white border border-black/[0.06] rounded-2xl p-8 shadow-[0_4px_40px_rgba(15,28,46,0.07)] mt-2 font-sans">
        {!shareLinks ? (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* File dropzone */}
            <Controller
              name="files"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-1">
                  <FileUpload
                    maxFiles={1}
                    accept={ACCEPTED_UPLOAD_MIME_TYPES}
                    onFilesChange={(files) => {
                      clearErrors('root')
                      field.onChange(files)
                    }}
                  >
                    <FileUpload.Dropzone label="Drop your file here" description="PDF, DOCX, XLSX, ZIP — up to 10 MB" className={errors.files ? 'border-red-400' : undefined} />
                    <FileUpload.List />
                  </FileUpload>
                  {errors.files && <p className="text-sm text-red-500 font-sans">{errors.files.message}</p>}
                </div>
              )}
            />

            {/* Format badges + file size */}
            <div className="flex flex-wrap gap-2 justify-center">
              {SUPPORTED_UPLOAD_FORMATS.map((label) => (
                <span key={label} className="text-xs font-medium tracking-wide px-2.5 py-1 rounded-md bg-primary-100 text-ink-600 border border-black/[0.06] font-sans">
                  {label}
                </span>
              ))}
              {fileSizeMB && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/[0.08] border border-black/[0.06]">
                  <LuFile className="w-3 h-3 text-ink-600" />
                  <span className="text-xs font-medium text-ink-600 font-sans">{fileSizeMB} MB</span>
                </span>
              )}
            </div>

            {/* Access Type */}
            <Controller
              name="accessType"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-1">
                  <Select
                    className="w-full"
                    placeholder="Access Type"
                    selectedKey={field.value}
                    onSelectionChange={(key) => {
                      const val = key as 'public' | 'protected'
                      field.onChange(val)
                      if (val !== 'protected') {
                        setValue('password', '')
                        setShowPassword(false)
                      } else {
                        setTimeout(() => setFocus('password'), 0)
                      }
                    }}
                  >
                    <Label className="text-left text-black font-sans">Access Type</Label>
                    <Select.Trigger className="bg-primary/[0.04]">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {ACCESS_TYPES.map((type) => (
                          <ListBox.Item key={type.value} id={type.value} textValue={type.label} className="bg-primary/[0.04] text-black font-sans">
                            <Label>{type.label}</Label>
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>
              )}
            />

            {/* Password — only when protected */}
            {accessType === 'protected' && (
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField className="w-full" isInvalid={!!errors.password} validationBehavior="aria">
                    <Label className="text-left text-black flex items-center gap-1 font-sans">
                      <LuLock className="w-4 h-4" />
                      <span>Password</span>
                    </Label>
                    <div className="relative w-full">
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Set a password for this file"
                        className={[
                          'w-full bg-primary-50 border rounded-xl px-4 py-3 pr-12 text-base text-ink-900 font-sans',
                          'placeholder:text-ink-400 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10 outline-none transition-colors',
                          errors.password ? 'border-red-400' : 'border-black/20',
                        ].join(' ')}
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword((curr) => !curr)}
                        className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 rounded-md text-ink-600 hover:bg-black/5 transition-colors"
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
                  <label className="text-left text-black flex items-center gap-1 font-sans text-sm font-medium">
                    <LuClock className="w-4 h-4" />
                    <span>Expires At</span>
                  </label>
                  <DynamicDateTimeField value={field.value} onChange={field.onChange} isInvalid={!!errors.expireAt} />
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
              className="bg-ink-900 text-primary-50 rounded-xl text-base font-medium py-6 hover:bg-ink-800 disabled:opacity-40 disabled:cursor-not-allowed font-sans"
            >
              {isSubmitting ? 'Uploading...' : 'Upload & get link'}
            </Button>

            <div className="flex items-center justify-center gap-1">
              <LuShield className="w-3 h-3 text-ink-600" />
              <span className="text-xs text-ink-600 font-sans">Files under 5 MB require no registration</span>
            </div>
          </form>
        ) : (
          /* Success state */
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-primary/[0.12] rounded-full flex items-center justify-center mx-auto">
                <LuShare2 className="w-5 h-5 text-primary-400" />
              </div>
              <p className="text-lg font-medium text-ink-900 font-serif">Your file is ready to share</p>
              <p className="text-sm text-ink-600 font-sans">Anyone with this link can download the file</p>
            </div>

            <div className="flex items-center justify-between gap-3 bg-primary-50 border border-black/20 rounded-xl px-4 py-3">
              <span className="text-sm text-ink-900 font-sans overflow-hidden text-ellipsis whitespace-nowrap flex-1">{shareLinks}</span>
              <button
                type="button"
                aria-label="Copy link"
                onClick={handleCopy}
                className={['shrink-0 p-1.5 rounded-md transition-colors hover:bg-black/5', copied ? 'text-primary-400' : 'text-ink-600'].join(' ')}
              >
                <LuCopy className="w-4 h-4" />
              </button>
            </div>

            <Button fullWidth onPress={handleCopy} className="bg-ink-900 text-primary-50 rounded-xl text-base font-medium py-6 hover:bg-ink-800 font-sans">
              {copied ? '✓ Copied!' : 'Copy link'}
            </Button>

            <Button fullWidth variant="ghost" onPress={handleReset} className="text-ink-600 text-sm hover:text-ink-900 hover:bg-black/5 font-sans">
              Upload another file
            </Button>
          </div>
        )}
      </Card>
    </>
  )
}
