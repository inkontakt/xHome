import type { APIRoute } from 'astro'

export type WordPressFetchOptions = {
  auth?: boolean
  method?: 'GET' | 'POST'
  body?: BodyInit | null
  headers?: HeadersInit
}

export type FluentFormField =
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
      hostInfo?: string
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

export type FluentFormSchema = {
  formId: number
  title?: string
  fields: FluentFormField[]
}

export type FluentBookingEvent = {
  calendar_event?: Record<string, unknown>
}

export type FluentBookingAvailability = {
  schedule_options?: Record<string, unknown>
  available_schedules?: Array<Record<string, unknown>>
}

export type FluentBookingFields = {
  fields?: Array<Record<string, unknown>>
}

type FluentFormsFieldResponse = {
  form?: {
    id?: number | string
    title?: string
  }
  fields?: Record<string, unknown>
  form_fields?: {
    fields?: unknown[]
  }
}

const DEFAULT_FORM_SCHEMA_PATH = '/fluentform/v1/forms/{formId}/fields'
const DEFAULT_FORM_SUBMIT_PATH = '/fluentform/v1/forms/{formId}/submit'
const DEFAULT_BOOKING_BASE_PATH = '/fluent-booking/v2'

function getRequiredEnv(name: string) {
  const value = import.meta.env[name]

  if (!value || typeof value !== 'string') {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function getOptionalEnv(name: string) {
  const value = import.meta.env[name]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function buildWpPath(template: string, formId: number) {
  return template.replaceAll('{formId}', String(formId))
}

function buildBookingPath(template: string, calendarId: number, eventId: number) {
  return template
    .replaceAll('{calendarId}', String(calendarId))
    .replaceAll('{eventId}', String(eventId))
}

function getWordPressBaseUrl() {
  return getRequiredEnv('WORDPRESS_API_URL').replace(/\/$/, '')
}

function getWordPressAuthHeader() {
  const authMode = getRequiredEnv('WP_AUTH_MODE')

  if (authMode !== 'application_password') {
    throw new Error(`Unsupported WP_AUTH_MODE: ${authMode}`)
  }

  const username = getRequiredEnv('WP_USERNAME')
  const password = getRequiredEnv('WP_APP_PASSWORD')
  const token = Buffer.from(`${username}:${password}`).toString('base64')

  return `Basic ${token}`
}

async function fetchWordPress<T>(path: string, options: WordPressFetchOptions = {}) {
  const headers = new Headers(options.headers)

  if (options.auth ?? true) {
    headers.set('Authorization', getWordPressAuthHeader())
  }

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const startedAt = Date.now()
  const response = await fetch(`${getWordPressBaseUrl()}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ?? null
  })
  // #region agent log
  fetch('http://localhost:7433/ingest/2b9349a0-c0a1-4e81-9aa0-918008adcca8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c66fb0'},body:JSON.stringify({sessionId:'c66fb0',runId:'slow-homepage-1',hypothesisId:'H3',location:'wordpress.ts:fetchWordPress',message:'wordpress_request_finished',data:{path,method:options.method??'GET',status:response.status,durationMs:Date.now()-startedAt},timestamp:Date.now()})}).catch(()=>{})
  // #endregion

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`WordPress request failed (${response.status}): ${errorBody}`)
  }

  return (await response.json()) as T
}

function getValidationRequired(fieldSettings: Record<string, any> | undefined) {
  return Boolean(fieldSettings?.validation_rules?.required?.value)
}

function normalizeOptions(rawOptions: any) {
  if (Array.isArray(rawOptions)) {
    return rawOptions
      .map(option => ({
        label: String(option?.label ?? option?.text ?? option?.value ?? ''),
        value: String(option?.value ?? option?.key ?? option?.label ?? '')
      }))
      .filter(option => option.label && option.value)
  }

  if (rawOptions && typeof rawOptions === 'object') {
    return Object.entries(rawOptions)
      .map(([key, option]: [string, any]) => ({
        label: String(option?.label ?? option?.text ?? option ?? key),
        value: String(option?.value ?? option?.key ?? key)
      }))
      .filter(option => option.label && option.value)
  }

  return []
}

function getFieldOptions(field: any, settings: Record<string, any>) {
  const candidates = [
    field?.options,
    settings?.advanced_options,
    settings?.options,
    settings?.values
  ]

  for (const candidate of candidates) {
    const normalized = normalizeOptions(candidate)
    if (normalized.length > 0) {
      return normalized
    }
  }

  return []
}

function toSupportedField(field: any): FluentFormField | null {
  const element = field?.element
  const settings = field?.settings ?? {}
  const attributes = field?.attributes ?? {}

  if (element === 'input_name') {
    const parts = Object.values(field?.fields ?? {})
      .filter((part: any) => part?.settings?.visible !== false)
      .map((part: any) => ({
        name: String(part?.attributes?.name ?? ''),
        label: String(part?.settings?.label ?? ''),
        placeholder: part?.attributes?.placeholder ? String(part.attributes.placeholder) : undefined,
        required: getValidationRequired(part?.settings)
      }))
      .filter(part => part.name && part.label)

    return {
      type: 'name',
      name: String(attributes.name ?? 'names'),
      label: String(settings.admin_field_label || settings.label || 'Name'),
      required: parts.some(part => part.required),
      parts
    }
  }

  if (element === 'input_email' || element === 'input_text') {
    return {
      type: element === 'input_email' ? 'email' : 'text',
      name: String(attributes.name ?? ''),
      label: String(settings.label ?? settings.admin_field_label ?? ''),
      placeholder: attributes.placeholder ? String(attributes.placeholder) : undefined,
      required: getValidationRequired(settings)
    }
  }

  if (element === 'textarea') {
    return {
      type: 'textarea',
      name: String(attributes.name ?? ''),
      label: String(settings.label ?? settings.admin_field_label ?? ''),
      placeholder: attributes.placeholder ? String(attributes.placeholder) : undefined,
      required: getValidationRequired(settings),
      rows: typeof attributes.rows === 'number' ? attributes.rows : 4
    }
  }

  if (element === 'fcal_booking') {
    return {
      type: 'booking',
      name: String(attributes.name ?? 'fcal_booking'),
      label: String(settings.label ?? 'Booking'),
      required: getValidationRequired(settings),
      eventId:
        typeof settings.event_id === 'number'
          ? settings.event_id
          : typeof settings.event_id === 'string'
            ? Number(settings.event_id)
            : undefined,
      hostInfo: settings?.cal_guest_fields?.host_info
        ? String(settings.cal_guest_fields.host_info)
        : undefined
    }
  }

  if (element === 'input_radio' || element === 'input_select' || element === 'select') {
    const options = getFieldOptions(field, settings)

    return {
      type: element === 'input_radio' ? 'radio' : 'select',
      name: String(attributes.name ?? ''),
      label: String(settings.label ?? settings.admin_field_label ?? ''),
      required: getValidationRequired(settings),
      options
    }
  }

  if (element === 'input_checkbox' || element === 'checkbox') {
    const options = getFieldOptions(field, settings)

    return {
      type: 'checkbox',
      name: String(attributes.name ?? ''),
      label: String(settings.label ?? settings.admin_field_label ?? ''),
      required: getValidationRequired(settings),
      options
    }
  }

  return null
}

export async function getFluentFormSchema(formId: number): Promise<FluentFormSchema> {
  const schemaPath = buildWpPath(
    getOptionalEnv('WORDPRESS_FORM_SCHEMA_PATH') ?? DEFAULT_FORM_SCHEMA_PATH,
    formId
  )
  const response = await fetchWordPress<FluentFormsFieldResponse>(schemaPath)

  const rawFields = Array.isArray(response?.form_fields?.fields)
    ? response.form_fields.fields
    : Array.isArray(response?.fields)
      ? response.fields
      : response?.fields && typeof response.fields === 'object'
        ? Object.values(response.fields)
        : response && typeof response === 'object'
          ? Object.values(response)
          : []

  const fields = rawFields
    .map(toSupportedField)
    .filter((field): field is FluentFormField => Boolean(field))

  return {
    formId,
    title: response?.form?.title,
    fields
  }
}

export async function submitFluentForm(formId: number, data: Record<string, unknown>) {
  const submitPath = buildWpPath(
    getOptionalEnv('WORDPRESS_FORM_SUBMIT_PATH') ?? DEFAULT_FORM_SUBMIT_PATH,
    formId
  )

  return fetchWordPress<Record<string, unknown>>(submitPath, {
    method: 'POST',
    body: JSON.stringify({
      form_id: formId,
      data
    })
  })
}

export async function getFluentBookingEvent(calendarId: number, eventId: number) {
  const path = buildBookingPath(
    `${DEFAULT_BOOKING_BASE_PATH}/calendars/{calendarId}/events/{eventId}`,
    calendarId,
    eventId
  )

  return fetchWordPress<FluentBookingEvent>(path)
}

export async function getFluentBookingAvailability(calendarId: number, eventId: number) {
  const path = buildBookingPath(
    `${DEFAULT_BOOKING_BASE_PATH}/calendars/{calendarId}/events/{eventId}/availability`,
    calendarId,
    eventId
  )

  return fetchWordPress<FluentBookingAvailability>(path)
}

export async function getFluentBookingFields(calendarId: number, eventId: number) {
  const path = buildBookingPath(
    `${DEFAULT_BOOKING_BASE_PATH}/calendars/{calendarId}/events/{eventId}/booking-fields`,
    calendarId,
    eventId
  )

  return fetchWordPress<FluentBookingFields>(path)
}

export function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    status: init?.status ?? 200,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    }
  })
}

export function getNumericFormId(params: APIRoute['params']) {
  const rawFormId = params.formId
  const formId = Number(rawFormId)

  if (!rawFormId || Number.isNaN(formId) || formId <= 0) {
    throw new Error('Invalid formId route parameter')
  }

  return formId
}

export function getNumericParam(params: APIRoute['params'], key: string) {
  const rawValue = params[key]
  const value = Number(rawValue)

  if (!rawValue || Number.isNaN(value) || value <= 0) {
    throw new Error(`Invalid ${key} route parameter`)
  }

  return value
}
