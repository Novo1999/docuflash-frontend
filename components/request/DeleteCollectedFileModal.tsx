'use client'

import { Button, Modal } from '@heroui/react'
import { FiAlertTriangle } from 'react-icons/fi'

interface DeleteCollectedFileModalProps {
  fileName: string | null
  isDeleting: boolean
  onConfirm: () => void
  onClose: () => void
}

const DeleteCollectedFileModal = ({ fileName, isDeleting, onConfirm, onClose }: DeleteCollectedFileModalProps) => (
  <Modal.Backdrop isOpen={fileName !== null} onOpenChange={(open) => !open && !isDeleting && onClose()}>
    <Modal.Container>
      <Modal.Dialog className="sm:max-w-[360px]">
        <Modal.CloseTrigger />
        <Modal.Header>
          <Modal.Icon className="bg-red-500/15 text-red-500">
            <FiAlertTriangle className="size-5" />
          </Modal.Icon>
          <Modal.Heading>Delete file</Modal.Heading>
        </Modal.Header>
        <Modal.Body>
          <p className="text-sm text-[var(--ink-600)] font-sans">
            Are you sure you want to delete <span className="font-semibold text-[var(--ink-900)]">{fileName}</span>? It will be removed from storage for everyone and this cannot be
            undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="ghost" onPress={onClose} className="flex-1 text-[var(--ink-600)] font-sans" isDisabled={isDeleting}>
            Cancel
          </Button>
          <Button onPress={onConfirm} className="flex-1 bg-red-500 text-white hover:bg-red-600 font-sans font-medium" isPending={isDeleting}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal.Dialog>
    </Modal.Container>
  </Modal.Backdrop>
)

export default DeleteCollectedFileModal
