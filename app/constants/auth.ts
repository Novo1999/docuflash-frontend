import type { OAuthProvider } from '@/types/auth'

export const AUTH_SESSION_STORAGE_KEY = 'docuflash_auth_session'

export const OAUTH_PROVIDERS: readonly OAuthProvider[] = ['google', 'github']

export const TOKEN_REFRESH_LEEWAY_SECONDS = 60

export const OAUTH_CALLBACK_PATH = '/auth/callback'

export const MAX_AVATAR_SIZE_MB = 1

export const MAX_AVATAR_SIZE_BYTES = MAX_AVATAR_SIZE_MB * 1024 * 1024
