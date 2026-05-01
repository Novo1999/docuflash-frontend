import { getFileByShareToken } from '@/app/lib/api/files'
import SharedFilePage from '@/app/share/[shareToken]/SharedFilePage'

interface PageProps {
  params: Promise<{ shareToken: string }>
}

export default async function Page({ params }: PageProps) {
  const shareToken = (await params).shareToken
  const file = await getFileByShareToken(shareToken)

  return <SharedFilePage file={file} />
}
