'use cache'

import { apiClient } from '@/app/lib/api/client'
import { FolderRecord } from '@/types/folder'
import { cacheTag } from 'next/cache'

export async function getFolderByShareToken(token: string): Promise<FolderRecord> {
  cacheTag('folder' + token)
  const response = await apiClient<FolderRecord>(`/api/folders/token/${token}`)
  return response.data
}
