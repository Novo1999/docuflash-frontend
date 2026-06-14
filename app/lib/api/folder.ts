import { CreateFolderPayload, FolderRecord, MyFolderRecord } from '@/types/folder'
import type { ApiResponse } from './client'
import { ApiError, apiClient } from './client'

const requireApiData = <T>(response: ApiResponse<T>, fallbackMessage: string): T => {
  if (!response.success) {
    throw new ApiError(response.msg || fallbackMessage, response.status)
  }

  return response.data
}

export async function createFolder(payload: CreateFolderPayload): Promise<FolderRecord> {
  if (payload.accessType === 'protected' && !payload.password) {
    throw new Error('A password is required for protected folders')
  }

  const response = await apiClient<FolderRecord>('/api/folders', {
    method: 'POST',
    body: payload,
  })
  return requireApiData(response, 'Failed to create folder')
}

export async function getMyFolders(): Promise<MyFolderRecord[]> {
  const response = await apiClient<MyFolderRecord[]>('/api/folders/mine')
  return requireApiData(response, 'Failed to load your folders')
}

export async function getFolderById(id: string): Promise<FolderRecord> {
  const response = await apiClient<FolderRecord>(`/api/folders/${id}`)
  return requireApiData(response, 'Failed to fetch folder')
}

export async function unlockFolderByShareToken(token: string, password: string): Promise<FolderRecord> {
  const response = await apiClient<FolderRecord>(`/api/folders/token/${token}/unlock`, {
    method: 'POST',
    body: { password },
  })

  return requireApiData(response, 'Invalid password')
}

export async function deleteFolderById(id: string): Promise<void> {
  const response = await apiClient<null>(`/api/folders/${id}`, {
    method: 'DELETE',
  })
  requireApiData(response, 'Failed to delete folder')
}

export async function deleteFolderByShareToken(token: string): Promise<void> {
  const response = await apiClient<null>(`/api/folders/token/${token}`, {
    method: 'DELETE',
  })
  requireApiData(response, 'Failed to delete folder')
}
