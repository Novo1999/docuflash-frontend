'use server'

import { apiClient } from "@/app/lib/api/client"
import { updateTag } from "next/cache"

export async function deleteFile(id: string, folderToken?: string): Promise<void> {
  await apiClient<null>(`/api/files/${id}`, {
    method: 'DELETE',
  })
  updateTag('folder' + folderToken)
}
