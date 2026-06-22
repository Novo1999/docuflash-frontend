import { getFolderByShareToken } from '@/app/cache/cache'
import RequestPage from '@/components/request/RequestPage'
import { Card, CardContent, Spinner } from '@heroui/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { LuFileQuestion } from 'react-icons/lu'

interface PageProps {
  params: Promise<{ shareToken: string }>
}

export const metadata: Metadata = {
  title: 'Upload files',
  description: 'Send files to someone via a Docuflash request link.',
  robots: { index: false, follow: false },
}

const NotFound = () => (
  <div className="min-h-screen bg-[var(--brand-50)] flex items-center justify-center p-4">
    <Card className="max-w-[480px] w-full border-none shadow-[0_4px_40px_rgba(15,28,46,0.07)]">
      <CardContent className="p-10 flex flex-col items-center text-center gap-6">
        <div className="w-16 h-16 bg-red-500/15 rounded-full flex items-center justify-center">
          <LuFileQuestion className="text-red-500 w-8 h-8" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-serif text-[var(--ink-900)]">Request not found</h1>
          <p className="text-[var(--ink-600)] font-sans">This upload link might have expired, or it isn&apos;t accepting uploads.</p>
        </div>
        <Link href="/" className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl font-medium px-8 h-12 inline-flex items-center justify-center transition-colors hover:bg-[var(--ink-800)]">
          Back to Home
        </Link>
      </CardContent>
    </Card>
  </div>
)

async function RequestContent({ params }: PageProps) {
  const { shareToken } = await params
  let folder = null
  try {
    folder = await getFolderByShareToken(shareToken)
  } catch (error) {
    console.error('Error fetching request folder:', error)
  }

  if (!folder || !folder.acceptsUploads) {
    return <NotFound />
  }

  return <RequestPage initialFolder={folder} shareToken={shareToken} />
}

const Page = async ({ params }: PageProps) => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-4 h-screen justify-center">
          <Spinner className="text-ink-900" />
        </div>
      }
    >
      <RequestContent params={params} />
    </Suspense>
  )
}

export default Page
