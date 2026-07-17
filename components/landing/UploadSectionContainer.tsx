import { Card } from '@heroui/react'
import { ReactNode } from 'react'
import { LuSparkles } from 'react-icons/lu'

const UploadSectionContainer = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-alpha-12)] border border-[var(--brand-alpha-30)] text-[11px] font-medium tracking-wide text-[var(--brand-400)] font-sans">
          <LuSparkles className="w-3 h-3" />
          Free
        </span>
      </div>
      <h1 className="text-4xl md:text-[52px] leading-[1.05] text-foreground font-serif tracking-tight">
        Share any document <em className="text-[var(--brand-400)] italic">instantly</em>. No signup required.
      </h1>

      <p className="text-default-500 text-center font-sans text-[15px] max-w-[520px] mx-auto leading-relaxed">
        Upload a PDF, Word doc, Excel sheet, ZIP archive, or TXT file and get a shareable link in seconds. Set an expiry, lock it with a password - no account needed.
      </p>

      <Card className="w-full bg-surface border border-line rounded-2xl p-7 md:p-8 shadow-[0_4px_40px_rgba(15,28,46,0.07)] mt-2 font-sans">
        {children}
      </Card>
    </>
  )
}
export default UploadSectionContainer
