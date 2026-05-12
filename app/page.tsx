import type { Metadata } from 'next'
import Footer from '@/components/landing/Footer'
import HowItWorks from '@/components/landing/HowItWorks'
import Navbar from '@/components/landing/Navbar'
import RecentUploads from '@/components/landing/RecentUploads'
import UploadSection from '@/components/landing/UploadSection'
import { JsonLd } from '@/components/shared/JsonLd'

export const metadata: Metadata = {
  title: 'Instant File Sharing - Upload & Share in Seconds',
  description:
    'Docuflash lets you share PDFs, Word docs, spreadsheets and more with a single link. No registration, no hassle. Files auto-expire for your privacy.',
  alternates: {
    canonical: 'https://docuflash-frontend.vercel.app',
  },
}

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[var(--brand-50,#f9fafb)]">
      <Navbar />

      <main className="max-w-[680px] mx-auto pt-[72px] pb-[64px] px-4 text-center">
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Docuflash',
            url: 'https://docuflash-frontend.vercel.app',
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Web',
            description:
              'Share files instantly with a secure link. Upload PDFs, Word docs, Excel sheets, ZIPs and more - no account needed.',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            featureList: [
              'No signup required',
              'Password-protected sharing',
              'Auto-expiring links',
              'Supports PDF, DOCX, XLSX, ZIP, TXT',
            ],
          }}
        />
        <div className="flex flex-col gap-5">
          <UploadSection />
          <RecentUploads />
          <HowItWorks />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default LandingPage
