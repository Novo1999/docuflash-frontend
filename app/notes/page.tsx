import Notes from '@/components/notes/Notes'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Notes · Docuflash',
  description: 'Quick personal notes — jot things down, edit them, and clean them up whenever.',
  robots: { index: false },
}

const NotesPage = () => (
  <main className="flex-1 px-6 py-12 md:py-16 font-sans">
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-serif text-[var(--ink-900)]">Notes</h1>
        <p className="text-sm text-[var(--ink-600)] mt-1">Quick personal notes, saved to your account. Only you can see them.</p>
      </div>
      <Notes />
    </div>
  </main>
)

export default NotesPage
