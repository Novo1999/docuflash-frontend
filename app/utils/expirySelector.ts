import { PRESET_TOLERANCE_MS, PRESETS } from '@/app/constants/expiry'

function diffParts(target: number, now: number) {
  const ms = Math.max(0, target - now)
  const totalMin = Math.floor(ms / 60_000)
  const days = Math.floor(totalMin / 1440)
  const hours = Math.floor((totalMin % 1440) / 60)
  const mins = totalMin % 60
  return { days, hours, mins, ms }
}

function formatCountdown(target: number, now: number): string {
  const { days, hours, mins, ms } = diffParts(target, now)
  if (ms <= 0) return 'Already expired — pick a future time'
  if (days > 0) return `Expires in ${days}d ${hours}h ${mins}m`
  if (hours > 0) return `Expires in ${hours}h ${mins}m`
  return `Expires in ${mins}m`
}

function formatExact(value: string): string {
  try {
    return new Date(value).toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

function matchPreset(value: string): string | null {
  if (!value) return null
  const target = new Date(value).getTime()
  const now = Date.now()
  for (const p of PRESETS) {
    const expected = now + p.hours * 60 * 60 * 1000
    if (Math.abs(target - expected) < PRESET_TOLERANCE_MS) return p.key
  }
  return null
}

export { diffParts, formatCountdown, formatExact, matchPreset }
