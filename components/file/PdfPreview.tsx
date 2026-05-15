'use client'

import PreviewLoading from '@/components/file/PreviewLoading'
import PreviewUnavailable from '@/components/file/PreviewUnavailable'
import { Button } from '@heroui/react'
import { useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

const PDF_PAGE_BATCH_SIZE = 5
const MAX_PDF_PAGE_WIDTH = 640
const MIN_PDF_PAGE_WIDTH = 280

interface PdfPreviewProps {
  url: string
}

const PdfPreview = ({ url }: PdfPreviewProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState(MAX_PDF_PAGE_WIDTH)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [visiblePages, setVisiblePages] = useState(PDF_PAGE_BATCH_SIZE)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const updateWidth = () => {
      const nextWidth = Math.floor(element.clientWidth)
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
    <div className="flex flex-col gap-4">
      <div
        ref={containerRef}
        className="max-h-[600px] overflow-y-auto rounded-xl border border-black/[0.06] bg-slate-50/50 p-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
      >
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
                <div
                  key={index + 1}
                  className="overflow-hidden rounded-xl border border-black/[0.08] bg-white shadow-[0_2px_12px_rgba(15,28,46,0.06)]"
                >
                  <Page pageNumber={index + 1} width={containerWidth} renderAnnotationLayer={false} />
                </div>
              ))}
            </div>
          )}
        </Document>
      </div>

      {hasMorePages && (
        <Button
          variant="secondary"
          onPress={() => setVisiblePages((current) => Math.min(current + PDF_PAGE_BATCH_SIZE, numPages ?? current))}
          className="w-full rounded-xl font-sans"
        >
          Load more pages
        </Button>
      )}
    </div>
  )
}

export default PdfPreview
