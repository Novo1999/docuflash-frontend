import { ThemeProvider } from '@/components/shared/ThemeProvider'
import type { Metadata } from 'next'
import { DM_Sans, Instrument_Serif } from 'next/font/google'
import './globals.css'

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'Docuflash — Share documents instantly',
    template: '%s · Docuflash',
  },
  description: 'Upload a PDF, Word doc, Excel sheet, or ZIP and share it via a private, expiring link. No account required.',
  applicationName: 'Docuflash',
  keywords: ['file share', 'document share', 'PDF link', 'expiring link', 'secure file transfer'],
  openGraph: {
    title: 'Docuflash — Share documents instantly',
    description: 'Upload a document, get a shareable link in seconds. Private by default.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${dmSans.variable} h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--page)] text-[var(--ink-900)] font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
