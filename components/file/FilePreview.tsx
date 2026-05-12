import DocxPreview from '@/components/file/DocxPreview'
import TextPreview from '@/components/file/TextPreview'
import { type FilePreviewResponse } from '@/types/file'
import { Card, CardContent, Spinner } from '@heroui/react'
import dynamic from 'next/dynamic'

const PdfPreview = dynamic(() => import('@/components/file/PdfPreview'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center gap-3 rounded-xl border border-black/[0.06] bg-white px-4 py-8 text-sm text-[var(--ink-600)] font-sans">
      <Spinner className="text-[var(--ink-900)]" />
      Preparing PDF preview
    </div>
  ),
})

interface FilePreviewProps {
  fileName: string
  preview: FilePreviewResponse
}

const FilePreview = ({ fileName, preview }: FilePreviewProps) => {
  return (
    <Card className="w-full border-none shadow-[0_4px_40px_rgba(15,28,46,0.07)]">
      <CardContent className="p-6 md:p-8 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-serif text-[var(--ink-900)]">Preview</h2>
          <p className="text-sm text-[var(--ink-600)] font-sans break-words">{fileName}</p>
        </div>

        {preview.kind === 'pdf' && <PdfPreview key={preview.url} url={preview.url} />}
        {preview.kind === 'text' && <TextPreview text={preview.text} />}
        {preview.kind === 'docx_url' && <DocxPreview url={preview.url} />}
      </CardContent>
    </Card>
  )
}

export default FilePreview
