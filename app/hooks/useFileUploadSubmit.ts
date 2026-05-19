import { MAX_UPLOAD_FILES } from '@/app/constants/upload'
import { deleteFileByShareToken, deleteUploadedStorageFile, uploadFile } from '@/app/lib/api/files'
import { useUploadThing } from '@/app/utils/generateReactHelpers'
import { addRecentUpload } from '@/app/utils/sessionStorage'
import { getClientId, getDeviceInfo, getShareLink, resolveFileType } from '@/app/utils/upload'
import { UploadFormValues } from '@/app/zod/uploadSchema'
import type { StoredUpload, UploadedShareLink } from '@/types/file'
import { FileAccessType } from '@/types/file'
import { FieldValues, UseFormClearErrors, UseFormReset, UseFormSetError } from 'react-hook-form'

type Props<T extends FieldValues> = {
  clearErrors: UseFormClearErrors<T>
  setError: UseFormSetError<T>
  reset: UseFormReset<T>
  setShareLinks: (v: UploadedShareLink[] | null) => void
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
    const selectedFiles = data.files.slice(0, MAX_UPLOAD_FILES)
    const filesWithTypes = selectedFiles.map((file) => ({
      file,
      fileType: resolveFileType(file),
    }))
    const unsupportedFile = filesWithTypes.find(({ fileType }) => !fileType)?.file
    const deviceInfo = getDeviceInfo()
    const fileAccessType = data.accessType as FileAccessType

    setShareLinks(null)
    setCopied(false)
    clearErrors('root')

    if (unsupportedFile) {
      setError('root', { message: `"${unsupportedFile.name}" is not supported.` })
      return
    }

    try {
      const uploadResult = await startUpload(selectedFiles, {
        accessType: fileAccessType,
        password: data.accessType === 'protected' ? data.password : undefined,
        expireAt: data.expireAt,
        fileType: filesWithTypes[0]?.fileType,
        deviceInfo: JSON.stringify(deviceInfo),
      })

      const uploadedFiles = uploadResult ?? []
      console.log('🚀 ~ onSubmit ~ uploadedFiles:', uploadedFiles)

      if (uploadedFiles.length !== filesWithTypes.length) {
        throw new Error('Upload did not return every storage key')
      }

      const uploadedShareLinks: UploadedShareLink[] = []
      const recentUploads: StoredUpload[] = []
      const createdShareTokens: string[] = []

      try {
        for (const [index, uploadedFile] of uploadedFiles.entries()) {
          const fileType = filesWithTypes[index]?.fileType
          if (!fileType) throw new Error(`Could not resolve file type for ${uploadedFile.name}`)

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

          createdShareTokens.push(fileRecord.shareToken)
          uploadedShareLinks.push({
            fileName: uploadedFile.name,
            shareToken: fileRecord.shareToken,
            link: getShareLink(fileRecord.shareToken),
          })
          recentUploads.push({
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
        }

        for (const recentUpload of recentUploads) {
          addRecentUpload(recentUpload)
        }

        setShareLinks(uploadedShareLinks)
        setLastShareToken(uploadedShareLinks[0]?.shareToken ?? null)
        setShowPassword(false)
        reset()
      } catch (metadataError) {
        const cleanupResults = await Promise.allSettled([
          ...createdShareTokens.map((shareToken) => deleteFileByShareToken(shareToken)),
          ...uploadedFiles.map((uploadedFile) => deleteUploadedStorageFile(uploadedFile.key)),
        ])

        cleanupResults.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error('Upload cleanup failed:', {
              target: index < createdShareTokens.length ? createdShareTokens[index] : uploadedFiles[index - createdShareTokens.length]?.key,
              error: result.reason,
            })
          }
        })

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
