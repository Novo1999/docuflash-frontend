const HowItWorks = () => {
  return (
    <section id="how-it-works" className="w-full border-t border-line pt-8 mt-2 scroll-mt-24">
      <h2 className="text-xl font-serif text-foreground mb-5">How It Works</h2>
      <div className="flex justify-center w-full items-start">
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
              <span className="text-ink-900/25 text-lg mt-2">-&gt;</span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default HowItWorks
