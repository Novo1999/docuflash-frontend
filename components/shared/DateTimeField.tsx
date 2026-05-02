'use client'

import type { TimeValue } from '@heroui/react'
import type { DateValue } from '@internationalized/date'

import { Calendar, DateField, DatePicker, Label, TimeField } from '@heroui/react'
import { getLocalTimeZone, parseDate, toZoned } from '@internationalized/date'

interface DateTimeFieldProps {
  value?: string
  onChange?: (value: string) => void
  isInvalid?: boolean
}

export function DateTimeField({ value, onChange, isInvalid }: DateTimeFieldProps) {
  const localTimeZone = getLocalTimeZone()

  const parsedValue = value
    ? (() => {
        try {
          return toZoned(parseDate(value.split('T')[0]), localTimeZone)
        } catch {
          return undefined
        }
      })()
    : undefined

  const handleChange = (val: DateValue | null) => {
    if (!val || !onChange) return
    try {
      onChange(val.toString())
    } catch {
      // ignore invalid intermediate states
    }
  }

  return (
    <DatePicker
      className="w-full"
      value={parsedValue ?? null}
      onChange={handleChange}
      granularity="minute"
      hideTimeZone
      shouldForceLeadingZeros
      isInvalid={isInvalid}
    >
      {({ state }) => (
        <>
          <DateField.Group fullWidth>
            <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
            <DateField.Suffix>
              <DatePicker.Trigger>
                <DatePicker.TriggerIndicator />
              </DatePicker.Trigger>
            </DateField.Suffix>
          </DateField.Group>
          <DatePicker.Popover className="flex flex-col gap-3">
            <Calendar aria-label="Expiry date">
              <Calendar.Header>
                <Calendar.YearPickerTrigger>
                  <Calendar.YearPickerTriggerHeading />
                  <Calendar.YearPickerTriggerIndicator />
                </Calendar.YearPickerTrigger>
                <Calendar.NavButton slot="previous" />
                <Calendar.NavButton slot="next" />
              </Calendar.Header>
              <Calendar.Grid>
                <Calendar.GridHeader>{(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}</Calendar.GridHeader>
                <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
              </Calendar.Grid>
              <Calendar.YearPickerGrid>
                <Calendar.YearPickerGridBody>{({ year }) => <Calendar.YearPickerCell year={year} />}</Calendar.YearPickerGridBody>
              </Calendar.YearPickerGrid>
            </Calendar>
            <div className="flex items-center justify-between">
              <Label>Time</Label>
              <TimeField
                aria-label="Time"
                granularity="minute"
                hideTimeZone
                shouldForceLeadingZeros
                value={state.timeValue}
                onChange={(v) => state.setTimeValue(v as TimeValue)}
              >
                <TimeField.Group variant="secondary">
                  <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
                </TimeField.Group>
              </TimeField>
            </div>
          </DatePicker.Popover>
        </>
      )}
    </DatePicker>
  )
}
