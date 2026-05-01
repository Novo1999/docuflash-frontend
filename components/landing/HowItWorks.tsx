'use client'

export default function HowItWorks() {
  return (
    <div className="flex justify-center w-full border-t border-black/5 pt-8 mt-2 items-start">
      {[
        { step: '01', label: 'Upload', desc: 'Drop your file into the box' },
        { step: '02', label: 'Get link', desc: 'Receive a unique shareable URL' },
        { step: '03', label: 'Share', desc: 'Send the link to anyone' },
      ].map((s, i) => (
        <div key={s.step} className="flex flex-1 items-start gap-0">
          <div className="flex flex-col gap-1 text-center flex-1 px-2">
            <span className="text-xs font-medium text-[var(--brand-400)] tracking-widest font-[var(--font-dm-sans)]">
              {s.step}
            </span>
            <span className="text-sm font-medium text-[var(--ink-900)] font-[var(--font-dm-sans)]">
              {s.label}
            </span>
            <span className="text-xs text-[var(--ink-600)] font-[var(--font-dm-sans)]">
              {s.desc}
            </span>
          </div>
          {i < 2 && (
            <span className="text-black/20 text-lg mt-2">→</span>
          )}
        </div>
      ))}
    </div>
  )
}
