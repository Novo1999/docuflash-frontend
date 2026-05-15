import EmptyPreview from '@/components/file/EmptyPreview'

const HtmlPreview = ({ html }: { html: string }) => {
  if (!html) {
    return <EmptyPreview copy="This document preview is empty." />
  }

  return (
    <div className="max-h-[600px] overflow-auto rounded-xl border border-black/[0.06] bg-white px-5 py-4 font-sans text-sm leading-7 text-[var(--ink-900)] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
      <div
        className="pointer-events-none [&_*]:max-w-full [&_a]:text-[var(--ink-900)] [&_blockquote]:border-l-2 [&_blockquote]:border-black/10 [&_blockquote]:pl-3 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-black/10 [&_td]:p-2 [&_th]:border [&_th]:border-black/10 [&_th]:p-2 [&_ul]:list-disc [&_ul]:pl-5"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

export default HtmlPreview
