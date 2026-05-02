'use client'

import type { TimeValue } from '@heroui/react'
import type { DateValue } from '@internationalized/date'

import { Calendar, DateField, DatePicker, Label, TimeField } from '@heroui/react'
import { getLocalTimeZone, parseAbsoluteToLocal, ZonedDateTime } from '@internationalized/date'
import { useMemo } from 'react'

interface DateTimeFieldProps {
  value?: string
  onChange?: (value: string) => void
  isInvalid?: boolean
}

export function DateTimeField({ value, onChange, isInvalid }: DateTimeFieldProps) {
  const localTimeZone = getLocalTimeZone()

  const parsedValue = useMemo(() => {
    if (!value) return null
    try {
      // Handle standard ISO strings (e.g., from Date.toISOString())
      return parseAbsoluteToLocal(value)
    } catch (e) {
      // Fallback for strings without Z or offset, if any
      try {
        // If it's just a date or date-time without zone, we might need a different parser
        // but parseAbsoluteToLocal is usually what we want for backend-synced dates.
        console.warn("DateTimeField: Failed to parse as absolute, value:", value)
        return null
      } catch {
        return null
      }
    }
  }, [value])

  const handleChange = (val: DateValue | null) => {
    if (!onChange) return
    if (!val) {
      onChange('')
      return
    }

    try {
      // Convert ZonedDateTime to JS Date to get a standard ISO string for the backend (UTC)
      if ('toDate' in val) {
        const date = (val as ZonedDateTime).toDate()
        onChange(date.toISOString())
      } else {
        // Fallback for other DateValue types
        onChange(val)
      }
    } catch (e) {
      console.error("DateTimeField: Error in handleChange:", e)
    }
  }

  return (
    <DatePicker
      className="w-full"
      value={parsedValue}
      onChange={handleChange}
      granularity="minute"
      hideTimeZone
      shouldForceLeadingZeros
      isInvalid={isInvalid}
    >
      {({ state }) => (
        <>
          <DateField.Group fullWidth className="bg-[var(--brand-alpha-4)] border-1 border-black/10 rounded-xl h-12 px-4 group-data-[focus=true]:border-[var(--brand-400)] transition-colors">
            <DateField.Input className="font-sans text-ink-900 flex-1">
              {(segment) => (
                <DateField.Segment 
                  segment={segment} 
                  className="px-0.5 focus:bg-[var(--brand-400)]/20 focus:text-[var(--ink-900)] rounded-sm outline-none" 
                />
              )}
            </DateField.Input>
            <DateField.Suffix className="ml-2">
              <DatePicker.Trigger className="p-1 hover:bg-black/5 rounded-md transition-colors">
                <DatePicker.TriggerIndicator className="text-ink-600" />
              </DatePicker.Trigger>
            </DateField.Suffix>
          </DateField.Group>
          <DatePicker.Popover className="flex flex-col gap-3 p-4 bg-white border border-black/10 shadow-2xl rounded-2xl">
            <Calendar aria-label="Expiry date" className="border-none shadow-none">
              <Calendar.Header className="font-sans mb-2">
                <Calendar.YearPickerTrigger>
                  <Calendar.YearPickerTriggerHeading className="font-medium text-ink-900" />
                  <Calendar.YearPickerTriggerIndicator className="ml-1" />
                </Calendar.YearPickerTrigger>
                <div className="flex gap-1 ml-auto">
                  <Calendar.NavButton slot="previous" className="p-1.5 hover:bg-black/5 rounded-lg transition-colors" />
                  <Calendar.NavButton slot="next" className="p-1.5 hover:bg-black/5 rounded-lg transition-colors" />
                </div>
              </Calendar.Header>
              <Calendar.Grid className="font-sans">
                <Calendar.GridHeader>
                  {(day) => (
                    <Calendar.HeaderCell className="text-ink-400 font-medium text-xs pb-2">
                      {day}
                    </Calendar.HeaderCell>
                  )}
                </Calendar.GridHeader>
                <Calendar.GridBody>
                  {(date) => (
                    <Calendar.Cell
                      date={date}
                      className="w-9 h-9 flex items-center justify-center text-sm rounded-lg transition-all
                        hover:bg-black/5 cursor-pointer
                        data-[selected=true]:bg-[var(--ink-900)] data-[selected=true]:text-white data-[selected=true]:font-medium
                        data-[outside-month=true]:text-ink-300
                        data-[disabled=true]:text-ink-200 data-[disabled=true]:cursor-default"
                    />
                  )}
                </Calendar.GridBody>
              </Calendar.Grid>
              <Calendar.YearPickerGrid>
                <Calendar.YearPickerGridBody>
                  {({ year }) => (
                    <Calendar.YearPickerCell 
                      year={year} 
                      className="px-2 py-1 rounded-md hover:bg-black/5 data-[selected=true]:bg-[var(--ink-900)] data-[selected=true]:text-white"
                    />
                  )}
                </Calendar.YearPickerGridBody>
              </Calendar.YearPickerGrid>
            </Calendar>
            <div className="flex items-center justify-between pt-4 border-t border-black/5 font-sans">
              <Label className="text-sm font-semibold text-ink-900">Time</Label>
              <TimeField
                aria-label="Time"
                granularity="minute"
                hideTimeZone
                shouldForceLeadingZeros
                value={state.timeValue}
                onChange={(v) => state.setTimeValue(v as TimeValue)}
              >
                <TimeField.Group variant="secondary" className="bg-black/5 rounded-xl px-3 py-2 flex gap-1 items-center border-none">
                  <TimeField.Input className="text-sm font-medium text-ink-900">
                    {(segment) => (
                      <TimeField.Segment 
                        segment={segment} 
                        className="focus:bg-[var(--brand-400)]/20 rounded-sm outline-none px-0.5" 
                      />
                    )}
                  </TimeField.Input>
                </TimeField.Group>
              </TimeField>
            </div>
          </DatePicker.Popover>
        </>
      )}
    </DatePicker>
  )
}

