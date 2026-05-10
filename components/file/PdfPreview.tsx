'use client'

import { Button, Spinner } from '@heroui/react'
import { useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

const PDF_PAGE_BATCH_SIZE = 5
const MAX_PDF_PAGE_WIDTH = 640
const MIN_PDF_PAGE_WIDTH = 280

interface PdfPreviewProps {
  url: string
}

export default function PdfPreview({ url }: PdfPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState(MAX_PDF_PAGE_WIDTH)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [visiblePages, setVisiblePages] = useState(PDF_PAGE_BATCH_SIZE)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const updateWidth = () => {
      const nextWidth = Math.floor(element.getBoundingClientRect().width)
      setContainerWidth(Math.min(MAX_PDF_PAGE_WIDTH, Math.max(MIN_PDF_PAGE_WIDTH, nextWidth)))
    }

    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const pageCount = numPages ? Math.min(visiblePages, numPages) : 0
  const hasMorePages = !!numPages && visiblePages < numPages

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <Document
        file={url}
        loading={<PreviewLoading />}
        error={<PreviewUnavailable />}
        onLoadSuccess={({ numPages }) => {
          setNumPages(numPages)
          setVisiblePages(Math.min(PDF_PAGE_BATCH_SIZE, numPages))
        }}
      >
        {pageCount > 0 && (
          <div className="flex flex-col items-center gap-4">
            {Array.from({ length: pageCount }, (_, index) => (
              <div key={index + 1} className="overflow-hidden rounded-xl border border-black/[0.08] bg-white shadow-[0_2px_12px_rgba(15,28,46,0.06)]">
                <Page pageNumber={index + 1} width={containerWidth} renderAnnotationLayer={false} />
              </div>
            ))}
          </div>
        )}
      </Document>

      {hasMorePages && (
        <Button
          variant="secondary"
          onPress={() => setVisiblePages((current) => Math.min(current + PDF_PAGE_BATCH_SIZE, numPages ?? current))}
          className="mt-4 w-full rounded-xl font-sans"
        >
          Load more pages
        </Button>
      )}
    </div>
  )
}

function PreviewLoading() {
  return (
    <div className="flex items-center justify-center gap-3 rounded-xl border border-black/[0.06] bg-white px-4 py-8 text-sm text-[var(--ink-600)] font-sans">
      <Spinner className="text-[var(--ink-900)]" />
      Preparing PDF preview
    </div>
  )
}

function PreviewUnavailable() {
  return (
    <div className="rounded-xl border border-red-500/15 bg-red-500/[0.04] px-4 py-3 text-sm text-red-600 font-sans">
      Preview is unavailable for this file. You can still download it.
    </div>
  )
}
