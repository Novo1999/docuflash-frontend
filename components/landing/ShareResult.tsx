'use client'

import { isEmailShareConfigured } from '@/app/constants/email'
import useFileUploadQR from '@/app/hooks/useFileUploadQR'
import { markAsCopied } from '@/app/utils/sessionStorage'
import ShareToEmailModal, { type ShareEmailTarget } from '@/components/share/ShareToEmailModal'
import { FileAccessType, type UploadedShareLink } from '@/types/file'
import { cn } from '@heroui/styles'
import { useState } from 'react'
import { Button } from 'react-aria-components'
import { LuCheck, LuCopy, LuDownload, LuFile, LuFolder, LuLink, LuMail, LuQrCode, LuShare2 } from 'react-icons/lu'
import QRCode from 'react-qr-code'

const PRIMARY_BUTTON_CLASS = 'bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl text-base font-medium h-12 hover:bg-[var(--ink-800)] font-sans'

interface ShareResultProps {
  shareLinks: UploadedShareLink[]
  onReset: () => void
}

const ShareResult = ({ shareLinks, onReset }: ShareResultProps) => {
  const [activeTab, setActiveTab] = useState<'link' | 'qr'>('link')
  const [copied, setCopied] = useState(false)
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null)
  const [emailOpen, setEmailOpen] = useState(false)

  const primaryShareLink = shareLinks[0]
  const isBulkResult = shareLinks.length > 1
  const isProtectedResult = primaryShareLink?.accessType === 'protected'
  const { handleQrDownload } = useFileUploadQR({ fileName: primaryShareLink?.fileName })

  const emailTarget: ShareEmailTarget | null = primaryShareLink
    ? {
        name: primaryShareLink.fileName,
        link: primaryShareLink.link,
        resourceType: primaryShareLink.kind === 'folder' ? 'folder' : 'file',
        isProtected: primaryShareLink.accessType === FileAccessType.PROTECTED,
      }
    : null

  const handleCopy = (linkItem?: UploadedShareLink) => {
    const linksToCopy = linkItem ? [linkItem] : shareLinks
    navigator.clipboard.writeText(linksToCopy.map(({ link }) => link).join('\n'))
    linksToCopy.forEach(({ shareToken }) => markAsCopied(shareToken))

    setCopiedLinkId(linkItem?.shareToken ?? 'all')
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
      setCopiedLinkId(null)
    }, 2000)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-14 h-14 bg-[var(--brand-alpha-12)] rounded-full flex items-center justify-center mx-auto">
            {primaryShareLink?.kind === 'folder' ? <LuFolder className="w-6 h-6 text-[var(--brand-400)]" /> : <LuShare2 className="w-6 h-6 text-[var(--brand-400)]" />}
          </div>
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-surface">
            <LuCheck className="w-3.5 h-3.5" />
          </span>
        </div>
        <p className="text-xl font-serif text-[var(--ink-900)]">
          {primaryShareLink?.kind === 'folder' ? 'Your folder is ready to share' : isBulkResult ? 'Your folder is ready to share' : 'Your file is ready to share'}
        </p>
        <p className="text-sm text-[var(--ink-600)] font-sans text-center">
          {primaryShareLink?.kind === 'folder'
            ? isProtectedResult
              ? 'Share this link and password so others can unlock the folder.'
              : 'Anyone with this link can view the files in the folder.'
            : isBulkResult
              ? `${shareLinks.length} files uploaded. Copy individual links or the full folder list.`
              : isProtectedResult
                ? 'Share this link and password so others can unlock the file.'
                : "Anyone with this link can download the file. We don't track who."}
        </p>
      </div>

      {isBulkResult ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-line bg-[var(--brand-alpha-4)] overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-line bg-ink-900/[0.03]">
              <div className="w-9 h-9 rounded-lg bg-[var(--brand-alpha-12)] flex items-center justify-center shrink-0">
                <LuFolder className="w-5 h-5 text-[var(--brand-400)]" />
              </div>
              <div className="flex flex-col min-w-0 flex-1 text-left">
                <span className="text-sm font-medium text-[var(--ink-900)] font-sans">{shareLinks.length} files uploaded</span>
                <span className="text-xs text-[var(--ink-600)] font-sans">Each file has its own share link</span>
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto">
              {shareLinks.map((linkItem) => (
                <div key={linkItem.shareToken} className="flex items-center gap-3 px-4 py-3 border-b border-line last:border-b-0">
                  <LuFile className="w-4 h-4 text-[var(--ink-600)] shrink-0" />
                  <div className="flex flex-col min-w-0 flex-1 text-left">
                    <span className="text-sm font-medium text-[var(--ink-900)] font-sans truncate">{linkItem.fileName}</span>
                    <span className="text-xs text-[var(--ink-600)] font-sans truncate">{linkItem.link}</span>
                  </div>
                  <button
                    type="button"
                    aria-label={`Copy ${linkItem.fileName} link`}
                    onClick={() => handleCopy(linkItem)}
                    className={cn('shrink-0 p-1.5 rounded-md transition-colors hover:bg-ink-900/[0.06]', copiedLinkId === linkItem.shareToken ? 'text-[var(--brand-400)]' : 'text-[var(--ink-600)]')}
                  >
                    <LuCopy className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Button onPress={() => handleCopy()} className={cn(PRIMARY_BUTTON_CLASS, 'w-full')}>
            {copied && copiedLinkId === 'all' ? 'Links copied to clipboard' : 'Copy all links'}
          </Button>
        </div>
      ) : (
        <>
          {/* Tab segmented control */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[var(--brand-alpha-4)] border border-line">
            {[
              { val: 'link', label: 'Link', Icon: LuLink },
              { val: 'qr', label: 'QR Code', Icon: LuQrCode },
            ].map(({ val, label, Icon }) => {
              const selected = activeTab === val
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setActiveTab(val as 'link' | 'qr')}
                  className={cn(
                    'flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium font-sans transition-all',
                    selected ? 'bg-surface shadow-[0_1px_3px_rgba(15,28,46,0.08)] border border-line text-[var(--ink-900)]' : 'border border-transparent text-[var(--ink-600)] hover:bg-ink-900/[0.04]',
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              )
            })}
          </div>

          {/* Link tab */}
          <div className={cn(activeTab === 'link' ? 'flex flex-col gap-4' : 'hidden')}>
            <div className="flex items-center justify-between gap-3 bg-[var(--brand-alpha-4)] border border-line rounded-xl px-4 py-3">
              <span className="text-sm text-[var(--ink-900)] font-sans overflow-hidden text-ellipsis whitespace-nowrap flex-1 text-left">{primaryShareLink?.link}</span>
              <button
                type="button"
                aria-label="Copy link"
                onClick={() => handleCopy(primaryShareLink)}
                className={cn('shrink-0 p-1.5 rounded-md transition-colors hover:bg-ink-900/[0.06]', copied ? 'text-[var(--brand-400)]' : 'text-[var(--ink-600)]')}
              >
                <LuCopy className="w-4 h-4" />
              </button>
            </div>

            <Button onPress={() => handleCopy(primaryShareLink)} className={cn(PRIMARY_BUTTON_CLASS, 'w-full')}>
              {copied ? 'Link copied to clipboard' : 'Copy link'}
            </Button>
          </div>

          {/* QR tab */}
          <div className={activeTab === 'qr' ? 'flex flex-col items-center gap-4' : 'hidden'}>
            <div className="p-4 bg-white rounded-2xl border border-black/[0.06] shadow-[0_2px_12px_rgba(15,28,46,0.06)]">
              <QRCode id="share-qr-code" value={primaryShareLink?.link ?? ''} size={240} level="M" bgColor="#ffffff" fgColor="#0f1c2e" />
            </div>

            <Button onPress={handleQrDownload} className={cn(PRIMARY_BUTTON_CLASS, 'w-full flex items-center justify-center gap-2')}>
              <LuDownload className="w-4 h-4" />
              Download QR
            </Button>
          </div>
        </>
      )}

      {isEmailShareConfigured && primaryShareLink ? (
        <Button onPress={() => setEmailOpen(true)} className="w-full rounded-xl text-base font-medium h-12 font-sans flex items-center justify-center gap-2 border border-line text-[var(--ink-900)] hover:bg-ink-900/[0.04]">
          <LuMail className="w-4 h-4" />
          Share via email
        </Button>
      ) : null}

      <Button onPress={onReset} className="w-full text-[var(--ink-600)] text-sm hover:text-[var(--ink-900)] hover:bg-ink-900/[0.06] rounded-xl h-12 font-sans">
        {primaryShareLink?.kind === 'folder' ? 'Upload another folder' : isBulkResult ? 'Upload another folder' : 'Upload another file'}
      </Button>

      <ShareToEmailModal isOpen={emailOpen} onOpenChange={setEmailOpen} target={emailTarget} />
    </div>
  )
}

export default ShareResult
