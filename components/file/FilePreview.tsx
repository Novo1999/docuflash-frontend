import PreviewLoader from '@/components/shared/PreviewLoader'
import { type FilePreviewResponse } from '@/types/file'
import { Card, CardContent } from '@heroui/react'
import dynamic from 'next/dynamic'

const PdfPreview = dynamic(() => import('@/components/file/PdfPreview'), {
  ssr: false,
  loading: () => <PreviewLoader label="Preparing PDF preview" />,
})

const DocxPreview = dynamic(() => import('@/components/file/DocxPreview'), {
  ssr: false,
  loading: () => <PreviewLoader label="Preparing document preview" />,
})

const TextPreview = dynamic(() => import('@/components/file/TextPreview'), {
  loading: () => <PreviewLoader />,
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
