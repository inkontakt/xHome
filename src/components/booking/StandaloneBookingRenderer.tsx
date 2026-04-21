import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type BookingField = {
  type: string
  name: string
  label?: string
  placeholder?: string
  help_text?: string
  required?: boolean
  enabled?: boolean
  options?: string[]
}

type BookingEventPayload = {
  calendarId: number
  eventId: number
  event: {
    calendar_event?: {
      title?: string
      duration?: string
      public_url?: string
      location_settings?: Array<{
        title?: string
        description?: string
      }>
      settings?: {
        lock_timezone?: {
          enabled?: boolean
          timezone?: string
        }
      }
    }
  }
  fields: {
    fields?: BookingField[]
  }
}

type AvailabilityPayload = {
  available_slots?: Record<
    string,
    Array<{
      start: string
      end: string
      remaining?: boolean
    }>
  >
  timezone?: string
  error?: string
}

type BookingResponse = {
  message?: string
  response_html?: string
  booking_hash?: string
  error?: string
}

type Props = {
  calendarId: number
  eventId: number
}

const SYSTEM_FIELD_ORDER = ['name', 'email']

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric'
  }).format(date)
}

function formatDateLabel(dateString: string, timezone: string) {
  const date = new Date(`${dateString}T00:00:00`)

  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: timezone
  }).format(date)
}

function formatSlotLabel(slot: { start: string; end: string }, timezone: string) {
  const start = new Date(slot.start.replace(' ', 'T'))
  const end = new Date(slot.end.replace(' ', 'T'))

  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone
  }).format(start)
    .concat(' - ')
    .concat(
      new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone
      }).format(end)
    )
}

function getMonthStart(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
}

