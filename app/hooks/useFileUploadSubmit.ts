import { deleteUploadedStorageFile, uploadFile } from '@/app/lib/api/files'
import { useUploadThing } from '@/app/utils/generateReactHelpers'
import { addRecentUpload } from '@/app/utils/sessionStorage'
import { getClientId, getDeviceInfo, getShareLink, resolveFileType } from '@/app/utils/upload'
import { UploadFormValues } from '@/app/zod/uploadSchema'
import { FileAccessType } from '@/types/file'
import { FieldValues, UseFormClearErrors, UseFormReset, UseFormSetError } from 'react-hook-form'

type Props<T extends FieldValues> = {
  clearErrors: UseFormClearErrors<T>
  setError: UseFormSetError<T>
  reset: UseFormReset<T>
  setShareLinks: (v: string | null) => void
  setLastShareToken: (v: string | null) => void
  setCopied: (v: boolean) => void
  setShowPassword: (v: boolean) => void
}

const useFileUploadSubmit = <T extends FieldValues>({ clearErrors, reset, setError, setCopied, setLastShareToken, setShareLinks, setShowPassword }: Props<T>) => {
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
        setLastShareToken(fileRecord.shareToken)
        addRecentUpload({
          fileName: uploadedFile.name,
          fileSize: uploadedFile.size,
          fileType,
          shareToken: fileRecord.shareToken,
          storageKey: uploadedFile.key,
          expireAt: data.expireAt,
          accessType: fileAccessType,
          copied: false,
          uploadDate: new Date().toISOString(),
        })
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

  return { onSubmit }
}
export default useFileUploadSubmit
