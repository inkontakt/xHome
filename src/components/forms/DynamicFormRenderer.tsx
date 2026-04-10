import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type FormField =
  | {
      type: 'text' | 'email' | 'textarea'
      name: string
      label: string
      placeholder?: string
      required: boolean
      rows?: number
    }
  | {
      type: 'name'
      name: string
      label: string
      required: boolean
      parts: Array<{
        name: string
        label: string
        placeholder?: string
        required: boolean
      }>
    }
  | {
      type: 'booking'
      name: string
      label: string
      required: boolean
      eventId?: number
    }
  | {
      type: 'select' | 'radio' | 'checkbox'
      name: string
      label: string
      required: boolean
      options: Array<{
        label: string
        value: string
      }>
    }

type FormSchema = {
  formId: number
  title?: string
  fields: FormField[]
}

type BookingApiResponse = {
  calendarId: number
  eventId: number
  event?: {
    calendar_event?: Record<string, any>
  }
  availability?: {
    available_schedules?: Array<Record<string, any>>
  }
  fields?: {
    fields?: Array<Record<string, any>>
  }
  error?: string
}

type Props = {
  formId: number
  bookingCalendarId?: number
  bookingEventId?: number
  bookingUrl?: string
}

function DynamicFormRenderer({ formId, bookingCalendarId, bookingEventId, bookingUrl }: Props) {
  const [schema, setSchema] = useState<FormSchema | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [bookingData, setBookingData] = useState<BookingApiResponse | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadSchema() {
      try {
        setLoading(true)
        setError(null)
        const startedAt = Date.now()
        // #region agent log
        fetch('http://localhost:7433/ingest/2b9349a0-c0a1-4e81-9aa0-918008adcca8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c66fb0'},body:JSON.stringify({sessionId:'c66fb0',runId:'slow-homepage-1',hypothesisId:'H3',location:'DynamicFormRenderer.tsx:loadSchema',message:'schema_fetch_started',data:{formId},timestamp:startedAt})}).catch(()=>{})
        // #endregion

        const response = await fetch(`/api/forms/${formId}`)
        const payload = (await response.json()) as FormSchema & { error?: string }
        // #region agent log
        fetch('http://localhost:7433/ingest/2b9349a0-c0a1-4e81-9aa0-918008adcca8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c66fb0'},body:JSON.stringify({sessionId:'c66fb0',runId:'slow-homepage-1',hypothesisId:'H3',location:'DynamicFormRenderer.tsx:loadSchema',message:'schema_fetch_finished',data:{formId,status:response.status,durationMs:Date.now()-startedAt},timestamp:Date.now()})}).catch(()=>{})
        // #endregion

        if (!response.ok) {
          throw new Error(payload.error ?? 'Unable to load form')
        }

        if (!active) {
          return
        }

        setSchema(payload)

        const initialState: Record<string, any> = {}

        payload.fields.forEach(field => {
          if (field.type === 'name') {
            initialState[field.name] = Object.fromEntries(
              field.parts.map(part => [part.name, ''])
            )
            return
          }

          if (field.type === 'checkbox') {
            initialState[field.name] = []
            return
          }

          initialState[field.name] = ''
        })

        setFormData(initialState)
      } catch (loadError) {
        if (!active) {
          return
        }

        setError(loadError instanceof Error ? loadError.message : 'Unable to load form')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadSchema()

    return () => {
      active = false
    }
  }, [formId])

  useEffect(() => {
    const bookingField = schema?.fields.find(field => field.type === 'booking')
    const eventId = bookingField?.eventId ?? bookingEventId

    if (!bookingCalendarId || !eventId) {
      setBookingData(null)
      setBookingError(null)
      return
    }

    let active = true

    async function loadBookingData() {
      try {
        setBookingError(null)
        const startedAt = Date.now()
        // #region agent log
        fetch('http://localhost:7433/ingest/2b9349a0-c0a1-4e81-9aa0-918008adcca8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c66fb0'},body:JSON.stringify({sessionId:'c66fb0',runId:'slow-homepage-1',hypothesisId:'H3',location:'DynamicFormRenderer.tsx:loadBookingData',message:'booking_fetch_started',data:{bookingCalendarId,eventId},timestamp:startedAt})}).catch(()=>{})
        // #endregion
        const response = await fetch(`/api/booking/${bookingCalendarId}/${eventId}`)
        const payload = (await response.json()) as BookingApiResponse
        // #region agent log
        fetch('http://localhost:7433/ingest/2b9349a0-c0a1-4e81-9aa0-918008adcca8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c66fb0'},body:JSON.stringify({sessionId:'c66fb0',runId:'slow-homepage-1',hypothesisId:'H3',location:'DynamicFormRenderer.tsx:loadBookingData',message:'booking_fetch_finished',data:{bookingCalendarId,eventId,status:response.status,durationMs:Date.now()-startedAt},timestamp:Date.now()})}).catch(()=>{})
        // #endregion

        if (!response.ok) {
          throw new Error(payload.error ?? 'Unable to load booking data')
        }

        if (active) {
          setBookingData(payload)
        }
      } catch (loadError) {
        if (active) {
          setBookingError(
            loadError instanceof Error ? loadError.message : 'Unable to load booking data'
          )
        }
      }
    }

    void loadBookingData()

    return () => {
      active = false
    }
  }, [bookingCalendarId, bookingEventId, schema])

  function updateField(name: string, value: string) {
    setFormData(current => ({
      ...current,
      [name]: value
    }))
  }

  function updateNameField(group: string, part: string, value: string) {
    setFormData(current => ({
      ...current,
      [group]: {
        ...(current[group] ?? {}),
        [part]: value
      }
    }))
  }

  function updateCheckboxField(group: string, value: string, checked: boolean) {
    setFormData(current => {
      const currentValues = Array.isArray(current[group]) ? current[group] : []
      const nextValues = checked
        ? Array.from(new Set([...currentValues, value]))
        : currentValues.filter((item: string) => item !== value)

      return {
        ...current,
        [group]: nextValues
      }
    })
  }

  function renderWeeklySchedules() {
    const schedules = bookingData?.availability?.available_schedules
    const weekly = schedules?.[0]?.settings?.weekly_schedules

    if (!weekly || typeof weekly !== 'object') {
      return <p className='text-sm text-muted-foreground'>No availability schedule found.</p>
    }

    const days = Object.entries(weekly)

    return (
      <div className='space-y-2'>
        {days.map(([day, info]) => {
          const enabled = Boolean(info?.enabled)
          const slots = Array.isArray(info?.slots) ? info.slots : []
          const label = day.slice(0, 1).toUpperCase() + day.slice(1)

          return (
            <div key={day} className='text-sm'>
              <span className='font-medium'>{label}:</span>{' '}
              {enabled && slots.length > 0
                ? slots.map((slot: any) => `${slot.start}–${slot.end}`).join(', ')
                : 'No slots'}
            </div>
          )
        })}
      </div>
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: formData
        })
      })
      const payload = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to submit form')
      }

      setSuccess('Form submitted successfully.')
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Unable to submit form'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id='wordpress-form' className='bg-muted/40 px-4 py-16'>
      <div className='mx-auto max-w-3xl rounded-2xl border bg-background p-6 shadow-sm md:p-8'>
        <div className='mb-6 space-y-2'>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground'>
            WordPress Form
          </p>
          <h2 className='text-2xl font-semibold tracking-tight'>
            {schema?.title ?? `Form ${formId}`}
          </h2>
          <p className='text-sm text-muted-foreground'>
            This section is connected to Fluent Forms in WordPress through Astro.
          </p>
        </div>

        {loading ? <p className='text-sm text-muted-foreground'>Loading form…</p> : null}
        {error ? <p className='text-sm text-red-600'>{error}</p> : null}
        {success ? <p className='text-sm text-green-600'>{success}</p> : null}

        {schema ? (
          <form className='space-y-5' onSubmit={handleSubmit}>
            {schema.fields.map(field => {
              if (field.type === 'name') {
                return (
                  <fieldset key={field.name} className='space-y-3'>
                    <legend className='text-sm font-medium'>{field.label}</legend>
                    <div className='grid gap-3 md:grid-cols-2'>
                      {field.parts.map(part => (
                        <label key={part.name} className='space-y-2'>
                          <span className='text-sm font-medium'>
                            {part.label}
                            {part.required ? ' *' : ''}
                          </span>
                          <Input
                            value={formData[field.name]?.[part.name] ?? ''}
                            placeholder={part.placeholder}
                            onChange={event =>
                              updateNameField(field.name, part.name, event.target.value)
                            }
                            required={part.required}
                          />
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )
              }

              if (field.type === 'booking') {
                const resolvedEventId = field.eventId ?? bookingEventId
                const resolvedBookingUrl =
                  bookingUrl && resolvedEventId
                    ? bookingUrl.replaceAll('{eventId}', String(resolvedEventId))
                    : bookingUrl

                return (
                  <div key={field.name} className='rounded-lg border border-dashed p-4'>
                    <p className='text-sm font-medium'>{field.label}</p>
                    {resolvedBookingUrl ? (
                      <div className='mt-3 space-y-2'>
                        <p className='text-sm text-muted-foreground'>
                          Booking calendar for event {resolvedEventId ?? 'unknown'}.
                        </p>
                        <iframe
                          title='Booking calendar'
                          src={resolvedBookingUrl}
                          className='h-[520px] w-full rounded-md border'
                          loading='lazy'
                        />
                      </div>
                    ) : null}
                    {!resolvedBookingUrl ? (
                      <div className='mt-3 space-y-3 text-sm text-muted-foreground'>
                        <p>
                          Booking-linked field detected for event {resolvedEventId ?? 'unknown'}.
                        </p>
                        {bookingError ? (
                          <p className='text-red-600'>{bookingError}</p>
                        ) : (
                          renderWeeklySchedules()
                        )}
                      </div>
                    ) : null}
                  </div>
                )
              }

              if (field.type === 'select') {
                return (
                  <label key={field.name} className='block space-y-2'>
                    <span className='text-sm font-medium'>
                      {field.label}
                      {field.required ? ' *' : ''}
                    </span>
                    <select
                      className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-[3px]'
                      value={formData[field.name] ?? ''}
                      onChange={event => updateField(field.name, event.target.value)}
                      required={field.required}
                    >
                      <option value=''>Select an option</option>
                      {field.options.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )
              }

              if (field.type === 'radio') {
                return (
                  <fieldset key={field.name} className='space-y-2'>
                    <legend className='text-sm font-medium'>
                      {field.label}
                      {field.required ? ' *' : ''}
                    </legend>
                    <div className='space-y-2'>
                      {field.options.map(option => (
                        <label key={option.value} className='flex items-center gap-2 text-sm'>
                          <input
                            type='radio'
                            name={field.name}
                            value={option.value}
                            checked={formData[field.name] === option.value}
                            onChange={event => updateField(field.name, event.target.value)}
                            required={field.required}
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )
              }

              if (field.type === 'checkbox') {
                return (
                  <fieldset key={field.name} className='space-y-2'>
                    <legend className='text-sm font-medium'>
                      {field.label}
                      {field.required ? ' *' : ''}
                    </legend>
                    <div className='space-y-2'>
                      {field.options.map(option => (
                        <label key={option.value} className='flex items-center gap-2 text-sm'>
                          <input
                            type='checkbox'
                            name={`${field.name}[]`}
                            value={option.value}
                            checked={Array.isArray(formData[field.name]) &&
                              formData[field.name].includes(option.value)}
                            onChange={event =>
                              updateCheckboxField(field.name, option.value, event.target.checked)
                            }
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )
              }

              return (
                <label key={field.name} className='block space-y-2'>
                  <span className='text-sm font-medium'>
                    {field.label}
                    {field.required ? ' *' : ''}
                  </span>
                  {field.type === 'textarea' ? (
                    <Textarea
                      rows={field.rows ?? 4}
                      value={formData[field.name] ?? ''}
                      placeholder={field.placeholder}
                      onChange={event => updateField(field.name, event.target.value)}
                      required={field.required}
                    />
                  ) : (
                    <Input
                      type={field.type === 'email' ? 'email' : 'text'}
                      value={formData[field.name] ?? ''}
                      placeholder={field.placeholder}
                      onChange={event => updateField(field.name, event.target.value)}
                      required={field.required}
                    />
                  )}
                </label>
              )
            })}

            <Button disabled={submitting} type='submit'>
              {submitting ? 'Submitting…' : 'Submit'}
            </Button>
          </form>
        ) : null}
      </div>
    </section>
  )
}

export default DynamicFormRenderer
