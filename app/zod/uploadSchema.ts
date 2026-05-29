import { z } from 'zod'
import { MAX_UPLOAD_FILES, MAX_UPLOAD_FILE_SIZE_BYTES, MAX_UPLOAD_FILE_SIZE_MB } from '@/app/constants/upload'

const uploadSchema = z
  .object({
    files: z
      .array(z.instanceof(File))
      .min(1, 'Please select a file to upload')
      .max(MAX_UPLOAD_FILES, `Upload up to ${MAX_UPLOAD_FILES} files at once`)
      .refine((files) => files.every((file) => file.size <= MAX_UPLOAD_FILE_SIZE_BYTES), {
        message: `File must be ${MAX_UPLOAD_FILE_SIZE_MB} MB or smaller`,
      }),
    folderName: z.string().optional(),
    accessType: z.enum(['public', 'protected']),
    password: z.string().optional(),
    expireAt: z.string().min(1, 'Please select an expiration date'),
  })
  .superRefine((data, ctx) => {
    if (data.accessType === 'protected' && !data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please set a password for protected sharing',
        path: ['password'],
      })
    }
  })

type UploadFormValues = z.infer<typeof uploadSchema>

export { uploadSchema }
export type { UploadFormValues }