function getCalendarDays(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: Array<{ key: string; date: string | null; dayNumber?: number }> = []

  for (let index = 0; index < startOffset; index += 1) {
    cells.push({ key: `empty-start-${index}`, date: null })
  }

  for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
    const isoDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`
    cells.push({ key: isoDate, date: isoDate, dayNumber })
  }

  while (cells.length % 7 !== 0) {
    cells.push({ key: `empty-end-${cells.length}`, date: null })
  }

  return cells
}

function normalizeFieldValue(field: BookingField) {
  if (field.type === 'checkbox') {
    return 'No'
  }

  return ''
}

function StandaloneBookingRenderer({ calendarId, eventId }: Props) {
  const [bookingMeta, setBookingMeta] = useState<BookingEventPayload | null>(null)
  const [availability, setAvailability] = useState<Record<string, AvailabilityPayload['available_slots'][string]>>({})
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [loadingMeta, setLoadingMeta] = useState(true)
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<BookingResponse | null>(null)

  useEffect(() => {
    let active = true

    async function loadBookingMeta() {
      try {
        setLoadingMeta(true)
        setError(null)

        const response = await fetch(`/api/booking/${calendarId}/${eventId}`)
        const payload = (await response.json()) as BookingEventPayload & { error?: string }

        if (!response.ok) {
          throw new Error(payload.error ?? 'Unable to load booking details')
        }

        if (!active) {
          return
        }

        setBookingMeta(payload)

        const nextFormData = Object.fromEntries(
          (payload.fields.fields ?? [])
            .filter(field => field.enabled !== false)
            .map(field => [field.name, normalizeFieldValue(field)])
        )

        setFormData(nextFormData)
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load booking details')
        }
      } finally {
        if (active) {
          setLoadingMeta(false)
        }
      }
    }

    void loadBookingMeta()

    return () => {
      active = false
    }
  }, [calendarId, eventId])

  useEffect(() => {
    if (!bookingMeta) {
      return
    }

    let active = true

    async function loadAvailability() {
      try {
        setLoadingAvailability(true)
        setError(null)

        const timezone =
          bookingMeta.event.calendar_event?.settings?.lock_timezone?.timezone ?? 'Europe/Berlin'
        const duration = bookingMeta.event.calendar_event?.duration ?? '15'
        const startDate = getMonthStart(currentMonth)
        const response = await fetch(
          `/api/booking/${calendarId}/${eventId}/availability?startDate=${encodeURIComponent(startDate)}&timezone=${encodeURIComponent(timezone)}&duration=${encodeURIComponent(duration)}`
        )
        const payload = (await response.json()) as AvailabilityPayload

        if (!response.ok) {
          throw new Error(payload.error ?? 'Unable to load availability')
        }

        if (!active) {
          return
        }

        setAvailability(payload.available_slots ?? {})

        if (selectedDate && !payload.available_slots?.[selectedDate]) {
          setSelectedDate(null)
          setSelectedSlot(null)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load availability')
        }
      } finally {
        if (active) {
          setLoadingAvailability(false)
        }
      }
    }

    void loadAvailability()

    return () => {
      active = false
    }
  }, [bookingMeta, calendarId, currentMonth, eventId, selectedDate])

  const timezone = bookingMeta?.event.calendar_event?.settings?.lock_timezone?.timezone ?? 'Europe/Berlin'
  const fields = useMemo(() => {
    const rawFields = (bookingMeta?.fields.fields ?? []).filter(field => field.enabled !== false)

    return rawFields.sort((left, right) => {
      const leftIndex = SYSTEM_FIELD_ORDER.indexOf(left.name)
      const rightIndex = SYSTEM_FIELD_ORDER.indexOf(right.name)

      if (leftIndex === -1 && rightIndex === -1) {
        return 0
      }

      if (leftIndex === -1) {
        return 1
      }

      if (rightIndex === -1) {
        return -1
      }

      return leftIndex - rightIndex
    })
  }, [bookingMeta])
  const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth])
  const selectedSlots = selectedDate ? availability[selectedDate] ?? [] : []

  function updateField(name: string, value: string) {
    setFormData(current => ({
      ...current,
      [name]: value
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedSlot) {
      setError('Select a date and time first.')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const payload = {
        ...formData,
        timezone,
        duration: bookingMeta?.event.calendar_event?.duration ?? '15',
        start_date: selectedSlot.start
      }

      const response = await fetch(`/api/booking/${calendarId}/${eventId}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      const result = (await response.json()) as BookingResponse

      if (!response.ok) {
        throw new Error(result.error ?? 'Unable to create booking')
      }

      setSuccess(result)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='space-y-6'>
      {loadingMeta ? <p className='text-sm text-muted-foreground'>Loading booking details…</p> : null}
      {error ? <p className='text-sm text-red-600'>{error}</p> : null}

      {bookingMeta ? (
        <>
          <div className='grid gap-6 lg:grid-cols-[1.3fr_0.9fr]'>
            <div className='rounded-xl border bg-muted/10 p-4'>
              <div className='mb-4 flex items-center justify-between gap-3'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() =>
                    setCurrentMonth(
                      current => new Date(current.getFullYear(), current.getMonth() - 1, 1)
                    )
                  }
                >
                  Previous
                </Button>
                <h3 className='text-base font-semibold'>{formatMonthLabel(currentMonth)}</h3>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() =>
                    setCurrentMonth(
                      current => new Date(current.getFullYear(), current.getMonth() + 1, 1)
                    )
                  }
                >
                  Next
                </Button>
              </div>

              <div className='mb-2 grid grid-cols-7 gap-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className='grid grid-cols-7 gap-2'>
                {calendarDays.map(day => {
                  const isEnabled = Boolean(day.date && availability[day.date]?.length)
                  const isSelected = day.date === selectedDate

                  return (
                    <button
                      key={day.key}
                      type='button'
                      disabled={!day.date || !isEnabled}
                      onClick={() => {
                        if (!day.date) {
                          return
                        }

                        setSelectedDate(day.date)
                        setSelectedSlot(null)
                      }}
                      className={cn(
                        'flex aspect-square items-center justify-center rounded-lg border text-sm transition',
                        !day.date ? 'border-transparent bg-transparent' : '',
                        day.date && !isEnabled ? 'cursor-not-allowed border-dashed text-muted-foreground/50' : '',
                        isEnabled ? 'border-border bg-background hover:border-primary hover:text-primary' : '',
                        isSelected ? 'border-primary bg-primary text-primary-foreground hover:text-primary-foreground' : ''
                      )}
                    >
                      {day.dayNumber ?? ''}
                    </button>
                  )
                })}
              </div>

              <div className='mt-4 flex items-center gap-3 text-xs text-muted-foreground'>
                <span className='inline-flex h-3 w-3 rounded-full bg-primary/80' />
                <span>Available day</span>
              </div>
            </div>

            <div className='rounded-xl border bg-background p-4'>
              <div className='space-y-2'>
                <h3 className='text-base font-semibold'>
                  {selectedDate ? formatDateLabel(selectedDate, timezone) : 'Choose a day'}
                </h3>
                <p className='text-sm text-muted-foreground'>
                  {loadingAvailability
                    ? 'Loading time slots…'
                    : selectedDate
                      ? 'Choose a time slot to continue.'
                      : 'Select a date from the calendar.'}
                </p>
              </div>

              <div className='mt-4 grid gap-2'>
                {selectedSlots.map(slot => (
                  <button
                    key={slot.start}
                    type='button'
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-left text-sm transition hover:border-primary hover:text-primary',
                      selectedSlot?.start === slot.start ? 'border-primary bg-primary/5 text-primary' : 'bg-background'
                    )}
                  >
                    <span className='font-medium'>{formatSlotLabel(slot, timezone)}</span>
                  </button>
                ))}

                {selectedDate && selectedSlots.length === 0 && !loadingAvailability ? (
                  <p className='text-sm text-muted-foreground'>No time slots found for this date.</p>
                ) : null}
              </div>
            </div>
          </div>

          {success?.response_html ? (
            <div
              className='rounded-xl border bg-background p-6'
              dangerouslySetInnerHTML={{ __html: success.response_html }}
            />
          ) : (
            <form className='space-y-5 rounded-xl border bg-background p-6' onSubmit={handleSubmit}>
              <div className='space-y-2'>
                <h3 className='text-lg font-semibold'>Booking Details</h3>
                <p className='text-sm text-muted-foreground'>
                  {bookingMeta.event.calendar_event?.title ?? 'Appointment'}
                </p>
                {bookingMeta.event.calendar_event?.location_settings?.[0]?.description ? (
                  <p className='whitespace-pre-line text-sm text-muted-foreground'>
                    {bookingMeta.event.calendar_event.location_settings[0].description}
                  </p>
                ) : null}
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                {fields.map(field => {
                  if (field.type === 'textarea') {
                    return (
                      <label key={field.name} className='space-y-2 md:col-span-2'>
                        <span className='text-sm font-medium'>{field.label ?? field.name}</span>
                        <Textarea
                          value={formData[field.name] ?? ''}
                          placeholder={field.placeholder}
                          required={field.required}
                          onChange={event => updateField(field.name, event.target.value)}
                        />
                      </label>
                    )
                  }

                  if (field.type === 'dropdown') {
                    return (
                      <label key={field.name} className='space-y-2'>
                        <span className='text-sm font-medium'>{field.label ?? field.name}</span>
                        <select
                          className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-[3px]'
                          value={formData[field.name] ?? ''}
                          required={field.required}
                          onChange={event => updateField(field.name, event.target.value)}
                        >
                          <option value=''>Select an option</option>
                          {(field.options ?? []).map(option => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                    )
                  }

                  if (field.type === 'checkbox') {
                    return (
                      <div key={field.name} className='space-y-2'>
                        <Label className='text-sm font-medium'>{field.label ?? field.name}</Label>
                        <label className='flex items-center gap-2 text-sm'>
                          <input
                            type='checkbox'
                            checked={formData[field.name] === 'Yes'}
                            onChange={event =>
                              updateField(field.name, event.target.checked ? 'Yes' : 'No')
                            }
                          />
                          <span>{field.help_text ?? field.placeholder ?? 'Confirm'}</span>
                        </label>
                      </div>
                    )
                  }

                  return (
                    <label key={field.name} className='space-y-2'>
                      <span className='text-sm font-medium'>{field.label ?? field.name}</span>
                      <Input
                        type={field.type === 'email' ? 'email' : 'text'}
                        value={formData[field.name] ?? ''}
                        placeholder={field.placeholder}
                        required={field.required}
                        onChange={event => updateField(field.name, event.target.value)}
                      />
                    </label>
                  )
                })}
              </div>

              <div className='rounded-lg border border-dashed p-4 text-sm text-muted-foreground'>
                <p>
                  Selected slot:{' '}
                  <span className='font-medium text-foreground'>
                    {selectedSlot ? formatSlotLabel(selectedSlot, timezone) : 'No slot selected yet'}
                  </span>
                </p>
              </div>

              <Button className='w-full' type='submit' disabled={submitting || !selectedSlot}>
                {submitting ? 'Booking…' : 'Confirm booking'}
              </Button>
            </form>
          )}
        </>
      ) : null}
    </div>
  )
}

export default StandaloneBookingRenderer
