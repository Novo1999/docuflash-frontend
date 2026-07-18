'use client'

import { Button } from '@heroui/react'
import { useState } from 'react'
import { LuPlus } from 'react-icons/lu'

type NoteComposerProps = {
  onCreate: (payload: { title?: string; content: string }) => Promise<void>
}

const NoteComposer = ({ onCreate }: NoteComposerProps) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const canSave = title.trim().length > 0 || content.trim().length > 0

  const handleCreate = async () => {
    if (!canSave || isSaving) return
    setIsSaving(true)
    try {
      await onCreate({ title: title.trim() || undefined, content })
      setTitle('')
      setContent('')
    } finally {
      setIsSaving(false)
    }
  }

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
        placeholder="Jot something down…"
        rows={3}
        maxLength={20000}
        className="bg-transparent text-sm text-[var(--ink-700)] placeholder:text-[var(--ink-500)] outline-none resize-y min-h-20"
      />
      <div className="flex justify-end">
        <Button
          onPress={handleCreate}
          isDisabled={!canSave}
          isPending={isSaving}
          className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-full font-medium h-9 px-5 text-sm hover:bg-[var(--ink-800)] flex items-center gap-2"
        >
          <LuPlus className="w-4 h-4" />
          Add note
        </Button>
      </div>
    </div>
  )
}

export default NoteComposer
