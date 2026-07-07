import MyUploads from '@/components/me/MyUploads'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Uploads · Docuflash',
  description: 'View and manage the files and folders you have uploaded.',
}

const MyUploadsPage = () => (
  <main className="flex-1 px-6 py-12 md:py-16 font-sans">
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-serif text-[var(--ink-900)]">My Uploads</h1>
        <p className="text-sm text-[var(--ink-600)] mt-1">Files and folders you uploaded while signed in. Items auto-expire and disappear over time.</p>
      </div>
      <MyUploads />
    </div>
  </main>
)

export default MyUploadsPage
