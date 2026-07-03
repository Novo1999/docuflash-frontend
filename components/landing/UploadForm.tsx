'use client'

import type { UploadedShareLink } from '@/types/file'
import { type ReactNode, useState } from 'react'
import ShareResult from './ShareResult'
import UploadFormFields from './UploadFormFields'

interface UploadFormProps {
  formatBadges: ReactNode
  footer: ReactNode
}

const UploadForm = ({ formatBadges, footer }: UploadFormProps) => {
  const [shareLinks, setShareLinks] = useState<UploadedShareLink[] | null>(null)

  const handleReset = () => setShareLinks(null)

  return shareLinks ? (
    <ShareResult shareLinks={shareLinks} onReset={handleReset} />
  ) : (
    <UploadFormFields formatBadges={formatBadges} footer={footer} onUploadSuccess={(links) => links.length > 0 && setShareLinks(links)} />
  )
}

export default UploadForm
