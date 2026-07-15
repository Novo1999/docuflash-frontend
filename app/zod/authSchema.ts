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

const forgotPasswordSchema = z.object({
  email: emailField,
})

const resetPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

type LoginFormValues = z.infer<typeof loginSchema>
type RegisterFormValues = z.infer<typeof registerSchema>
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema }
export type { ForgotPasswordFormValues, LoginFormValues, RegisterFormValues, ResetPasswordFormValues }
