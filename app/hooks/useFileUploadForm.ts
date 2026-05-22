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
      folderName: 'My Folder',
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
