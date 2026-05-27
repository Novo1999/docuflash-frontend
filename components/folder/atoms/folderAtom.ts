import { FileRecord } from '@/types/file';
import { FolderRecord } from '@/types/folder';
import { atom } from 'jotai';

export const itemToDeleteAtom = atom<{ kind: 'file' | 'folder'; data: FileRecord | FolderRecord } | null>(null)
export const deleteModalOpenAtom = atom(false)
