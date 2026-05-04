import { FileRecord, UploadFilePayload } from '@/types/file'
import { ApiError, apiClient, buildApiUrl } from './client'

export async function uploadFile(payload: UploadFilePayload): Promise<FileRecord> {
  if (payload.accessType === 'protected' && !payload.password) {
    throw new Error('A password is required for protected files')
  }

  const response = await apiClient<FileRecord>('/api/files', {
    method: 'POST',
    body: payload,
  })

  return response.data
}

export async function getFileByShareToken(token: string): Promise<FileRecord> {
  const response = await apiClient<FileRecord>(`/api/files/${token}`)
  return response.data
}

export async function deleteFile(id: string): Promise<void> {
  await apiClient<null>(`/api/files/${id}`, {
    method: 'DELETE',
  })
}

export async function deleteFileByShareToken(token: string): Promise<void> {
  await apiClient<null>(`/api/files/token/${token}`, {
    method: 'DELETE',
  })
}

export async function verifyFilePassword(token: string, password: string): Promise<{ fileUrl: string }> {
  const response = await apiClient<{ fileUrl: string }>(`/api/files/${token}/verify`, {
    method: 'POST',
    body: { password },
  })
  return response.data
}

export async function getFileDownloadUrl(token: string): Promise<{ fileUrl: string }> {
  const response = await apiClient<{ fileUrl: string }>(`/api/files/${token}/download`)
  return response.data
}

export async function deleteUploadedStorageFile(storageKey: string): Promise<void> {
  const response = await fetch(buildApiUrl('/api/uploadthing'), {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ storageKey }),
  })

  if (!response.ok) {
    let message = 'Failed to delete uploaded storage file'

    try {
      const json = await response.json()
      message = json.msg ?? json.message ?? message
    } catch {
      // Keep the fallback message when the cleanup endpoint returns no JSON.
    }

    throw new ApiError(message, response.status)
  }
}
