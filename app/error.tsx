'use client'

import { Button, Card } from '@heroui/react'
import Link from 'next/link'
import { useEffect } from 'react'
import { FaHome } from 'react-icons/fa'
import { LuRefreshCcw } from 'react-icons/lu'
import { TbAlertHexagonFilled } from 'react-icons/tb'
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Root Error:', error)
  }, [error])

  return (
    <main className="flex-1 flex items-center justify-center p-4 min-h-[70vh]">
      <Card className="max-w-md w-full bg-white border border-black/[0.06] rounded-3xl p-8 md:p-10 shadow-[0_8px_40px_rgba(15,28,46,0.08)] text-center flex flex-col items-center gap-6 font-sans">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-2">
          <TbAlertHexagonFilled className="w-10 h-10 text-red-500" />
        </div>

        <Card.Header className="flex flex-col gap-3 p-0">
          <Card.Title className="text-3xl md:text-4xl font-serif text-[var(--ink-900)] leading-tight">Something went wrong</Card.Title>
          <Card.Description className="text-[var(--ink-600)] text-base md:text-lg leading-relaxed max-w-[280px] mx-auto">
            An unexpected error occurred. We&apos;ve been notified and are looking into it.
          </Card.Description>
        </Card.Header>

        {process.env.NODE_ENV === 'development' && (
          <div className="w-full bg-red-50/50 rounded-2xl p-4 text-left overflow-auto max-h-40 border border-red-100/50">
            <p className="text-xs font-mono text-red-800 break-words leading-tight">{error.message}</p>
          </div>
        )}

        <Card.Footer className="flex flex-col w-full gap-3 p-0 mt-2">
          <Button
            onPress={reset}
            fullWidth
            className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-2xl h-14 text-base font-semibold hover:bg-[var(--ink-800)] flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.98] transition-all"
          >
            <LuRefreshCcw className="w-5 h-5" />
            Try again
          </Button>

          <Button
            render={() => <Link href="/" />}
            fullWidth
            variant="ghost"
            className="text-[var(--ink-600)] rounded-2xl h-14 text-base font-medium hover:text-[var(--ink-900)] hover:bg-black/5 flex items-center justify-center gap-2.5 transition-all"
          >
            <FaHome className="w-5 h-5" />
            Return home
          </Button>
        </Card.Footer>
      </Card>
    </main>
  )
}
