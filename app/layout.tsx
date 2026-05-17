import type { Metadata } from 'next'
import { DM_Sans, Instrument_Serif } from 'next/font/google'
import './globals.css'

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://docuflash-frontend.vercel.app'),
  title: {
    default: 'Docuflash - Instant File Sharing, No Signup',
    template: '%s | Docuflash',
  },
  description:
    'Share files instantly with a secure link. Upload PDFs, Word docs, Excel sheets, ZIPs and more - no account needed. Free up to 16MB.',
  keywords: [
    'file sharing',
    'instant file share',
    'share PDF online',
    'no signup file upload',
    'temporary file link',
    'secure file sharing',
    'send files without account',
  ],
  authors: [{ name: 'Docuflash' }],
  creator: 'Docuflash',
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://docuflash-frontend.vercel.app',
    siteName: 'Docuflash',
    title: 'Docuflash - Instant File Sharing, No Signup',
    description: 'Upload any file and get a shareable link in seconds. No account needed.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Docuflash - Share files instantly',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Docuflash - Instant File Sharing, No Signup',
    description: 'Upload any file and get a shareable link in seconds. No account needed.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${dmSans.variable} h-full antialiased scroll-smooth`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}

export default RootLayout
