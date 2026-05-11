import EmptyPreview from '@/components/file/EmptyPreview'

const TextPreview = ({ text }: { text: string }) => {
  if (!text) {
    return <EmptyPreview copy="This text preview is empty." />
  }

  return (
    <pre className="max-h-[560px] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-black/[0.06] bg-white px-4 py-3 text-sm leading-6 text-[var(--ink-900)] font-sans">{text}</pre>
  )
}

export default TextPreview
