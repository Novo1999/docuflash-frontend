'use client'
import { useFileDelete } from '@/app/hooks/useFileDelete'
import { useFolderDelete } from '@/app/hooks/useFolderDelete'
import { deleteModalOpenAtom, itemToDeleteAtom } from '@/components/folder/atoms/folderAtom'
import { FileRecord } from '@/types/file'
import { FolderRecord } from '@/types/folder'
import { Button, Modal } from '@heroui/react'
import { useAtom } from 'jotai'
import { FiAlertTriangle } from 'react-icons/fi'
import { LuTrash2 } from 'react-icons/lu'

interface ItemDeletionProps {
  folder: FolderRecord
}

const ItemDeletion = ({ folder }: ItemDeletionProps) => {
  const [isDeleteModalOpen, setDeleteModalOpen] = useAtom(deleteModalOpenAtom)
  const [itemToDelete, setItemToDelete] = useAtom(itemToDeleteAtom)
  const { removeFolder, isDeletingFolder } = useFolderDelete()
  const { removeFile, isDeleting } = useFileDelete(folder.shareToken)

  const handleDeleteFolderClick = () => {
    setItemToDelete({ kind: 'folder', data: folder })
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    if (itemToDelete.kind === 'file') {
      const success = await removeFile(itemToDelete.data.id)
      console.log("🚀 ~ handleConfirmDelete ~ success:", success)
      if (success) {
        setDeleteModalOpen(false)
        setItemToDelete(null)
      }
    } else {
      const success = await removeFolder(folder.shareToken)
      if (success) setDeleteModalOpen(false)
    }
  }
  const isAnyActionPending = !!isDeleting || isDeletingFolder

  return (
    <>
      <Button isIconOnly variant="ghost" size="sm" onPress={handleDeleteFolderClick} className="text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0" aria-label="Delete folder">
        <LuTrash2 className="w-4 h-4" />
      </Button>
      <Modal.Backdrop isOpen={isDeleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-[360px]">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Icon className="bg-red-50 text-red-500">
                <FiAlertTriangle className="size-5" />
              </Modal.Icon>
              <Modal.Heading>Delete {itemToDelete?.kind}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="text-sm text-[var(--ink-600)] font-sans">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-[var(--ink-900)]">
                  {itemToDelete?.kind === 'file' ? (itemToDelete.data as FileRecord).fileName : (itemToDelete?.data as FolderRecord)?.folderName}
                </span>
                ? This action cannot be undone.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="ghost" onPress={() => setDeleteModalOpen(false)} className="flex-1 text-[var(--ink-600)] font-sans" isDisabled={isAnyActionPending}>
                Cancel
              </Button>
              <Button onPress={handleConfirmDelete} className="flex-1 bg-red-500 text-white hover:bg-red-600 font-sans font-medium" isPending={isAnyActionPending}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  )
}
export default ItemDeletion
