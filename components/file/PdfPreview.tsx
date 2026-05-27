'use client'

import PreviewLoading from '@/components/file/PreviewLoading'
import PreviewUnavailable from '@/components/file/PreviewUnavailable'
import { Button } from '@heroui/react'
import { useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

const PDF_PAGE_BATCH_SIZE = 5
const MAX_PDF_PAGE_WIDTH = 640
const MIN_PDF_PAGE_WIDTH = 280
const ZOOM_STEP = 0.25
const MIN_ZOOM = 0.5
const MAX_ZOOM = 3

interface PdfPreviewProps {
  url: string
}

const PdfPreview = ({ url }: PdfPreviewProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState(MAX_PDF_PAGE_WIDTH)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [visiblePages, setVisiblePages] = useState(PDF_PAGE_BATCH_SIZE)
  const [scale, setScale] = useState(1)

  const isPanning = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })
  const scrollPos = useRef({ left: 0, top: 0 })

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

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current
    if (!el) return
    isPanning.current = true
    startPos.current = { x: e.clientX, y: e.clientY }
    scrollPos.current = { left: el.scrollLeft, top: el.scrollTop }
    el.style.cursor = 'grabbing'
    el.style.userSelect = 'none'
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning.current || !containerRef.current) return
    const dx = e.clientX - startPos.current.x
    const dy = e.clientY - startPos.current.y
    containerRef.current.scrollLeft = scrollPos.current.left - dx
    containerRef.current.scrollTop = scrollPos.current.top - dy
  }

  const handleMouseUp = () => {
    isPanning.current = false
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab'
      containerRef.current.style.userSelect = ''
    }
  }
  const handleMouseDownOnPage = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (target.closest('a')) return // let link handle it
    handleMouseDown(e)
  }

  const pageCount = numPages ? Math.min(visiblePages, numPages) : 0
  const hasMorePages = !!numPages && visiblePages < numPages
  const scaledWidth = Math.round(containerWidth * scale)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 self-end">
        <Button
          variant="secondary"
          onPress={() => setScale((s) => Math.max(MIN_ZOOM, parseFloat((s - ZOOM_STEP).toFixed(2))))}
          isDisabled={scale <= MIN_ZOOM}
          className="rounded-lg px-3 font-sans text-sm"
        >
          −
        </Button>
        <span className="min-w-[48px] text-center text-sm text-slate-500">{Math.round(scale * 100)}%</span>
        <Button
          variant="secondary"
          onPress={() => setScale((s) => Math.min(MAX_ZOOM, parseFloat((s + ZOOM_STEP).toFixed(2))))}
          isDisabled={scale >= MAX_ZOOM}
          className="rounded-lg px-3 font-sans text-sm"
        >
          +
        </Button>
      </div>

      <div
        ref={containerRef}
        className="max-h-[600px] overflow-auto rounded-xl border border-black/[0.06] bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
        style={{ cursor: 'grab' }}
        onMouseDown={handleMouseDownOnPage}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="w-fit min-w-full p-4">
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
                    <Page
                      pageNumber={index + 1}
                      width={scaledWidth}
                      renderAnnotationLayer={true}
                    />
                  </div>
                ))}
              </div>
            )}
          </Document>
        </div>
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
