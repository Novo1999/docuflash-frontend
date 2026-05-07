import { LuArrowRight, LuLink2, LuSend, LuCloudUpload } from 'react-icons/lu'

const STEPS = [
  { step: '01', label: 'Upload', desc: 'Drop or pick a file from your device.', Icon: LuCloudUpload },
  { step: '02', label: 'Get link', desc: 'A unique, encrypted URL is generated.', Icon: LuLink2 },
  { step: '03', label: 'Share', desc: 'Send anywhere — link expires when you say.', Icon: LuSend },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full pt-10 mt-4 scroll-mt-24 border-t border-[var(--border-soft)]">
      <div className="flex flex-col items-center gap-2 mb-8">
        <span className="text-[11px] tracking-[0.18em] uppercase font-medium text-[var(--brand-400)] font-sans">
          How it works
        </span>
        <h2 className="text-2xl md:text-3xl font-serif text-[var(--ink-900)]">From file to shareable link in three steps</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-3 md:gap-2 items-stretch">
        {STEPS.map(({ step, label, desc, Icon }, i) => (
          <div key={step} className="contents">
            <div className="flex flex-col items-center gap-3 px-4 py-6 rounded-2xl bg-[var(--surface)]/60 border border-[var(--border-soft)] text-center">
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-[var(--brand-alpha-12)] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[var(--brand-400)]" />
                </div>
                <span className="absolute -top-1.5 -right-1.5 text-[10px] font-medium tabular-nums tracking-wider text-[var(--brand-400)] bg-[var(--surface)] border border-[var(--brand-alpha-30)] rounded-full px-1.5 py-0.5">
                  {step}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-[var(--ink-900)] font-sans">{label}</span>
                <span className="text-xs text-[var(--ink-600)] font-sans leading-relaxed">{desc}</span>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className="hidden md:flex items-center justify-center text-[var(--ink-400)]/40">
                <LuArrowRight className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
