import MyUploads from '@/components/me/MyUploads'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Uploads · Docuflash',
  description: 'View and manage the files and folders you have uploaded.',
}

const MyUploadsPage = () => <MyUploads />

export default MyUploadsPage
