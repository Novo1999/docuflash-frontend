import EmptyPreview from '@/components/file/EmptyPreview'

const TextPreview = ({ text }: { text: string }) => {
  if (!text) {
    return <EmptyPreview copy="This text preview is empty." />
  }

  return (
    <pre className="max-h-[600px] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-line bg-surface px-4 py-3 text-sm leading-6 text-[var(--ink-900)] font-sans scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">{text}</pre>
  )
}

export default TextPreview
