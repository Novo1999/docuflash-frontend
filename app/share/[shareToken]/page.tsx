import { deleteFileByShareToken, getFileByShareToken } from '@/app/lib/api/files'
import SharedFile from '@/components/file/SharedFile'
import { Card, CardContent } from '@heroui/react'
import Link from 'next/link'
import { LuClock, LuFileQuestion } from 'react-icons/lu'

interface PageProps {
  params: Promise<{ shareToken: string }>
}

const Page = async ({ params }: PageProps) => {
  const shareToken = (await params).shareToken

  let file = null
  try {
    file = await getFileByShareToken(shareToken)
  } catch (error) {
    console.error('Error fetching file:', error)
  }

  if (!file) {
    return (
      <div className="min-h-screen bg-[var(--brand-50)] flex items-center justify-center p-4">
        <Card className="max-w-[480px] w-full border-none shadow-[0_4px_40px_rgba(15,28,46,0.07)]">
          <CardContent className="p-10 flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <LuFileQuestion className="text-red-500 w-8 h-8" />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-serif text-[var(--ink-900)]">File not found</h1>
              <p className="text-[var(--ink-600)] font-sans">The file you&apos;re looking for might have been deleted, or the link is incorrect.</p>
            </div>
            <Link href="/" className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl font-medium px-8 h-12 inline-flex items-center justify-center transition-colors hover:bg-[var(--ink-800)]">
              Back to Home
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isExpired = new Date(file.expireAt) <= new Date()
  if (isExpired) {
    const triggerBackgroundCleanup = async () => {
      try {
        await deleteFileByShareToken(shareToken)
      } catch (err) {
        console.error('Failed to delete expired file on server:', err)
      }
    }
    triggerBackgroundCleanup()
  }

  // ---- Expired state ----
  if (isExpired) {
    return (
      <div className="min-h-screen bg-[var(--brand-50)] flex items-center justify-center p-4">
        <Card className="max-w-[480px] w-full border-none shadow-[0_4px_40px_rgba(15,28,46,0.07)]">
          <CardContent className="p-10 flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <LuClock className="text-red-500 w-7 h-7" />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-serif text-[var(--ink-900)]">This link has expired</h1>
              <p className="text-[var(--ink-600)] font-sans">The shared file is no longer available for download.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <SharedFile file={file} />
}

export default Page
