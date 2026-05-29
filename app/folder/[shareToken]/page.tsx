import { getFolderByShareToken } from '@/app/cache/cache'
import SharedFolderPage from '@/components/folder/SharedFolderPage'
import { Card, CardContent, Spinner } from '@heroui/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { LuFileQuestion } from 'react-icons/lu'

interface PageProps {
  params: Promise<{ shareToken: string }>
}

export const metadata: Metadata = {
  title: 'Shared Folder',
  description: 'A private folder shared via Docuflash.',
  robots: { index: false, follow: false },
}

async function FolderContent({ params }: PageProps) {
  const { shareToken } = await params
  let folder = null
  try {
    folder = await getFolderByShareToken(shareToken)
  } catch (error) {
    console.error('Error fetching folder:', error)
  }

  if (!folder) {
    return (
      <div className="min-h-screen bg-[var(--brand-50)] flex items-center justify-center p-4">
        <Card className="max-w-[480px] w-full border-none shadow-[0_4px_40px_rgba(15,28,46,0.07)]">
          <CardContent className="p-10 flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <LuFileQuestion className="text-red-500 w-8 h-8" />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-serif text-[var(--ink-900)]">Folder not found</h1>
              <p className="text-[var(--ink-600)] font-sans">The folder you&apos;re looking for might have been deleted, or the link is incorrect.</p>
            </div>
            <Link href="/" className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl font-medium px-8 h-12 inline-flex items-center justify-center transition-colors hover:bg-[var(--ink-800)]">
              Back to Home
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <SharedFolderPage initialFolder={folder} shareToken={shareToken} />
}

const Page = async ({ params }: PageProps) => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-4 h-screen justify-center">
          <Spinner className="text-black" />
        </div>
      }
    >
      <FolderContent params={params} />
    </Suspense>
  )
}

export default Page
