'use client'

import { createNote, deleteNote, getMyNotes, updateNote } from '@/app/lib/api/notes'
import { useAuth } from '@/components/auth/useAuth'
import NoteCard from '@/components/notes/NoteCard'
import NoteComposer from '@/components/notes/NoteComposer'
import type { NoteRecord } from '@/types/note'
import { Button, Modal, Spinner, useOverlayState } from '@heroui/react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { FiAlertTriangle } from 'react-icons/fi'

type LoadState = 'loading' | 'error' | 'ready'

const Notes = () => {
  const { status, isAuthenticated, openAuthModal } = useAuth()
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [notes, setNotes] = useState<NoteRecord[]>([])
  const [noteToDelete, setNoteToDelete] = useState<NoteRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const deleteModal = useOverlayState()

  useEffect(() => {
    if (status !== 'authenticated') return

    let active = true
    getMyNotes()
      .then((myNotes) => {
        if (!active) return
        setNotes(myNotes)
        setLoadState('ready')
      })
      .catch(() => {
        if (active) setLoadState('error')
      })

    return () => {
      active = false
    }
  }, [status])

  const handleCreate = useCallback(async (payload: { title?: string; content: string }) => {
    const created = await createNote(payload)
    setNotes((current) => [created, ...current])
  }, [])

  const handleSave = useCallback(async (id: string, payload: { title?: string | null; content?: string }) => {
    const updated = await updateNote(id, payload)
    setNotes((current) => {
      const rest = current.filter((note) => note.id !== id)
      return [updated, ...rest]
    })
  }, [])

  const handleDeleteClick = useCallback(
    (note: NoteRecord) => {
      setNoteToDelete(note)
      deleteModal.open()
    },
    [deleteModal],
  )

  const handleConfirmDelete = async () => {
    if (!noteToDelete) return

    setIsDeleting(true)
    try {
      await deleteNote(noteToDelete.id)
      setNotes((current) => current.filter((note) => note.id !== noteToDelete.id))
      deleteModal.close()
      setNoteToDelete(null)
    } catch (error) {
      console.error('Failed to delete note:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="text-[var(--ink-900)]" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center font-sans">
        <p className="text-xl font-serif text-[var(--ink-900)]">You&apos;re not signed in</p>
        <p className="text-sm text-[var(--ink-600)] max-w-sm">Sign in to write and manage your personal notes.</p>
        <div className="flex items-center gap-3">
          <Button onPress={openAuthModal} className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-full font-medium h-10 px-6 text-sm hover:bg-[var(--ink-800)]">
            Sign in
          </Button>
          <Link href="/" className="text-sm text-[var(--ink-600)] no-underline hover:text-[var(--ink-900)]">
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-5">
        <NoteComposer onCreate={handleCreate} />

        {loadState === 'loading' ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-[88px] rounded-2xl bg-ink-900/10 animate-pulse" aria-hidden />
            ))}
          </div>
        ) : loadState === 'error' ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm text-[var(--ink-600)]">We couldn&apos;t load your notes. Please try again.</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <p className="text-base text-[var(--ink-900)]">No notes yet</p>
            <p className="text-sm text-[var(--ink-600)] max-w-sm">Anything you jot down here stays private to your account.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} onSave={handleSave} onDelete={handleDeleteClick} />
            ))}
          </div>
        )}
      </div>

      <Modal.Backdrop isOpen={deleteModal.isOpen} onOpenChange={deleteModal.setOpen}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-[360px]">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Icon className="bg-red-500/15 text-red-500">
                <FiAlertTriangle className="size-5" />
              </Modal.Icon>
              <Modal.Heading>Delete note</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="text-sm text-ink-600">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-ink-900">{noteToDelete?.title || 'this note'}</span>? This action cannot be undone.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="ghost" onPress={deleteModal.close} className="flex-1 text-ink-600" isDisabled={isDeleting}>
                Cancel
              </Button>
              <Button onPress={handleConfirmDelete} className="flex-1 bg-red-500 text-white hover:bg-red-600" isPending={isDeleting}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  )
}

export default Notes
