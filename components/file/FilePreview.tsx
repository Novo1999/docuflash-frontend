'use client'
import { DocxPreview } from '@/components/file/DocxPreview'
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

export default function FilePreview({ fileName, preview }: FilePreviewProps) {
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

function TextPreview({ text }: { text: string }) {
  if (!text) {
    return <EmptyPreview copy="This text preview is empty." />
  }

  return (
    <pre className="max-h-[560px] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-black/[0.06] bg-white px-4 py-3 text-sm leading-6 text-[var(--ink-900)] font-sans">{text}</pre>
  )
}

export function HtmlPreview({ html }: { html: string }) {
  if (!html) {
    return <EmptyPreview copy="This document preview is empty." />
  }

  return (
    <div className="max-h-[640px] overflow-auto rounded-xl border border-black/[0.06] bg-white px-5 py-4 font-sans text-sm leading-7 text-[var(--ink-900)]">
      <div
        className="pointer-events-none [&_*]:max-w-full [&_a]:text-[var(--ink-900)] [&_blockquote]:border-l-2 [&_blockquote]:border-black/10 [&_blockquote]:pl-3 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-black/10 [&_td]:p-2 [&_th]:border [&_th]:border-black/10 [&_th]:p-2 [&_ul]:list-disc [&_ul]:pl-5"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

export function EmptyPreview({ copy }: { copy: string }) {
  return <div className="rounded-xl border border-black/[0.06] bg-white px-4 py-8 text-center text-sm text-[var(--ink-600)] font-sans">{copy}</div>
}
