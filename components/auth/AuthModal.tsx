'use client'

import { getOAuthUrl } from '@/app/lib/api/auth'
import { loginSchema, registerSchema, type LoginFormValues, type RegisterFormValues } from '@/app/zod/authSchema'
import { useAuth } from '@/components/auth/useAuth'
import type { OAuthProvider } from '@/types/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, cn, FieldError, Input, Label, Modal, Spinner, TextField } from '@heroui/react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { LuEye, LuEyeOff, LuLock, LuMail, LuUser } from 'react-icons/lu'

type AuthMode = 'login' | 'register'

const inputClassName = (hasError: boolean) =>
  cn(
    'w-full bg-[var(--brand-alpha-4)] border rounded-xl px-4 h-12 text-[15px] text-[var(--ink-900)] font-sans',
    'placeholder:text-[var(--ink-600)]/60 focus-visible:border-[var(--brand-400)] focus-visible:ring-2 focus-visible:ring-[var(--brand-400)]/10 outline-none transition-colors',
    hasError ? 'border-red-400' : 'border-line',
  )

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, login, register } = useAuth()

  const [mode, setMode] = useState<AuthMode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null)

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: '', email: '', password: '' },
  })

  const resetState = () => {
    loginForm.reset()
    registerForm.reset()
    setMode('login')
    setShowPassword(false)
    setConfirmationEmail(null)
  }

  const handleClose = () => {
    closeAuthModal()
    resetState()
  }

  const switchMode = (next: AuthMode) => {
    setMode(next)
    setShowPassword(false)
    setConfirmationEmail(null)
    loginForm.clearErrors('root')
    registerForm.clearErrors('root')
  }

  const handleOAuth = (provider: OAuthProvider) => {
    window.location.href = getOAuthUrl(provider)
  }

  const onLogin = async (values: LoginFormValues) => {
    try {
      await login(values)
      handleClose()
    } catch (error) {
      loginForm.setError('root', { message: error instanceof Error ? error.message : 'Login failed' })
    }
  }

  const onRegister = async (values: RegisterFormValues) => {
    try {
      const result = await register(values)
      if (result.needsEmailConfirmation) {
        setConfirmationEmail(values.email)
        return
      }
      handleClose()
    } catch (error) {
      registerForm.setError('root', { message: error instanceof Error ? error.message : 'Registration failed' })
    }
  }

  const isLogin = mode === 'login'
  const isSubmitting = loginForm.formState.isSubmitting || registerForm.formState.isSubmitting

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onOpenChange={(open) => {
        if (!open) handleClose()
      }}
    >
      <Modal.Backdrop>
        <Modal.Container placement="center" size="md">
          <Modal.Dialog className="bg-surface rounded-2xl p-6 max-w-md w-full font-sans">
            <Modal.CloseTrigger />

            <Modal.Header className="px-0 pt-0 pb-4">
              <Modal.Heading className="text-2xl font-serif text-[var(--ink-900)]">{isLogin ? 'Welcome back' : 'Create your account'}</Modal.Heading>
              <p className="text-sm text-[var(--ink-600)] mt-1">
                {isLogin ? 'Sign in to manage your uploads.' : 'Sign up to keep track of everything you share.'}
              </p>
            </Modal.Header>

            <Modal.Body className="px-0 pb-0 flex flex-col gap-5">
              {confirmationEmail ? (
                <div className="flex flex-col gap-3 items-center text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--brand-alpha-12)] flex items-center justify-center">
                    <LuMail className="w-6 h-6 text-[var(--brand-400)]" />
                  </div>
                  <p className="text-base text-[var(--ink-900)] font-medium">Check your inbox</p>
                  <p className="text-sm text-[var(--ink-600)]">
                    We sent a confirmation link to <span className="font-medium text-[var(--ink-900)]">{confirmationEmail}</span>. Confirm your email, then sign in.
                  </p>
                  <Button
                    onPress={() => switchMode('login')}
                    className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl font-medium px-6 h-11 mt-1"
                  >
                    Back to sign in
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[var(--brand-alpha-4)] border border-line">
                    {(['login', 'register'] as const).map((value) => {
                      const selected = mode === value
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => switchMode(value)}
                          className={cn(
                            'px-3 py-2.5 rounded-lg text-sm font-medium font-sans transition-all',
                            selected
                              ? 'bg-surface shadow-[0_1px_3px_rgba(15,28,46,0.08)] border border-line text-[var(--ink-900)]'
                              : 'border border-transparent text-[var(--ink-600)] hover:bg-ink-900/[0.04]',
                          )}
                        >
                          {value === 'login' ? 'Sign in' : 'Sign up'}
                        </button>
                      )
                    })}
                  </div>

                  {isLogin ? (
                    <form key="login-form" onSubmit={loginForm.handleSubmit(onLogin)} className="flex flex-col gap-4">
                      <Controller
                        name="email"
                        control={loginForm.control}
                        render={({ field }) => (
                          <TextField className="w-full" isInvalid={!!loginForm.formState.errors.email} validationBehavior="aria">
                            <Label className="text-[var(--ink-900)] flex items-center gap-1.5 text-sm font-medium">
                              <LuMail className="w-4 h-4" />
                              <span>Email</span>
                            </Label>
                            <div className="relative w-full mt-1.5">
                              <Input {...field} type="email" autoComplete="email" placeholder="you@example.com" className={inputClassName(!!loginForm.formState.errors.email)} />
                            </div>
                            {loginForm.formState.errors.email && <FieldError className="text-sm text-red-500">{loginForm.formState.errors.email.message}</FieldError>}
                          </TextField>
                        )}
                      />

                      <Controller
                        name="password"
                        control={loginForm.control}
                        render={({ field }) => (
                          <TextField className="w-full" isInvalid={!!loginForm.formState.errors.password} validationBehavior="aria">
                            <Label className="text-[var(--ink-900)] flex items-center gap-1.5 text-sm font-medium">
                              <LuLock className="w-4 h-4" />
                              <span>Password</span>
                            </Label>
                            <div className="relative w-full mt-1.5">
                              <Input {...field} type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" className={cn(inputClassName(!!loginForm.formState.errors.password), 'pr-12')} />
                              <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((curr) => !curr)} className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 rounded-md text-[var(--ink-600)] hover:bg-ink-900/[0.06] transition-colors">
                                {showPassword ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                              </button>
                            </div>
                            {loginForm.formState.errors.password && <FieldError className="text-sm text-red-500">{loginForm.formState.errors.password.message}</FieldError>}
                          </TextField>
                        )}
                      />

                      {loginForm.formState.errors.root && <p className="text-sm text-red-500 text-center">{loginForm.formState.errors.root.message}</p>}

                      <Button type="submit" fullWidth isDisabled={isSubmitting} isPending={isSubmitting} className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl text-base font-medium h-12 hover:bg-[var(--ink-800)] disabled:opacity-40">
                        {isSubmitting ? <Spinner className="text-[var(--brand-50)]" /> : 'Sign in'}
                      </Button>
                    </form>
                  ) : (
                    <form key="register-form" onSubmit={registerForm.handleSubmit(onRegister)} className="flex flex-col gap-4">
                      <Controller
                        name="displayName"
                        control={registerForm.control}
                        render={({ field }) => (
                          <TextField className="w-full" isInvalid={!!registerForm.formState.errors.displayName} validationBehavior="aria">
                            <Label className="text-[var(--ink-900)] flex items-center gap-1.5 text-sm font-medium">
                              <LuUser className="w-4 h-4" />
                              <span>Name</span>
                            </Label>
                            <div className="relative w-full mt-1.5">
                              <Input {...field} type="text" autoComplete="name" placeholder="Your name" className={inputClassName(!!registerForm.formState.errors.displayName)} />
                            </div>
                            {registerForm.formState.errors.displayName && <FieldError className="text-sm text-red-500">{registerForm.formState.errors.displayName.message}</FieldError>}
                          </TextField>
                        )}
                      />

                      <Controller
                        name="email"
                        control={registerForm.control}
                        render={({ field }) => (
                          <TextField className="w-full" isInvalid={!!registerForm.formState.errors.email} validationBehavior="aria">
                            <Label className="text-[var(--ink-900)] flex items-center gap-1.5 text-sm font-medium">
                              <LuMail className="w-4 h-4" />
                              <span>Email</span>
                            </Label>
                            <div className="relative w-full mt-1.5">
                              <Input {...field} type="email" autoComplete="email" placeholder="you@example.com" className={inputClassName(!!registerForm.formState.errors.email)} />
                            </div>
                            {registerForm.formState.errors.email && <FieldError className="text-sm text-red-500">{registerForm.formState.errors.email.message}</FieldError>}
                          </TextField>
                        )}
                      />

                      <Controller
                        name="password"
                        control={registerForm.control}
                        render={({ field }) => (
                          <TextField className="w-full" isInvalid={!!registerForm.formState.errors.password} validationBehavior="aria">
                            <Label className="text-[var(--ink-900)] flex items-center gap-1.5 text-sm font-medium">
                              <LuLock className="w-4 h-4" />
                              <span>Password</span>
                            </Label>
                            <div className="relative w-full mt-1.5">
                              <Input {...field} type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 6 characters" className={cn(inputClassName(!!registerForm.formState.errors.password), 'pr-12')} />
                              <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((curr) => !curr)} className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 rounded-md text-[var(--ink-600)] hover:bg-ink-900/[0.06] transition-colors">
                                {showPassword ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                              </button>
                            </div>
                            {registerForm.formState.errors.password && <FieldError className="text-sm text-red-500">{registerForm.formState.errors.password.message}</FieldError>}
                          </TextField>
                        )}
                      />

                      {registerForm.formState.errors.root && <p className="text-sm text-red-500 text-center">{registerForm.formState.errors.root.message}</p>}

                      <Button type="submit" fullWidth isDisabled={isSubmitting} isPending={isSubmitting} className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl text-base font-medium h-12 hover:bg-[var(--ink-800)] disabled:opacity-40">
                        {isSubmitting ? <Spinner className="text-[var(--brand-50)]" /> : 'Create account'}
                      </Button>
                    </form>
                  )}

                  <div className="flex items-center gap-3">
                    <span className="h-px flex-1 bg-ink-900/15" />
                    <span className="text-xs text-[var(--ink-600)]">or continue with</span>
                    <span className="h-px flex-1 bg-ink-900/15" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button onPress={() => handleOAuth('google')} variant="ghost" fullWidth className="w-full border border-line rounded-xl h-12 flex items-center justify-center gap-2 text-[var(--ink-900)] hover:bg-ink-900/[0.06]">
                      <FcGoogle className="w-5 h-5" />
                      Google
                    </Button>
                    <Button onPress={() => handleOAuth('github')} variant="ghost" fullWidth className="w-full border border-line rounded-xl h-12 flex items-center justify-center gap-2 text-[var(--ink-900)] hover:bg-ink-900/[0.06]">
                      <FaGithub className="w-5 h-5" />
                      GitHub
                    </Button>
                  </div>
                </>
              )}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}

export default AuthModal
