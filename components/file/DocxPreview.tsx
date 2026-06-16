'use client'

import EmptyPreview from '@/components/file/EmptyPreview'
import HtmlPreview from '@/components/file/HtmlPreview'
import { Spinner } from '@heroui/react'
import mammoth from 'mammoth'
import { useEffect, useState } from 'react'

const DocxPreview = ({ url }: { url: string }) => {
  const [html, setHtml] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const getDocxPreview = async () => {
      try {
        const response = await fetch(url)
        const arrayBuffer = await response.arrayBuffer()
        const { value } = await mammoth.convertToHtml({ arrayBuffer })
        setHtml(value)
      } catch {
        setError(true)
      }
    }
    getDocxPreview()
  }, [url])

  if (error) return <EmptyPreview copy="Failed to load document preview." />
  if (!html)
    return (
      <div className="flex items-center justify-center gap-3 rounded-xl border border-line bg-surface px-4 py-8 text-sm text-[var(--ink-600)] font-sans">
        <Spinner className="text-[var(--ink-900)]" />
        Preparing document preview
      </div>
    )

  return <HtmlPreview html={html} />
}

export default DocxPreview
