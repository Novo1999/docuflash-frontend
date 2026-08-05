'use client'

import type { UploadedShareLink } from '@/types/file'
import { useState } from 'react'
import ShareResult from './ShareResult'
import UploadFormFields from './UploadFormFields'

const UploadForm = () => {
  const [shareLinks, setShareLinks] = useState<UploadedShareLink[] | null>(null)

  const handleReset = () => setShareLinks(null)

  return shareLinks ? (
    <ShareResult shareLinks={shareLinks} onReset={handleReset} />
  ) : (
    <UploadFormFields onUploadSuccess={(links) => links.length > 0 && setShareLinks(links)} />
  )
}

export default UploadForm
