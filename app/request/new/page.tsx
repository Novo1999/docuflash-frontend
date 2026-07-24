'use client'

import { createUploadRequest, deleteFolderByShareToken, getActiveRequests } from '@/app/lib/api/folder'
import { getClientId, getRequestLink } from '@/app/utils/upload'
import ActiveRequestCard from '@/components/request/ActiveRequestCard'
import AccessTypeField, { type AccessTypeValue } from '@/components/shared/AccessTypeField'
import { FileAccessType } from '@/types/file'
import type { ActiveRequestRecord } from '@/types/folder'
import { Button, Card, CardContent, cn, Input, Label, Spinner, TextField } from '@heroui/react'
import { useAtom, useAtomValue } from 'jotai'
import { atomWithQuery, queryClientAtom } from 'jotai-tanstack-query'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { LuCheck, LuCopy, LuDownload, LuInbox, LuLink, LuQrCode } from 'react-icons/lu'
import QRCode from 'react-qr-code'

const RequestNewPage = () => {
  const [folderName, setFolderName] = useState('')
  const [accessType, setAccessType] = useState<AccessTypeValue>('public')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [link, setLink] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'link' | 'qr'>('link')
  const [copied, setCopied] = useState(false)
  const [endingToken, setEndingToken] = useState<string | null>(null)
  const router = useRouter()

  const queryClient = useAtomValue(queryClientAtom)
  const activeRequestsAtom = useMemo(
    () =>
      atomWithQuery(() => ({
        queryKey: ['active-requests'],
        queryFn: () => getActiveRequests(getClientId()),
      })),
    [],
  )
  const [activeRequestsQuery] = useAtom(activeRequestsAtom)
  const activeRequests: ActiveRequestRecord[] = activeRequestsQuery.data ?? []
  const refreshActiveRequests = () => queryClient.invalidateQueries({ queryKey: ['active-requests'] })

  const publicTaken = activeRequests.some((request) => request.accessType === FileAccessType.PUBLIC)
  const protectedTaken = activeRequests.some((request) => request.accessType === FileAccessType.PROTECTED)
  const disabledAccessValues = [...(publicTaken ? ['public'] : []), ...(protectedTaken ? ['protected'] : [])] as AccessTypeValue[]

  // If the picked slot is already taken but the other is free, generate against the free one.
  const effectiveAccessType: AccessTypeValue = disabledAccessValues.length === 1 && disabledAccessValues.includes(accessType) ? (accessType === 'public' ? 'protected' : 'public') : accessType
  const selectedTaken = disabledAccessValues.includes(effectiveAccessType)

  const handleResume = (shareToken: string) => router.push(`/request/${shareToken}`)

  const handleEndSession = async (shareToken: string) => {
    setEndingToken(shareToken)
    setError(null)
    try {
      await deleteFolderByShareToken(shareToken)
      await refreshActiveRequests()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message || 'Failed to end session' : 'Failed to end session')
    } finally {
      setEndingToken(null)
    }
  }

  const isMissingPassword = effectiveAccessType === 'protected' && !password.trim()

  const handleGenerate = async () => {
    if (isMissingPassword || selectedTaken) return

    setIsSubmitting(true)
    setError(null)
    try {
      const request = await createUploadRequest({
        folderName: folderName.trim() || undefined,
        clientId: getClientId(),
        accessType: effectiveAccessType as FileAccessType,
        password: effectiveAccessType === 'protected' ? password.trim() : undefined,
      })
      setLink(getRequestLink(request.shareToken))
      void refreshActiveRequests()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message || 'Failed to generate link' : 'Failed to generate link')
      void refreshActiveRequests()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopy = () => {
    if (!link) return
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleQrDownload = () => {
    const svg = document.getElementById('request-qr-code')
    if (!svg) return
    const serialized = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([serialized], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'docuflash-request-qr.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setLink(null)
    setFolderName('')
    setAccessType('public')
    setPassword('')
    setShowPassword(false)
    void refreshActiveRequests()
    setActiveTab('link')
    setCopied(false)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-[var(--brand-50)]">
      <div className="max-w-[560px] mx-auto pt-[72px] pb-10 px-4">
        <Card className="w-full border-none shadow-[0_4px_40px_rgba(15,28,46,0.07)]">
          <CardContent className="p-8 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 bg-[var(--brand-alpha-12)] rounded-full flex items-center justify-center">
                <LuInbox className="w-6 h-6 text-[var(--brand-400)]" />
              </div>
              <h1 className="text-2xl font-serif text-[var(--ink-900)]">Request files</h1>
              <p className="text-sm text-[var(--ink-600)] font-sans">Generate an &quot;upload to me&quot; link and share it. Anyone can send you files &mdash; no account needed. Files are deleted automatically 2 hours after upload.</p>
            </div>

            {!link && activeRequests.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-[var(--ink-900)] font-sans">Ongoing requests</h2>
                  <span className="text-xs text-[var(--ink-600)] font-sans">{activeRequests.length} of 2 active</span>
                </div>
                {activeRequests.map((request) => (
                  <ActiveRequestCard
                    key={request.shareToken}
                    request={request}
                    onResume={() => handleResume(request.shareToken)}
                    onEnd={() => handleEndSession(request.shareToken)}
                    isEnding={endingToken === request.shareToken}
                  />
                ))}
              </div>
            )}

            {!link ? (
              <div className="flex flex-col gap-5">
                <TextField className="w-full" isDisabled={isSubmitting}>
                  <Label className="text-left text-[var(--ink-900)] font-sans text-sm font-medium">Label (optional)</Label>
                  <div className="relative w-full mt-1.5">
                    <Input
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                      type="text"
                      placeholder="e.g. Tax documents 2026"
                      className={cn(
                        'w-full bg-[var(--brand-alpha-4)] border border-line rounded-xl px-4 h-12 text-[15px] text-[var(--ink-900)] font-sans',
                        'placeholder:text-[var(--ink-600)]/60 focus-visible:border-[var(--brand-400)] focus-visible:ring-2 focus-visible:ring-[var(--brand-400)]/10 outline-none transition-colors',
                      )}
                    />
                  </div>
                </TextField>

                <AccessTypeField
                  value={effectiveAccessType}
                  onChange={(val) => {
                    setAccessType(val)
                    if (val !== 'protected') {
                      setPassword('')
                      setShowPassword(false)
                    }
                  }}
                  password={password}
                  onPasswordChange={setPassword}
                  showPassword={showPassword}
                  onToggleShowPassword={() => setShowPassword((curr) => !curr)}
                  subject="this request"
                  question="Who can access this request?"
                  isDisabled={isSubmitting}
                  disabledValues={disabledAccessValues}
                />

                {selectedTaken && (
                  <p className="text-sm text-[var(--ink-600)] font-sans text-center">
                    You&apos;ve reached the maximum of 2 active requests &mdash; one public and one protected. Resume or end a session above to create a new one.
                  </p>
                )}

                {error && <p className="text-sm text-red-500 font-sans text-center">{error}</p>}

                <Button
                  fullWidth
                  onPress={handleGenerate}
                  isDisabled={isSubmitting || isMissingPassword || selectedTaken}
                  isPending={isSubmitting}
                  className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl text-base font-medium h-12 hover:bg-[var(--ink-800)] font-sans"
                >
                  {isSubmitting ? <Spinner className="text-[var(--brand-50)]" /> : 'Generate link'}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="relative">
                    <div className="w-12 h-12 bg-[var(--brand-alpha-12)] rounded-full flex items-center justify-center">
                      <LuLink className="w-5 h-5 text-[var(--brand-400)]" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-surface">
                      <LuCheck className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <p className="text-lg font-serif text-[var(--ink-900)]">Your link is generated</p>
                  <p className="text-sm text-[var(--ink-600)] font-sans">Share this with someone to make them upload to you.</p>
                </div>

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
                          selected
                            ? 'bg-surface shadow-[0_1px_3px_rgba(15,28,46,0.08)] border border-line text-[var(--ink-900)]'
                            : 'border border-transparent text-[var(--ink-600)] hover:bg-ink-900/[0.04]',
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    )
                  })}
                </div>

                <div className={cn(activeTab === 'link' ? 'flex flex-col gap-4' : 'hidden')}>
                  <div className="flex items-center justify-between gap-3 bg-[var(--brand-alpha-4)] border border-line rounded-xl px-4 py-3">
                    <span className="text-sm text-[var(--ink-900)] font-sans overflow-hidden text-ellipsis whitespace-nowrap flex-1 text-left">{link}</span>
                    <button
                      type="button"
                      aria-label="Copy link"
                      onClick={handleCopy}
                      className={cn('shrink-0 p-1.5 rounded-md transition-colors hover:bg-ink-900/[0.06]', copied ? 'text-[var(--brand-400)]' : 'text-[var(--ink-600)]')}
                    >
                      <LuCopy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button fullWidth onPress={handleCopy} className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl text-base font-medium h-12 hover:bg-[var(--ink-800)] font-sans">
                      {copied ? 'Link copied to clipboard' : 'Copy link'}
                    </Button>
                    <Button
                      fullWidth
                      onPress={() => {
                        if (link) router.push(link)
                      }}
                      variant="ghost"
                      className="text-[var(--ink-700)] border border-line rounded-xl text-base font-medium h-12 hover:bg-ink-900/[0.06] font-sans"
                    >
                      Go to dropzone
                    </Button>
                  </div>
                </div>

                <div className={activeTab === 'qr' ? 'flex flex-col items-center gap-4' : 'hidden'}>
                  <div className="p-4 bg-white rounded-2xl border border-black/[0.06] shadow-[0_2px_12px_rgba(15,28,46,0.06)]">
                    <QRCode id="request-qr-code" value={link} size={240} level="M" bgColor="#ffffff" fgColor="#0f1c2e" />
                  </div>
                  <Button fullWidth onPress={handleQrDownload} className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl text-base font-medium h-12 hover:bg-[var(--ink-800)] font-sans flex items-center justify-center gap-2">
                    <LuDownload className="w-4 h-4" />
                    Download QR
                  </Button>
                </div>

                <Button fullWidth variant="ghost" onPress={handleReset} className="text-[var(--ink-600)] text-sm hover:text-[var(--ink-900)] hover:bg-ink-900/[0.06] font-sans">
                  Create another request
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RequestNewPage
