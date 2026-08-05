import UploadForm from '@/components/landing/UploadForm'
import UploadSectionContainer from '@/components/landing/UploadSectionContainer'
import { Spinner } from '@heroui/react'
import { Suspense } from 'react'

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
        <UploadForm />
      </Suspense>
    </UploadSectionContainer>
  )
}

export default UploadSection
