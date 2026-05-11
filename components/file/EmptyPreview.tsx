const EmptyPreview = ({ copy }: { copy: string }) => {
  return <div className="rounded-xl border border-black/[0.06] bg-white px-4 py-8 text-center text-sm text-[var(--ink-600)] font-sans">{copy}</div>
}

export default EmptyPreview
