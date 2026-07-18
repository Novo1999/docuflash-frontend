'use client'

import type { NoteRecord } from '@/types/note'
import { Button } from '@heroui/react'
import { useState } from 'react'
import { LuPencil, LuTrash2 } from 'react-icons/lu'

type NoteCardProps = {
  note: NoteRecord
  onSave: (id: string, payload: { title?: string | null; content?: string }) => Promise<void>
  onDelete: (note: NoteRecord) => void
}

const formatUpdatedAt = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

const NoteCard = ({ note, onSave, onDelete }: NoteCardProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const startEditing = () => {
    setTitle(note.title ?? '')
    setContent(note.content)
    setIsEditing(true)
  }

  const canSave = title.trim().length > 0 || content.trim().length > 0

  const handleSave = async () => {
    if (!canSave || isSaving) return
    setIsSaving(true)
    try {
      await onSave(note.id, { title: title.trim() || null, content })
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  if (isEditing) {
    return (
      <div className="bg-surface border border-line rounded-2xl p-4 shadow-[0_2px_20px_rgba(15,28,46,0.04)] flex flex-col gap-3">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title (optional)"
          maxLength={200}
          className="bg-transparent text-sm font-medium text-[var(--ink-900)] placeholder:text-[var(--ink-500)] outline-none"
        />
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={4}
          maxLength={20000}
          className="bg-transparent text-sm text-[var(--ink-700)] placeholder:text-[var(--ink-500)] outline-none resize-y min-h-20"
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onPress={() => setIsEditing(false)} isDisabled={isSaving} className="rounded-full h-9 px-4 text-sm text-ink-600">
            Cancel
          </Button>
          <Button
            onPress={handleSave}
            isDisabled={!canSave}
            isPending={isSaving}
            className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-full font-medium h-9 px-5 text-sm hover:bg-[var(--ink-800)]"
          >
            Save
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-line rounded-2xl p-4 shadow-[0_2px_20px_rgba(15,28,46,0.04)] flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {note.title ? <p className="text-sm font-medium text-[var(--ink-900)] break-words">{note.title}</p> : null}
          {note.content ? <p className="text-sm text-[var(--ink-700)] whitespace-pre-wrap break-words mt-1">{note.content}</p> : null}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button isIconOnly size="sm" variant="ghost" aria-label="Edit note" onPress={startEditing} className="text-ink-600">
            <LuPencil className="w-4 h-4" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label="Delete note"
            onPress={() => onDelete(note)}
            className="text-red-400 hover:text-red-600 hover:bg-red-500/10"
          >
            <LuTrash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <p className="text-xs text-ink-500">{formatUpdatedAt(note.updatedAt)}</p>
    </div>
  )
}

export default NoteCard
