export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-[var(--brand-50)] px-6 py-8 flex items-center justify-center">
      <span className="text-sm text-[var(--ink-600)] font-sans">
        © {new Date().getFullYear()} Docuflash Inc. All rights reserved.
      </span>
    </footer>
  )
}
