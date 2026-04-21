import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type FormField =
  | {
      type:
        | 'text'
        | 'email'
        | 'textarea'
        | 'number'
        | 'url'
        | 'password'
        | 'tel'
        | 'date'
        | 'color'
        | 'mask'
      name: string
      label: string
      placeholder?: string
      required: boolean
      rows?: number
      mask?: string
      reverseMask?: boolean
      clearIfNotMatch?: boolean
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
      multiple?: boolean
      options: Array<{
        label: string
        value: string
      }>
    }
  | {
      type: 'address'
      name: string
      label: string
      required: boolean
      parts: Array<{
        name: string
        label: string
        placeholder?: string
        required: boolean
        type?: 'text' | 'select'
        options?: Array<{
          label: string
          value: string
        }>
      }>
    }
  | {
      type: 'gdpr'
      name: string
      label: string
      required: boolean
      description?: string
    }
  | {
      type: 'section'
      name: string
      label: string
      description?: string
    }
  | {
      type: 'html'
      name: string
      html: string
    }
  | {
      type: 'hidden'
      name: string
      value: string
    }
  | {
      type: 'container'
      name: string
      columns: Array<{
        width?: number
        fields: FormField[]
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

type FieldValidationErrors = Record<string, string>

type Props = {
  formId: number
  bookingCalendarId?: number
  bookingEventId?: number
  bookingUrl?: string
}

function DynamicFormRenderer({ formId, bookingCalendarId, bookingEventId, bookingUrl }: Props) {
  const [schema, setSchema] = useState<FormSchema | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [initialFormData, setInitialFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldValidationErrors>({})
  const [bookingData, setBookingData] = useState<BookingApiResponse | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)

  function initializeFieldState(field: FormField, nextState: Record<string, any>) {
    if (field.type === 'container') {
      field.columns.forEach(column => {
        column.fields.forEach(childField => initializeFieldState(childField, nextState))
      })
      return
    }

    if (field.type === 'name' || field.type === 'address') {
      nextState[field.name] = Object.fromEntries(field.parts.map(part => [part.name, '']))
      return
    }

    if (field.type === 'checkbox' || (field.type === 'select' && field.multiple)) {
      nextState[field.name] = []
      return
    }

    if (field.type === 'gdpr') {
      nextState[field.name] = false
      return
    }

    if (field.type === 'hidden') {
      nextState[field.name] = field.value
      return
    }

    nextState[field.name] = ''
  }

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
          initializeFieldState(field, initialState)
        })

        setFormData(initialState)
        setInitialFormData(initialState)
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
    const hasEmbeddedBookingUrl = Boolean(bookingUrl)

    if (hasEmbeddedBookingUrl) {
      setBookingData(null)
      setBookingError(null)
      return
    }

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
  }, [bookingCalendarId, bookingEventId, bookingUrl, schema])

  function updateField(name: string, value: string) {
    setFieldErrors(current => {
      if (!current[name]) {
        return current
      }

      const nextErrors = { ...current }
      delete nextErrors[name]
      return nextErrors
    })

    setFormData(current => ({
      ...current,
      [name]: value
    }))
  }

  function updateNameField(group: string, part: string, value: string) {
    setFieldErrors(current => {
      const keysToClear = [part, `${group}.${part}`, `${group}[${part}]`, group]
      const nextErrors = { ...current }
      let changed = false

      keysToClear.forEach(key => {
        if (key in nextErrors) {
          delete nextErrors[key]
          changed = true
        }
      })

      return changed ? nextErrors : current
    })

    setFormData(current => ({
      ...current,
      [group]: {
        ...(current[group] ?? {}),
        [part]: value
      }
    }))
  }

  function updateCheckboxField(group: string, value: string, checked: boolean) {
    setFieldErrors(current => {
      if (!current[group]) {
        return current
      }

      const nextErrors = { ...current }
      delete nextErrors[group]
      return nextErrors
    })

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

  function updateNestedField(group: string, part: string, value: string) {
    setFieldErrors(current => {
      const keysToClear = [part, `${group}.${part}`, `${group}[${part}]`, group]
      const nextErrors = { ...current }
      let changed = false

      keysToClear.forEach(key => {
        if (key in nextErrors) {
          delete nextErrors[key]
          changed = true
        }
      })

      return changed ? nextErrors : current
    })

    setFormData(current => ({
      ...current,
      [group]: {
        ...(current[group] ?? {}),
        [part]: value
      }
    }))
  }

  function updateBooleanField(name: string, checked: boolean) {
    setFieldErrors(current => {
      if (!current[name]) {
        return current
      }

      const nextErrors = { ...current }
      delete nextErrors[name]
      return nextErrors
    })

    setFormData(current => ({
      ...current,
      [name]: checked
    }))
  }

  function updateMultiSelectField(name: string, values: string[]) {
    setFieldErrors(current => {
      if (!current[name]) {
        return current
      }

      const nextErrors = { ...current }
      delete nextErrors[name]
      return nextErrors
    })

    setFormData(current => ({
      ...current,
      [name]: values
    }))
  }

  function extractFieldErrors(
    errors: Record<string, unknown>,
    parentKey?: string
  ): FieldValidationErrors {
    const flattenedErrors: FieldValidationErrors = {}

    Object.entries(errors).forEach(([key, value]) => {
      const currentKey = parentKey ? `${parentKey}.${key}` : key

      if (typeof value === 'string' && value.trim().length > 0) {
        flattenedErrors[currentKey] = value
        return
      }

      if (Array.isArray(value)) {
        const firstMessage = value.find(
          item => typeof item === 'string' && item.trim().length > 0
        )

        if (typeof firstMessage === 'string') {
          flattenedErrors[currentKey] = firstMessage
        }

        return
      }

      if (value && typeof value === 'object') {
        const nestedEntries = Object.entries(value)
        const directMessages = nestedEntries
          .map(([, nestedValue]) => nestedValue)
          .filter(
            (nestedValue): nestedValue is string =>
              typeof nestedValue === 'string' && nestedValue.trim().length > 0
          )

        if (directMessages.length > 0) {
          flattenedErrors[key] = directMessages[0]
        }

        Object.assign(
          flattenedErrors,
          extractFieldErrors(value as Record<string, unknown>, currentKey)
        )
      }
    })

    return flattenedErrors
  }

  function getFieldError(name: string) {
    return fieldErrors[name] ?? null
  }

  function getNestedFieldError(group: string, part: string) {
    return (
      fieldErrors[part] ??
      fieldErrors[`${group}.${part}`] ??
      fieldErrors[`${group}[${part}]`] ??
      fieldErrors[group] ??
      null
    )
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
          const schedule = info as { enabled?: boolean; slots?: Array<any> }
          const enabled = Boolean(schedule?.enabled)
          const slots = Array.isArray(schedule?.slots) ? schedule.slots : []
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
    setFieldErrors({})

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
      const payload = (await response.json()) as {
        error?: string
        errors?: Record<string, unknown>
      }

      if (!response.ok) {
        if (payload.errors && typeof payload.errors === 'object') {
          setFieldErrors(extractFieldErrors(payload.errors))
        }

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

  function resetSubmittedForm() {
    setFormData(initialFormData)
    setSuccess(null)
    setError(null)
    setFieldErrors({})
  }

  function renderField(field: FormField, keyPrefix = ''): React.ReactNode {
    const key = keyPrefix ? `${keyPrefix}-${field.name}` : field.name

    if (field.type === 'container') {
      const gridClass =
        field.columns.length === 1
          ? 'grid-cols-1'
          : field.columns.length === 2
            ? 'md:grid-cols-2'
            : field.columns.length === 3
              ? 'md:grid-cols-3'
              : field.columns.length >= 4
                ? 'md:grid-cols-2 xl:grid-cols-4'
                : 'grid-cols-1'

      return (
        <div key={key} className={`grid gap-4 ${gridClass}`}>
          {field.columns.map((column, columnIndex) => (
            <div key={`${key}-column-${columnIndex}`} className='space-y-5'>
              {column.fields.map((childField, childIndex) =>
                renderField(childField, `${key}-column-${columnIndex}-${childIndex}`)
              )}
            </div>
          ))}
        </div>
      )
    }

    if (field.type === 'hidden') {
      return (
        <input
          key={key}
          type='hidden'
          name={field.name}
          value={formData[field.name] ?? field.value}
        />
      )
    }

    if (field.type === 'section') {
      return (
        <div key={key} className='rounded-lg border bg-muted/30 p-4'>
          <p className='text-base font-semibold'>{field.label}</p>
          {field.description ? (
            <p className='mt-1 text-sm text-muted-foreground'>{field.description}</p>
          ) : null}
        </div>
      )
    }

    if (field.type === 'html') {
      return (
        <div
          key={key}
          className='prose prose-sm max-w-none text-foreground'
          dangerouslySetInnerHTML={{ __html: field.html }}
        />
      )
    }

    if (field.type === 'name') {
      return (
        <fieldset key={key} className='space-y-3'>
          <legend className='text-sm font-medium'>{field.label}</legend>
          <div className='grid gap-3 md:grid-cols-2'>
            {field.parts.map(part => (
              <label key={`${key}-${part.name}`} className='space-y-2'>
                <span className='text-sm font-medium'>
                  {part.label}
                  {renderRequiredIndicator(part.required)}
                </span>
                <Input
                  className={cn(getNestedFieldError(field.name, part.name) ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200' : '')}
                  value={formData[field.name]?.[part.name] ?? ''}
                  placeholder={part.placeholder}
                  onChange={event => updateNameField(field.name, part.name, event.target.value)}
                  required={part.required}
                />
                {getNestedFieldError(field.name, part.name) ? (
                  <p className='text-sm text-red-600'>{getNestedFieldError(field.name, part.name)}</p>
                ) : null}
              </label>
            ))}
          </div>
        </fieldset>
      )
    }

    if (field.type === 'address') {
      return (
        <fieldset key={key} className='space-y-3'>
          <legend className='text-sm font-medium'>
            {field.label}
            {renderRequiredIndicator(field.required)}
          </legend>
          <div className='grid gap-3 md:grid-cols-2'>
            {field.parts.map(part => (
              <label key={`${key}-${part.name}`} className='space-y-2'>
                <span className='text-sm font-medium'>
                  {part.label}
                  {renderRequiredIndicator(part.required)}
                </span>
                {part.type === 'select' ? (
                  <select
                    className={cn(
                      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-[3px]',
                      getNestedFieldError(field.name, part.name)
                        ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200'
                        : ''
                    )}
                    value={formData[field.name]?.[part.name] ?? ''}
                    onChange={event => updateNestedField(field.name, part.name, event.target.value)}
                    required={part.required}
                  >
                    <option value=''>{part.placeholder ?? 'Select an option'}</option>
                    {(part.options ?? []).map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    className={cn(getNestedFieldError(field.name, part.name) ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200' : '')}
                    value={formData[field.name]?.[part.name] ?? ''}
                    placeholder={part.placeholder}
                    onChange={event => updateNestedField(field.name, part.name, event.target.value)}
                    required={part.required}
                  />
                )}
                {getNestedFieldError(field.name, part.name) ? (
                  <p className='text-sm text-red-600'>{getNestedFieldError(field.name, part.name)}</p>
                ) : null}
              </label>
            ))}
          </div>
        </fieldset>
      )
    }

    if (field.type === 'booking') {
      const resolvedBookingUrl = bookingUrl

      return (
        <div key={key} className='rounded-lg border border-dashed p-4'>
          <p className='text-sm font-medium'>{field.label}</p>
          {resolvedBookingUrl ? (
            <div className='mt-3 space-y-2'>
              <p className='text-sm text-muted-foreground'>Bookings are handled in FluentBooking.</p>
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
              <p>Booking-linked field detected for event {resolvedEventId ?? 'unknown'}.</p>
              {bookingError ? <p className='text-red-600'>{bookingError}</p> : renderWeeklySchedules()}
            </div>
          ) : null}
        </div>
      )
    }

    if (field.type === 'select') {
      return (
        <label key={key} className='block space-y-2'>
          <span className='text-sm font-medium'>
            {field.label}
            {renderRequiredIndicator(field.required)}
          </span>
          <select
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-[3px]',
              getFieldError(field.name)
                ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200'
                : ''
            )}
            value={formData[field.name] ?? (field.multiple ? [] : '')}
            onChange={event =>
              field.multiple
                ? updateMultiSelectField(
                    field.name,
                    Array.from(event.target.selectedOptions, option => option.value)
                  )
                : updateField(field.name, event.target.value)
            }
            required={field.required}
            multiple={field.multiple}
          >
            {!field.multiple ? <option value=''>Select an option</option> : null}
            {field.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {getFieldError(field.name) ? (
            <p className='text-sm text-red-600'>{getFieldError(field.name)}</p>
          ) : null}
        </label>
      )
    }

    if (field.type === 'gdpr') {
      return (
        <div key={key} className='space-y-3 rounded-lg border p-4'>
          <div className='flex items-start gap-3'>
            <Checkbox
              id={field.name}
              checked={Boolean(formData[field.name])}
              onCheckedChange={checked => updateBooleanField(field.name, checked === true)}
              required={field.required}
            />
            <div className='space-y-2'>
              <Label htmlFor={field.name} className='leading-5'>
                {field.label}
                {renderRequiredIndicator(field.required)}
              </Label>
              {field.description ? (
                <div
                  className='text-sm text-muted-foreground'
                  dangerouslySetInnerHTML={{ __html: field.description }}
                />
              ) : null}
            </div>
          </div>
          {getFieldError(field.name) ? (
            <p className='text-sm text-red-600'>{getFieldError(field.name)}</p>
          ) : null}
        </div>
      )
    }

    if (field.type === 'radio') {
      return (
        <fieldset key={key} className='space-y-2'>
          <legend className='text-sm font-medium'>
            {field.label}
            {renderRequiredIndicator(field.required)}
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
          {getFieldError(field.name) ? (
            <p className='text-sm text-red-600'>{getFieldError(field.name)}</p>
          ) : null}
        </fieldset>
      )
    }

    if (field.type === 'checkbox') {
      return (
        <fieldset key={key} className='space-y-2'>
          <legend className='text-sm font-medium'>
            {field.label}
            {renderRequiredIndicator(field.required)}
          </legend>
          <div className='space-y-2'>
            {field.options.map(option => (
              <label key={option.value} className='flex items-center gap-2 text-sm'>
                <input
                  type='checkbox'
                  name={`${field.name}[]`}
                  value={option.value}
                  checked={Array.isArray(formData[field.name]) && formData[field.name].includes(option.value)}
                  onChange={event => updateCheckboxField(field.name, option.value, event.target.checked)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {getFieldError(field.name) ? (
            <p className='text-sm text-red-600'>{getFieldError(field.name)}</p>
          ) : null}
        </fieldset>
      )
    }

    return (
      <label key={key} className='block space-y-2'>
        <span className='text-sm font-medium'>
          {field.label}
          {renderRequiredIndicator(field.required)}
        </span>
        {field.type === 'textarea' ? (
          <Textarea
            className={cn(getFieldError(field.name) ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200' : '')}
            rows={field.rows ?? 4}
            value={formData[field.name] ?? ''}
            placeholder={field.placeholder}
            onChange={event => updateField(field.name, event.target.value)}
            required={field.required}
          />
        ) : (
          <Input
            className={cn(getFieldError(field.name) ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200' : '')}
            type={field.type === 'mask' ? 'text' : field.type}
            value={formData[field.name] ?? ''}
            placeholder={'placeholder' in field ? field.placeholder : undefined}
            onChange={event => updateField(field.name, event.target.value)}
            required={field.required}
            inputMode={field.type === 'mask' ? 'text' : undefined}
            pattern={field.type === 'mask' && field.mask ? field.mask : undefined}
            data-mask={field.type === 'mask' ? field.mask : undefined}
          />
        )}
        {getFieldError(field.name) ? (
          <p className='text-sm text-red-600'>{getFieldError(field.name)}</p>
        ) : null}
      </label>
    )
  }

  function renderRequiredIndicator(required: boolean) {
    if (!required) {
      return null
    }

    return (
      <span aria-hidden='true' className='ml-1 text-red-500'>
        *
      </span>
    )
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

        {schema ? (
          <form className='space-y-5' onSubmit={handleSubmit}>
            {success ? (
              <div className='space-y-4 rounded-xl border border-green-200 bg-green-50 p-6 text-green-950'>
                <div className='space-y-2'>
                  <p className='text-lg font-semibold'>Thank you for your submission.</p>
                  <p className='text-sm text-green-900/80'>
                    We&apos;ve received your information successfully.
                  </p>
                </div>
                <Button className='w-full' type='button' variant='outline' onClick={resetSubmittedForm}>
                  Submit another response
                </Button>
              </div>
            ) : (
              <>
                {schema.fields.map((field, index) => renderField(field, `root-${index}`))}

                <Button className='w-full' disabled={submitting} type='submit'>
                  {submitting ? 'Submitting…' : 'Submit'}
                </Button>
              </>
            )}
          </form>
        ) : null}
      </div>
    </section>
  )
}

export default DynamicFormRenderer
