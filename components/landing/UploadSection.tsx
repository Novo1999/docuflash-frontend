import { SUPPORTED_UPLOAD_FORMATS } from '@/app/constants/upload'
import UploadForm from '@/components/landing/UploadForm'
import UploadSectionContainer from '@/components/landing/UploadSectionContainer'
import { LuShield } from 'react-icons/lu'

const UploadSection = () => {
  return (
    <UploadSectionContainer>
      <UploadForm
        formatBadges={
          <>
            {SUPPORTED_UPLOAD_FORMATS.map((label) => (
              <span
                key={label}
                className="text-[10px] font-medium tracking-[0.06em] uppercase px-2 py-1 rounded-md bg-black/[0.03] text-[var(--ink-600)] border border-black/[0.05] font-sans"
              >
                {label}
              </span>
            ))}
          </>
        }
        footer={
          <div className="flex items-center justify-center gap-1.5">
            <LuShield className="w-3 h-3 text-[var(--ink-600)]" />
            <span className="text-xs text-[var(--ink-600)] font-sans">End-to-end encrypted • Auto-deletes on expiry</span>
          </div>
        }
      />
    </UploadSectionContainer>
  )
}

export default UploadSection
