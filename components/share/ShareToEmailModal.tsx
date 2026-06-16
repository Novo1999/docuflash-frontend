'use client'

import { sendShareEmail } from '@/app/lib/email/shareEmail'
import { Button, Input, Modal } from '@heroui/react'
import { useState } from 'react'
import { LuCheck, LuFile, LuFolder, LuMail, LuX } from 'react-icons/lu'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_RECIPIENTS = 5

export type ShareEmailTarget = {
  name: string
  link: string
  resourceType: 'file' | 'folder'
  isProtected: boolean
}

type ShareToEmailModalProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  target: ShareEmailTarget | null
}

type SendStatus = 'idle' | 'sending' | 'success' | 'error'

const ShareToEmailModal = ({ isOpen, onOpenChange, target }: ShareToEmailModalProps) => {
  const [recipients, setRecipients] = useState<string[]>([])
  const [draft, setDraft] = useState('')
  const [senderName, setSenderName] = useState('')
  const [message, setMessage] = useState('')
  const [inputError, setInputError] = useState<string | null>(null)
  const [status, setStatus] = useState<SendStatus>('idle')
  const [sendError, setSendError] = useState<string | null>(null)

  const resetState = () => {
    setRecipients([])
    setDraft('')
    setSenderName('')
    setMessage('')
    setInputError(null)
    setStatus('idle')
    setSendError(null)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) resetState()
    onOpenChange(open)
  }

  const addRecipient = (raw: string) => {
    const email = raw.trim().replace(/,$/, '').toLowerCase()
    if (!email) return true
    if (!EMAIL_REGEX.test(email)) {
      setInputError(`"${email}" doesn't look like a valid email`)
      return false
    }
    if (!recipients.includes(email) && recipients.length >= MAX_RECIPIENTS) {
      setInputError(`You can send to up to ${MAX_RECIPIENTS} people at once`)
      return false
    }
    setRecipients((current) => (current.includes(email) ? current : [...current, email]))
    setInputError(null)
    return true
  }

  const handleDraftKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      if (addRecipient(draft)) setDraft('')
    } else if (event.key === 'Backspace' && !draft && recipients.length > 0) {
      setRecipients((current) => current.slice(0, -1))
    }
  }

  const removeRecipient = (email: string) => setRecipients((current) => current.filter((value) => value !== email))

  const handleSend = async () => {
    if (!target) return

    let finalRecipients = recipients
    const pending = draft.trim().replace(/,$/, '').toLowerCase()
    if (pending) {
      if (!EMAIL_REGEX.test(pending)) {
        setInputError(`"${pending}" doesn't look like a valid email`)
        return
      }
      if (!recipients.includes(pending) && recipients.length >= MAX_RECIPIENTS) {
        setInputError(`You can send to up to ${MAX_RECIPIENTS} people at once`)
        return
      }
      finalRecipients = recipients.includes(pending) ? recipients : [...recipients, pending]
      setRecipients(finalRecipients)
      setDraft('')
    }

    if (finalRecipients.length === 0) {
      setInputError('Add at least one recipient')
      return
    }

    setStatus('sending')
    setSendError(null)

    try {
      const results = await Promise.allSettled(
        finalRecipients.map((toEmail) =>
          sendShareEmail({
            toEmail,
            resourceName: target.name,
            resourceType: target.resourceType,
            shareLink: target.link,
            isProtected: target.isProtected,
            senderName,
            message,
          }),
        ),
      )

      const failed = results.filter((result) => result.status === 'rejected').length

      if (failed === finalRecipients.length) {
        setStatus('error')
        setSendError("We couldn't send the email. Please check your connection and try again.")
        return
      }

      setStatus('success')
      if (failed > 0) setSendError(`${failed} of ${finalRecipients.length} emails couldn't be sent.`)
    } catch {
      setStatus('error')
      setSendError("We couldn't send the email. Please check your connection and try again.")
    }
  }

  const isFolder = target?.resourceType === 'folder'
  const isSending = status === 'sending'
  const recipientCount = recipients.length + (draft.trim() ? 1 : 0)
  const atMax = recipients.length >= MAX_RECIPIENTS

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="bg-surface rounded-2xl p-6 sm:max-w-[440px] w-full font-sans">
          <Modal.CloseTrigger />

          {status === 'success' ? (
            <div className="flex flex-col items-center gap-3 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <LuCheck className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-lg font-serif text-ink-900">Email sent</p>
              <p className="text-sm text-ink-600 max-w-[300px]">
                We delivered the {isFolder ? 'folder' : 'file'} link to {recipients.length === 1 ? recipients[0] : `${recipients.length} recipients`}.
              </p>
              {sendError ? <p className="text-xs text-orange-500">{sendError}</p> : null}
              <Button onPress={() => handleOpenChange(false)} className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl font-medium px-6 h-11 mt-1">
                Done
              </Button>
            </div>
          ) : (
            <>
              <Modal.Header className="px-0 pt-0 pb-4">
                <div className="flex items-center gap-2">
                  <Modal.Icon className="bg-[var(--brand-alpha-12)] text-[var(--brand-400)]">
                    <LuMail className="size-5" />
                  </Modal.Icon>
                  <div>
                    <Modal.Heading className="text-xl font-serif text-ink-900">Share via email</Modal.Heading>
                    <p className="text-xs text-ink-600 mt-0.5">Send the download link straight to someone&apos;s inbox.</p>
                  </div>
                </div>
              </Modal.Header>

              <Modal.Body className="px-0 pb-0 flex flex-col gap-4">
                {/* What's being shared */}
                {target ? (
                  <div className="flex items-center gap-3 rounded-xl border border-line bg-[var(--brand-alpha-4)] px-3 py-2.5">
                    <div className="w-9 h-9 rounded-lg bg-primary/[0.08] flex items-center justify-center shrink-0">
                      {isFolder ? <LuFolder className="w-4 h-4 text-primary-400" /> : <LuFile className="w-4 h-4 text-primary-400" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-ink-900 truncate">{target.name}</span>
                      <span className="text-xs text-ink-600 truncate">{target.link}</span>
                    </div>
                  </div>
                ) : null}

                {/* Recipients */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-ink-900">
                    Send to <span className="text-ink-600 font-normal">({recipients.length}/{MAX_RECIPIENTS})</span>
                  </label>
                  {recipients.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {recipients.map((email) => (
                        <span key={email} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full bg-[var(--brand-alpha-12)] text-[var(--brand-400)] text-xs font-medium">
                          {email}
                          <button type="button" aria-label={`Remove ${email}`} onClick={() => removeRecipient(email)} className="p-0.5 rounded-full hover:bg-[var(--brand-alpha-30)]">
                            <LuX className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <Input
                    type="email"
                    value={draft}
                    disabled={atMax}
                    onChange={(event) => {
                      setDraft(event.target.value)
                      setInputError(null)
                    }}
                    onKeyDown={handleDraftKeyDown}
                    onBlur={() => {
                      if (draft.trim() && addRecipient(draft)) setDraft('')
                    }}
                    placeholder={atMax ? `Maximum ${MAX_RECIPIENTS} recipients reached` : 'name@example.com — press Enter to add'}
                    className="w-full bg-[var(--brand-alpha-4)] border border-line rounded-xl px-4 h-11 text-[15px] text-ink-900 placeholder:text-[var(--ink-600)]/60 focus-visible:border-[var(--brand-400)] focus-visible:ring-2 focus-visible:ring-[var(--brand-400)]/10 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {inputError ? <p className="text-xs text-red-500">{inputError}</p> : null}
                </div>

                {/* Your name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-ink-900">Your name <span className="text-ink-600 font-normal">(optional)</span></label>
                  <Input
                    type="text"
                    value={senderName}
                    onChange={(event) => setSenderName(event.target.value)}
                    placeholder="So they know who it's from"
                    className="w-full bg-[var(--brand-alpha-4)] border border-line rounded-xl px-4 h-11 text-[15px] text-ink-900 placeholder:text-[var(--ink-600)]/60 focus-visible:border-[var(--brand-400)] focus-visible:ring-2 focus-visible:ring-[var(--brand-400)]/10 outline-none transition-colors"
                  />
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-ink-900">Message <span className="text-ink-600 font-normal">(optional)</span></label>
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={3}
                    placeholder="Add a short note…"
                    className="w-full bg-[var(--brand-alpha-4)] border border-line rounded-xl px-4 py-2.5 text-[15px] text-ink-900 placeholder:text-[var(--ink-600)]/60 focus-visible:border-[var(--brand-400)] focus-visible:ring-2 focus-visible:ring-[var(--brand-400)]/10 outline-none transition-colors resize-none font-sans"
                  />
                </div>

                {sendError && status === 'error' ? <p className="text-sm text-red-500">{sendError}</p> : null}
              </Modal.Body>

              <Modal.Footer className="px-0 pb-0 pt-5">
                <Button variant="ghost" onPress={() => handleOpenChange(false)} className="flex-1 text-ink-600" isDisabled={isSending}>
                  Cancel
                </Button>
                <Button
                  onPress={handleSend}
                  isPending={isSending}
                  isDisabled={isSending || recipientCount === 0}
                  className="flex-1 bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl font-medium hover:bg-[var(--ink-800)] disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <LuMail className="w-4 h-4" />
                  {recipientCount > 1 ? `Send (${recipientCount})` : 'Send'}
                </Button>
              </Modal.Footer>
            </>
          )}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}

export default ShareToEmailModal
