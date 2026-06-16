'use client'

import { PRESETS } from '@/app/constants/expiry'
import { formatCountdown, formatExact, matchPreset } from '@/app/utils/expirySelector'
import { Preset } from '@/types/file'
import { Calendar, cn, DateField, DatePicker, Label, TimeField, type TimeValue } from '@heroui/react'
import { parseAbsoluteToLocal, ZonedDateTime, type DateValue } from '@internationalized/date'
import { useEffect, useMemo, useState } from 'react'
import { LuCalendar, LuClock } from 'react-icons/lu'

interface ExpirySelectorProps {
  value?: string
  onChange?: (value: string) => void
  isInvalid?: boolean
  isDisabled?: boolean
}

const ExpirySelector = ({ value, onChange, isInvalid, isDisabled }: ExpirySelectorProps) => {
  const [now, setNow] = useState(() => Date.now())
  const [activePreset, setActivePreset] = useState<string | null>(() => matchPreset(value || ''))
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  const parsedValue = useMemo(() => {
    if (!value) return null
    try {
      return parseAbsoluteToLocal(value)
    } catch {
      return null
    }
  }, [value])

  const targetMs = value ? new Date(value).getTime() : 0
  const isExpired = !!value && targetMs <= now
  const countdown = value ? formatCountdown(targetMs, now) : 'Pick when this link should expire'
  const exact = value ? formatExact(value) : ''

  const handlePreset = (p: Preset) => {
    const next = new Date(now + p.hours * 60 * 60 * 1000)
    onChange?.(next.toISOString())
    setActivePreset(p.key)
  }

  const handlePickerChange = (val: DateValue | null) => {
    if (!onChange) return
    if (!val) {
      onChange('')
      setActivePreset(null)
      return
    }
    try {
      if ('toDate' in val) {
        const date = (val as ZonedDateTime).toDate()
        onChange(date.toISOString())
        setActivePreset(null)
      }
    } catch (e) {
      console.error('ExpirySelector: error converting date', e)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <label className="text-left text-sm font-medium text-[var(--ink-900)] flex items-center gap-1.5 font-sans">
          <LuClock className="w-4 h-4" />
          When should this file expire?
        </label>
        {value && (
          <span
            className={cn(
              'text-[11px] font-medium tabular-nums tracking-tight px-2 py-0.5 rounded-full font-sans',
              isExpired ? 'bg-red-500/10 text-red-600' : 'bg-[var(--brand-alpha-12)] text-[var(--brand-400)]',
            )}
          >
            {countdown}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => {
          const selected = activePreset === p.key
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => handlePreset(p)}
              disabled={isDisabled}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium tracking-tight transition-all font-sans border',
                selected
                  ? 'bg-[var(--ink-900)] text-[var(--brand-50)] border-[var(--ink-900)] shadow-[0_1px_2px_rgba(15,28,46,0.18)]'
                  : 'bg-surface text-[var(--ink-700)] border-line hover:border-ink-900/20 hover:bg-ink-900/[0.04]',
                isDisabled && 'opacity-50 cursor-not-allowed',
              )}
            >
              {p.label}
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          disabled={isDisabled}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium tracking-tight transition-all font-sans border',
            !activePreset && value ? 'bg-[var(--ink-900)] text-[var(--brand-50)] border-[var(--ink-900)]' : 'bg-surface text-[var(--ink-700)] border-line hover:border-ink-900/20',
            isDisabled && 'opacity-50 cursor-not-allowed',
          )}
        >
          <LuCalendar className="w-3 h-3" />
          Custom…
        </button>
      </div>

      {pickerOpen && (
        <DatePicker className="w-full" value={parsedValue} onChange={handlePickerChange} granularity="minute" hideTimeZone shouldForceLeadingZeros isInvalid={isInvalid} isDisabled={isDisabled}>
          {({ state }) => (
            <>
              <DateField.Group fullWidth className="bg-[var(--brand-alpha-4)] border border-line rounded-xl h-12 px-4 group-data-[focus=true]:border-[var(--brand-400)] transition-colors">
                <DateField.Input className="font-sans text-[var(--ink-900)] flex-1">
                  {(segment) => <DateField.Segment segment={segment} className="px-0.5 focus:bg-[var(--brand-400)]/20 focus:text-[var(--ink-900)] rounded-sm outline-none" />}
                </DateField.Input>
                <DateField.Suffix className="ml-2">
                  <DatePicker.Trigger className="p-1 hover:bg-ink-900/[0.06] rounded-md transition-colors">
                    <DatePicker.TriggerIndicator className="text-[var(--ink-600)]" />
                  </DatePicker.Trigger>
                </DateField.Suffix>
              </DateField.Group>
              <DatePicker.Popover className="flex flex-col gap-3 p-4 bg-surface border border-line shadow-2xl rounded-2xl">
                <Calendar aria-label="Expiry date" className="border-none shadow-none">
                  <Calendar.Header className="font-sans mb-2">
                    <Calendar.YearPickerTrigger>
                      <Calendar.YearPickerTriggerHeading className="font-medium text-[var(--ink-900)]" />
                      <Calendar.YearPickerTriggerIndicator className="ml-1" />
                    </Calendar.YearPickerTrigger>
                    <div className="flex gap-1 ml-auto">
                      <Calendar.NavButton slot="previous" className="p-1.5 hover:bg-ink-900/[0.06] rounded-lg transition-colors" />
                      <Calendar.NavButton slot="next" className="p-1.5 hover:bg-ink-900/[0.06] rounded-lg transition-colors" />
                    </div>
                  </Calendar.Header>
                  <Calendar.Grid className="font-sans">
                    <Calendar.GridHeader>{(day) => <Calendar.HeaderCell className="text-[var(--ink-400)] font-medium text-xs pb-2">{day}</Calendar.HeaderCell>}</Calendar.GridHeader>
                    <Calendar.GridBody>
                      {(date) => (
                        <Calendar.Cell
                          date={date}
                          className="w-9 h-9 flex items-center justify-center text-sm rounded-lg transition-all
                            hover:bg-ink-900/[0.06] cursor-pointer
                            data-[selected=true]:bg-[var(--ink-900)] data-[selected=true]:text-[var(--brand-50)] data-[selected=true]:font-medium
                            data-[outside-month=true]:text-[var(--ink-300)]
                            data-[disabled=true]:text-[var(--ink-200)] data-[disabled=true]:cursor-default"
                        />
                      )}
                    </Calendar.GridBody>
                  </Calendar.Grid>
                  <Calendar.YearPickerGrid>
                    <Calendar.YearPickerGridBody>
                      {({ year }) => <Calendar.YearPickerCell year={year} className="px-2 py-1 rounded-md hover:bg-ink-900/[0.06] data-[selected=true]:bg-[var(--ink-900)] data-[selected=true]:text-[var(--brand-50)]" />}
                    </Calendar.YearPickerGridBody>
                  </Calendar.YearPickerGrid>
                </Calendar>
                <div className="flex items-center justify-between pt-4 border-t border-line font-sans">
                  <Label className="text-sm font-semibold text-[var(--ink-900)]">Time</Label>
                  <TimeField aria-label="Time" granularity="minute" hideTimeZone shouldForceLeadingZeros value={state.timeValue} onChange={(v) => state.setTimeValue(v as TimeValue)}>
                    <TimeField.Group variant="secondary" className="bg-ink-900/[0.06] rounded-xl px-3 py-2 flex gap-1 items-center border-none">
                      <TimeField.Input className="text-sm font-medium text-[var(--ink-900)]">
                        {(segment) => <TimeField.Segment segment={segment} className="focus:bg-[var(--brand-400)]/20 rounded-sm outline-none px-0.5" />}
                      </TimeField.Input>
                    </TimeField.Group>
                  </TimeField>
                </div>
              </DatePicker.Popover>
            </>
          )}
        </DatePicker>
      )}

      {value && !pickerOpen && <span className="text-[11px] text-[var(--ink-600)] font-sans tabular-nums">{exact}</span>}
    </div>
  )
}

export default ExpirySelector
