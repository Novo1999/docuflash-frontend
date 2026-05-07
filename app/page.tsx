import Footer from '@/components/landing/Footer'
import HowItWorks from '@/components/landing/HowItWorks'
import Navbar from '@/components/landing/Navbar'
import { RecentUploads } from '@/components/landing/RecentUploads'
import { UploadSection } from '@/components/landing/UploadSection'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--page)]">
      <Navbar />

      <div className="max-w-[680px] mx-auto pt-16 md:pt-[72px] pb-16 px-4 text-center">
        <div className="flex flex-col gap-5">
          <UploadSection />
          <RecentUploads />
          <HowItWorks />
        </div>
      </div>

      <Footer />
    </div>
  )
}
