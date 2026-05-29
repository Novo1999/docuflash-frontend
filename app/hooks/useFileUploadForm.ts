import { DEFAULT_UPLOAD_FOLDER_NAME } from '@/app/constants/upload'
import { UploadFormValues, uploadSchema } from '@/app/zod/uploadSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

const useFileUploadForm = () => {
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
      folderName: DEFAULT_UPLOAD_FOLDER_NAME,
      accessType: 'public',
      password: '',
      expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  })

  const files = watch('files')
  const accessType = watch('accessType')

  return { files, setError, clearErrors, reset, accessType, control, handleSubmit, setValue, setFocus, isSubmitting, errors }
}
export default useFileUploadForm
