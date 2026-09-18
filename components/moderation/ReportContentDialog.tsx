'use client'

import { createReport } from '@/app/lib/api/moderation'
import { REPORT_REASON_OPTIONS, type ReportReason, type ReportTargetType } from '@/types/moderation'
import { Button, Input, Modal } from '@heroui/react'
import { useState } from 'react'
import { LuCheck, LuFlag } from 'react-icons/lu'

const MAX_DETAILS_LENGTH = 2000

type ReportContentDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  targetType: ReportTargetType
  shareToken: string
  targetName?: string
}

type SubmitStatus = 'idle' | 'sending' | 'success' | 'error'

const fieldClassName =
  'w-full bg-[var(--brand-alpha-4)] border border-line rounded-xl px-4 text-[15px] text-ink-900 placeholder:text-[var(--ink-600)]/60 focus-visible:border-[var(--brand-400)] focus-visible:ring-2 focus-visible:ring-[var(--brand-400)]/10 outline-none transition-colors'

const ReportContentDialog = ({ isOpen, onOpenChange, targetType, shareToken, targetName }: ReportContentDialogProps) => {
  const [reason, setReason] = useState<ReportReason | ''>('')
  const [details, setDetails] = useState('')
  const [reporterEmail, setReporterEmail] = useState('')
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const resetState = () => {
    setReason('')
    setDetails('')
    setReporterEmail('')
    setStatus('idle')
    setErrorMessage(null)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) resetState()
    onOpenChange(open)
  }

  const handleSubmit = async () => {
    if (!reason) {
      setErrorMessage('Choose what is wrong with this content.')
      return
    }

    setStatus('sending')
    setErrorMessage(null)

    try {
      await createReport({
        targetType,
        shareToken,
        reason,
        details: details.trim() || undefined,
        reporterEmail: reporterEmail.trim() || undefined,
      })
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Could not send the report. Please try again.')
    }
  }

  const isSending = status === 'sending'

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
              <p className="text-lg font-serif text-ink-900">Report received</p>
              <p className="text-sm text-ink-600 max-w-[320px]">We review every report. If this content breaks our rules we will remove it and act on the account responsible.</p>
              <Button onPress={() => handleOpenChange(false)} className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl font-medium px-6 h-11 mt-1">
                Done
              </Button>
            </div>
          ) : (
            <>
              <Modal.Header className="px-0 pt-0 pb-4">
                <div className="flex items-center gap-2">
                  <Modal.Icon className="bg-red-500/15 text-red-500">
                    <LuFlag className="size-5" />
                  </Modal.Icon>
                  <div>
                    <Modal.Heading className="text-xl font-serif text-ink-900">Report this {targetType}</Modal.Heading>
                    <p className="text-xs text-ink-600 mt-0.5">You do not need an account to report content.</p>
                  </div>
                </div>
              </Modal.Header>

              <Modal.Body className="px-0 pb-0 flex flex-col gap-4">
                {targetName ? (
                  <div className="rounded-xl border border-line bg-[var(--brand-alpha-4)] px-3 py-2.5">
                    <span className="text-sm font-medium text-ink-900 break-words">{targetName}</span>
                  </div>
                ) : null}

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="report-reason" className="text-sm font-medium text-ink-900">
                    What is wrong with it?
                  </label>
                  <select
                    id="report-reason"
                    value={reason}
                    onChange={(event) => {
                      setReason(event.target.value as ReportReason)
                      setErrorMessage(null)
                    }}
                    className={`${fieldClassName} h-11`}
                  >
                    <option value="">Choose a reason…</option>
                    {REPORT_REASON_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="report-details" className="text-sm font-medium text-ink-900">
                    Details <span className="text-ink-600 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="report-details"
                    value={details}
                    maxLength={MAX_DETAILS_LENGTH}
                    onChange={(event) => setDetails(event.target.value)}
                    rows={3}
                    placeholder="Tell us what you found, so we can review it faster."
                    className={`${fieldClassName} py-2.5 resize-none font-sans`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="report-email" className="text-sm font-medium text-ink-900">
                    Your email <span className="text-ink-600 font-normal">(optional)</span>
                  </label>
                  <Input
                    id="report-email"
                    type="email"
                    value={reporterEmail}
                    onChange={(event) => setReporterEmail(event.target.value)}
                    placeholder="Only if you want a reply"
                    className={`${fieldClassName} h-11`}
                  />
                </div>

                {errorMessage ? (
                  <p aria-live="polite" className="text-sm text-red-500">
                    {errorMessage}
                  </p>
                ) : null}
              </Modal.Body>

              <Modal.Footer className="px-0 pb-0 pt-5">
                <Button variant="ghost" onPress={() => handleOpenChange(false)} className="flex-1 text-ink-600" isDisabled={isSending}>
                  Cancel
                </Button>
                <Button onPress={handleSubmit} isPending={isSending} isDisabled={isSending} className="flex-1 bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl font-medium hover:bg-[var(--ink-800)] disabled:opacity-40 flex items-center justify-center gap-2">
                  <LuFlag className="w-4 h-4" />
                  Send report
                </Button>
              </Modal.Footer>
            </>
          )}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}

export default ReportContentDialog
