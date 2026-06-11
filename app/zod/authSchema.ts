import { z } from 'zod'

const emailField = z.string().min(1, 'Email is required').email('Enter a valid email')
const passwordField = z.string().min(6, 'Password must be at least 6 characters')

const loginSchema = z.object({
  email: emailField,
  password: passwordField,
})

const registerSchema = z.object({
  displayName: z.string().min(1, 'Please enter your name'),
  email: emailField,
  password: passwordField,
})

type LoginFormValues = z.infer<typeof loginSchema>
type RegisterFormValues = z.infer<typeof registerSchema>

export { loginSchema, registerSchema }
export type { LoginFormValues, RegisterFormValues }
