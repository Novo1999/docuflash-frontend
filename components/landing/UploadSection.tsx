import { SUPPORTED_UPLOAD_FORMATS } from '@/app/constants/upload'
import UploadForm from '@/components/landing/UploadForm'
import UploadSectionContainer from '@/components/landing/UploadSectionContainer'
import { Spinner } from '@heroui/react'
import { Suspense } from 'react'
import { LuShield } from 'react-icons/lu'

const UploadSection = () => {
  return (
    <UploadSectionContainer>
      <Suspense
        fallback={
          <div className="flex items-center gap-4 h-[120px] justify-center">
            <Spinner className="text-ink-900" />
          </div>
        }
      >
        <UploadForm
          formatBadges={
            <>
              {SUPPORTED_UPLOAD_FORMATS.map((label) => (
                <span key={label} className="text-[10px] font-medium tracking-[0.06em] uppercase px-2 py-1 rounded-md bg-ink-900/[0.04] text-[var(--ink-600)] border border-line font-sans">
                  {label}
                </span>
              ))}
            </>
          }
          footer={
            <div className="flex items-center justify-center gap-1.5 text-center">
              <LuShield className="w-3 h-3 shrink-0 text-[var(--ink-600)]" />
              <span className="text-xs text-[var(--ink-600)] font-sans">End-to-end encrypted • Auto-deletes on expiry</span>
            </div>
          }
        />
      </Suspense>
    </UploadSectionContainer>
  )
}

export default UploadSection
