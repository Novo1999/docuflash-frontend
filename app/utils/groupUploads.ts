import type { MyFileRecord } from '@/types/file'
import type { MyFolderRecord } from '@/types/folder'

export type UploadFolderGroup = {
  folder: MyFolderRecord
  files: MyFileRecord[]
}

const byCreatedAtDesc = (a: { createdAt: string }, b: { createdAt: string }) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

// Files carry a many-to-many `folders` array, so a file can sit under several folders.
// Bucket each folder's files by id; files with no folder become the ungrouped list.
export const groupUploadsByFolder = (files: MyFileRecord[], folders: MyFolderRecord[]) => {
  const groups: UploadFolderGroup[] = [...folders].sort(byCreatedAtDesc).map((folder) => ({
    folder,
    files: files.filter((file) => file.folders.some((ref) => ref.id === folder.id)).sort(byCreatedAtDesc),
  }))

  const ungrouped = files.filter((file) => file.folders.length === 0).sort(byCreatedAtDesc)

  return { groups, ungrouped }
}
