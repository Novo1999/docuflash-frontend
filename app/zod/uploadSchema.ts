import { z } from 'zod'

const uploadSchema = z
  .object({
    files: z.array(z.instanceof(File)).min(1, 'Please select a file to upload'),
    accessType: z.enum(['public', 'protected']),
    password: z.string().optional(),
    expireAt: z.string().min(1, 'Please select an expiration date'),
  })
  .superRefine((data, ctx) => {
    if (data.accessType === 'protected' && !data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please set a password for protected files',
        path: ['password'],
      })
    }
  })

type UploadFormValues = z.infer<typeof uploadSchema>

export { uploadSchema }
export type { UploadFormValues }
