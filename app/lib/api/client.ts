import { BASE_URL } from '@/app/constants/api'

export type ApiResponse<T> = {
  success: boolean
  msg: string
  data: T
  status: number
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type FetchOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

export function buildApiUrl(endpoint: string): string {
  if (!BASE_URL) {
    throw new ApiError('NEXT_PUBLIC_BASE_URL is not configured', 0)
  }

  const normalizedBaseUrl = BASE_URL.replace(/\/$/, '')
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

  return `${normalizedBaseUrl}${normalizedEndpoint}`
}

export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<ApiResponse<T>> {
  const { body, headers, ...rest } = options

  const response = await fetch(buildApiUrl(endpoint), {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const json = await response.json()

  if (!response.ok) {
    throw new ApiError(json.msg ?? 'An unexpected error occurred', response.status)
  }

  return json as ApiResponse<T>
}
