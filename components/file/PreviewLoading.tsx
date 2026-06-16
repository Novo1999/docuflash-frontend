import { Spinner } from '@heroui/react'

const PreviewLoading = () => {
  return (
    <div className="flex items-center justify-center gap-3 rounded-xl border border-line bg-surface px-4 py-8 text-sm text-[var(--ink-600)] font-sans">
      <Spinner className="text-[var(--ink-900)]" />
      Preparing PDF preview
    </div>
  )
}

export default PreviewLoading
