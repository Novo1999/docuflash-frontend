import { CreateFolderPayload, FolderRecord } from '@/types/folder'
import { apiClient } from './client'

export async function createFolder(payload: CreateFolderPayload): Promise<FolderRecord> {
  const response = await apiClient<FolderRecord>('/api/folders', {
    method: 'POST',
    body: payload,
  })
  return response.data
}

export async function getFolderById(id: string): Promise<FolderRecord> {
  const response = await apiClient<FolderRecord>(`/api/folders/${id}`)
  return response.data
}

export async function deleteFolderById(id: string): Promise<void> {
  await apiClient<null>(`/api/folders/${id}`, {
    method: 'DELETE',
  })
}

export async function deleteFolderByShareToken(token: string): Promise<void> {
  await apiClient<null>(`/api/folders/token/${token}`, {
    method: 'DELETE',
  })
}
