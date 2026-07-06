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
  const folderIds = new Set(folders.map((folder) => folder.id))

  const groups: UploadFolderGroup[] = [...folders].sort(byCreatedAtDesc).map((folder) => ({
    folder,
    files: files.filter((file) => file.folders.some((ref) => ref.id === folder.id)).sort(byCreatedAtDesc),
  }))

  // A file is ungrouped when it has no folder, or when none of its folders are in
  // the provided list. The latter matters under search: a file matched by name can
  // live in a folder whose name didn't match, so it has no group to render in.
  const ungrouped = files.filter((file) => file.folders.length === 0 || !file.folders.some((ref) => folderIds.has(ref.id))).sort(byCreatedAtDesc)

  return { groups, ungrouped }
}
