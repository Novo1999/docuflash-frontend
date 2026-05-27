import { getFolderByShareToken } from '@/app/cache/cache'
import { formatDate } from '@/app/utils/shareFileUtil'
import SharedFolder from '@/components/file/SharedFolder'
import ItemDeletion from '@/components/folder/ItemDeletion'
import { Card, CardContent, Chip } from '@heroui/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { LuCalendar, LuFileQuestion, LuFolder } from 'react-icons/lu'

interface PageProps {
  params: Promise<{ shareToken: string }>
}

export const metadata: Metadata = {
  title: 'Shared Folder',
  description: 'A private folder shared via Docuflash.',
  robots: {
    index: false,
    follow: false,
  },
}

const Page = async ({ params }: PageProps) => {
  const searchParams = await params
  const shareToken = searchParams.shareToken

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

  return (
    <div className="min-h-screen bg-[var(--brand-50)]">
      <div className="max-w-[720px] mx-auto pt-[72px] pb-10 px-4">
        <div className="flex flex-col gap-6">
          <div className="flex flex-row gap-4 items-start">
            <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
              <LuFolder className="text-primary-500 w-8 h-8" />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="flex flex-row items-start justify-between gap-4">
                <h2 className="text-xl font-serif text-[var(--ink-900)] break-words leading-tight">{folder.folderName}</h2>
                <ItemDeletion folder={folder} />
              </div>
              <div className="flex flex-row gap-2 flex-wrap items-center mt-1">
                <Chip size="sm" variant="secondary" className="font-medium px-2">
                  {folder.files.length} Files
                </Chip>
                <div className="flex flex-row items-center gap-1">
                  <LuCalendar className="w-3 h-3 text-[var(--ink-600)]" />
                  <span className="text-xs text-[var(--ink-600)] font-medium">{formatDate(folder.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
          <Card className="w-full border-none shadow-[0_4px_40px_rgba(15,28,46,0.07)]">
            <CardContent className="p-8 flex flex-col gap-5">
              <h2 className="text-xl font-serif text-[var(--ink-900)]">Files in this folder</h2>
              <SharedFolder folder={folder} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Page
