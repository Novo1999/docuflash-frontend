import { EmptyPreview, HtmlPreview } from "@/components/file/FilePreview"
import { Spinner } from "@heroui/react"
import mammoth from "mammoth"
import { useEffect, useState } from "react"

export const DocxPreview = ({ url }: { url: string }) => {
  const [html, setHtml] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(url)
      .then((r) => r.arrayBuffer())
      .then((buf) => mammoth.convertToHtml({ arrayBuffer: buf }))
      .then(({ value }) => setHtml(value))
      .catch(() => setError(true))
  }, [url])

  if (error) return <EmptyPreview copy="Failed to load document preview." />
  if (!html)
    return (
      <div className="flex items-center justify-center gap-3 rounded-xl border border-black/[0.06] bg-white px-4 py-8 text-sm text-[var(--ink-600)] font-sans">
        <Spinner className="text-[var(--ink-900)]" />
        Preparing document preview
      </div>
    )

  return <HtmlPreview html={html} />
}
