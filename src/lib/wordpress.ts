import type { APIRoute } from 'astro'

import {
  getWordPressApiUrl,
  getWordPressAuthCredentials,
  type WordPressSiteKey
} from '@/lib/wordpress-site-config'

export type WordPressFetchOptions = {
  auth?: boolean
  method?: 'GET' | 'POST'
  body?: BodyInit | null
  headers?: HeadersInit
  siteKey?: WordPressSiteKey
}

export type FluentFormField =
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
      hostInfo?: string
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
        fields: FluentFormField[]
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

function getOptionalEnv(name: string) {
  const value = import.meta.env[name]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function getFirstNonEmptyString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }
  }

  return ''
}

function formatFallbackLabel(name: unknown, fallback = 'Field') {
  if (typeof name !== 'string' || name.trim().length === 0) {
    return fallback
  }

  const normalizedName = name.trim()
  const bracketMatches = Array.from(normalizedName.matchAll(/\[([^\]]+)\]/g))
  const bracketParts = bracketMatches
    .map(match => match[1]?.trim())
    .filter((part): part is string => Boolean(part))
    .filter(part => part.length > 0)

  const labelSource =
    bracketParts.length > 0
      ? bracketParts[bracketParts.length - 1]
      : normalizedName.replace(/\[\]$/g, '')

  return labelSource
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, char => char.toUpperCase())
}

function buildWpPath(template: string, formId: number) {
  return template.replaceAll('{formId}', String(formId))
}

function buildBookingPath(template: string, calendarId: number, eventId: number) {
  return template
    .replaceAll('{calendarId}', String(calendarId))
    .replaceAll('{eventId}', String(eventId))
}

function getWordPressAuthHeader(siteKey: WordPressSiteKey) {
  const { authMode, username, appPassword } = getWordPressAuthCredentials(siteKey)

  if (authMode !== 'application_password') {
    throw new Error(`Unsupported WP_AUTH_MODE: ${authMode}`)
  }

  const token = Buffer.from(`${username}:${appPassword}`).toString('base64')

  return `Basic ${token}`
}

async function fetchWordPress<T>(path: string, options: WordPressFetchOptions = {}) {
  const siteKey = options.siteKey ?? 'connectCarfit'
  const headers = new Headers(options.headers)

  if (options.auth ?? true) {
    headers.set('Authorization', getWordPressAuthHeader(siteKey))
  }

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const startedAt = Date.now()
  const response = await fetch(`${getWordPressApiUrl(siteKey)}${path}`, {
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

function toBooleanFlag(value: unknown) {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'number') {
    return value !== 0
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()

    if (['1', 'true', 'yes', 'on', 'required'].includes(normalized)) {
      return true
    }

    if (['0', 'false', 'no', 'off', ''].includes(normalized)) {
      return false
    }
  }

  return false
}

function getValidationRequired(
  fieldSettings: Record<string, any> | undefined,
  attributes?: Record<string, any> | undefined
) {
  return (
    toBooleanFlag(fieldSettings?.validation_rules?.required?.value) ||
    toBooleanFlag(fieldSettings?.required) ||
    toBooleanFlag(attributes?.required) ||
    toBooleanFlag(attributes?.['aria-required'])
  )
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
        label: getFirstNonEmptyString(
          part?.settings?.label,
          part?.settings?.admin_field_label,
          formatFallbackLabel(part?.attributes?.name, 'Name')
        ),
        placeholder: part?.attributes?.placeholder ? String(part.attributes.placeholder) : undefined,
        required: getValidationRequired(part?.settings, part?.attributes)
      }))
      .filter(part => part.name && part.label)

    return {
      type: 'name',
      name: String(attributes.name ?? 'names'),
      label: getFirstNonEmptyString(
        settings.label,
        settings.admin_field_label,
        formatFallbackLabel(attributes.name, 'Name')
      ),
      required: parts.some(part => part.required),
      parts
    }
  }

  if (element === 'input_email' || element === 'input_text') {
    const mask = getFirstNonEmptyString(attributes['data-mask'], settings.temp_mask)

    return {
      type: element === 'input_email' ? 'email' : mask ? 'mask' : 'text',
      name: String(attributes.name ?? ''),
      label: getFirstNonEmptyString(
        settings.label,
        settings.admin_field_label,
        formatFallbackLabel(attributes.name)
      ),
      placeholder: attributes.placeholder ? String(attributes.placeholder) : undefined,
      required: getValidationRequired(settings, attributes),
      mask: mask || undefined,
      reverseMask: settings['data-mask-reverse'] === 'yes',
      clearIfNotMatch: settings['data-clear-if-not-match'] === 'yes'
    }
  }

  if (
    element === 'input_number' ||
    element === 'input_url' ||
    element === 'input_password' ||
    element === 'phone' ||
    element === 'input_date' ||
    element === 'color_picker'
  ) {
    const fieldType =
      element === 'input_number'
        ? 'number'
        : element === 'input_url'
          ? 'url'
          : element === 'input_password'
            ? 'password'
            : element === 'phone'
              ? 'tel'
              : element === 'input_date'
                ? 'date'
                : 'color'

    return {
      type: fieldType,
      name: String(attributes.name ?? ''),
      label: getFirstNonEmptyString(
        settings.label,
        settings.admin_field_label,
        formatFallbackLabel(attributes.name)
      ),
      placeholder: attributes.placeholder ? String(attributes.placeholder) : undefined,
      required: getValidationRequired(settings, attributes)
    }
  }

  if (element === 'textarea') {
    return {
      type: 'textarea',
      name: String(attributes.name ?? ''),
      label: getFirstNonEmptyString(
        settings.label,
        settings.admin_field_label,
        formatFallbackLabel(attributes.name)
      ),
      placeholder: attributes.placeholder ? String(attributes.placeholder) : undefined,
      required: getValidationRequired(settings, attributes),
      rows: typeof attributes.rows === 'number' ? attributes.rows : 4
    }
  }

  if (element === 'address') {
    const orderedParts = Array.isArray(settings.field_order)
      ? settings.field_order
          .map((item: any) => String(item?.value ?? ''))
          .filter(Boolean)
      : Object.keys(field?.fields ?? {})

    const parts = orderedParts
      .map((partKey: string) => {
        const part = field?.fields?.[partKey]

        if (!part || part?.settings?.visible === false) {
          return null
        }

        const partOptions =
          part?.element === 'select_country' ? normalizeOptions(part?.options) : undefined

        return {
          name: String(part?.attributes?.name ?? partKey),
          label: getFirstNonEmptyString(
            part?.settings?.label,
            part?.settings?.admin_field_label,
            formatFallbackLabel(part?.attributes?.name ?? partKey, 'Address Field')
          ),
          placeholder: part?.attributes?.placeholder
            ? String(part.attributes.placeholder)
            : undefined,
          required: getValidationRequired(part?.settings, part?.attributes),
          type: part?.element === 'select_country' ? 'select' : 'text',
          options: partOptions && partOptions.length > 0 ? partOptions : undefined
        }
      })
      .filter(
        (
          part: {
            name: string
            label: string
            placeholder?: string
            required: boolean
            type?: 'text' | 'select'
            options?: Array<{ label: string; value: string }>
          } | null
        ): part is {
          name: string
          label: string
          placeholder?: string
          required: boolean
          type?: 'text' | 'select'
          options?: Array<{ label: string; value: string }>
        } => Boolean(part)
      )

    return {
      type: 'address',
      name: String(attributes.name ?? 'address'),
      label: getFirstNonEmptyString(
        settings.label,
        settings.admin_field_label,
        formatFallbackLabel(attributes.name, 'Address')
      ),
      required: parts.some((part: { required: boolean }) => part.required),
      parts
    }
  }

  if (element === 'fcal_booking') {
    return {
      type: 'booking',
      name: String(attributes.name ?? 'fcal_booking'),
      label: getFirstNonEmptyString(
        settings.label,
        settings.admin_field_label,
        formatFallbackLabel(attributes.name, 'Booking')
      ),
      required: getValidationRequired(settings, attributes),
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
      label: getFirstNonEmptyString(
        settings.label,
        settings.admin_field_label,
        formatFallbackLabel(attributes.name)
      ),
      required: getValidationRequired(settings, attributes),
      multiple: Boolean(attributes.multiple),
      options
    }
  }

  if (element === 'input_checkbox' || element === 'checkbox') {
    const options = getFieldOptions(field, settings)

    return {
      type: 'checkbox',
      name: String(attributes.name ?? ''),
      label: getFirstNonEmptyString(
        settings.label,
        settings.admin_field_label,
        formatFallbackLabel(attributes.name)
      ),
      required: getValidationRequired(settings, attributes),
      options
    }
  }

  if (element === 'select_country') {
    const options = normalizeOptions(field?.options)

    return {
      type: 'select',
      name: String(attributes.name ?? ''),
      label: getFirstNonEmptyString(
        settings.label,
        settings.admin_field_label,
        formatFallbackLabel(attributes.name)
      ),
      required: getValidationRequired(settings, attributes),
      options
    }
  }

  if (element === 'ratings') {
    const options = normalizeOptions(field?.options)

    return {
      type: 'radio',
      name: String(attributes.name ?? ''),
      label: getFirstNonEmptyString(
        settings.label,
        settings.admin_field_label,
        formatFallbackLabel(attributes.name)
      ),
      required: getValidationRequired(settings, attributes),
      options
    }
  }

  if (element === 'net_promoter_score') {
    const options = normalizeOptions(field?.options)

    return {
      type: 'radio',
      name: String(attributes.name ?? ''),
      label: getFirstNonEmptyString(
        settings.label,
        settings.admin_field_label,
        formatFallbackLabel(attributes.name)
      ),
      required: getValidationRequired(settings, attributes),
      options
    }
  }

  if (element === 'rangeslider') {
    return {
      type: 'number',
      name: String(attributes.name ?? ''),
      label: getFirstNonEmptyString(
        settings.label,
        settings.admin_field_label,
        formatFallbackLabel(attributes.name)
      ),
      placeholder: attributes.placeholder ? String(attributes.placeholder) : undefined,
      required: getValidationRequired(settings, attributes)
    }
  }

  if (element === 'gdpr_agreement') {
    return {
      type: 'gdpr',
      name: String(attributes.name ?? ''),
      label: getFirstNonEmptyString(
        settings.label,
        settings.admin_field_label,
        formatFallbackLabel(attributes.name, 'Agreement')
      ),
      required: getValidationRequired(settings, attributes),
      description: settings.tnc_html ? String(settings.tnc_html) : undefined
    }
  }

  if (element === 'custom_html') {
    return {
      type: 'html',
      name: field?.uniqElKey ? String(field.uniqElKey) : 'custom_html',
      html: String(settings.html_codes ?? '')
    }
  }

  if (element === 'section_break') {
    return {
      type: 'section',
      name: field?.uniqElKey ? String(field.uniqElKey) : 'section_break',
      label: getFirstNonEmptyString(
        settings.label,
        settings.admin_field_label,
        'Section'
      ),
      description: settings.description ? String(settings.description) : undefined
    }
  }

  if (element === 'input_hidden') {
    return {
      type: 'hidden',
      name: String(attributes.name ?? ''),
      value: String(attributes.value ?? '')
    }
  }

  if (element === 'container') {
    const columns = Array.isArray(field?.columns)
      ? field.columns
          .map((column: any) => {
            const fields = Array.isArray(column?.fields)
              ? column.fields
                  .map((childField: any) => toSupportedField(childField))
                  .filter((childField: FluentFormField | null): childField is FluentFormField =>
                    Boolean(childField)
                  )
              : []

            if (fields.length === 0) {
              return null
            }

            return {
              width:
                typeof column?.width === 'number'
                  ? column.width
                  : typeof column?.width === 'string' && column.width.length > 0
                    ? Number(column.width)
                    : undefined,
              fields
            }
          })
          .filter(
            (
              column: { width?: number; fields: FluentFormField[] } | null
            ): column is { width?: number; fields: FluentFormField[] } => Boolean(column)
          )
      : []

    if (columns.length === 0) {
      return null
    }

    return {
      type: 'container',
      name: field?.uniqElKey ? String(field.uniqElKey) : 'container',
      columns
    }
  }

  return null
}

export async function getFluentFormSchema(
  formId: number,
  siteKey: WordPressSiteKey = 'connectCarfit'
): Promise<FluentFormSchema> {
  const schemaPath = buildWpPath(
    getOptionalEnv('WORDPRESS_FORM_SCHEMA_PATH') ?? DEFAULT_FORM_SCHEMA_PATH,
    formId
  )
  const response = await fetchWordPress<FluentFormsFieldResponse>(schemaPath, { siteKey })

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

function appendSerializedField(
  params: URLSearchParams,
  key: string,
  value: unknown
) {
  if (value === null || value === undefined) {
    return
  }

  if (Array.isArray(value)) {
    value.forEach(item => {
      appendSerializedField(params, `${key}[]`, item)
    })
    return
  }

  if (typeof value === 'object') {
    Object.entries(value).forEach(([childKey, childValue]) => {
      appendSerializedField(params, `${key}[${childKey}]`, childValue)
    })
    return
  }

  params.append(key, String(value))
}

function serializeFluentFormData(data: Record<string, unknown>) {
  const params = new URLSearchParams()

  Object.entries(data).forEach(([key, value]) => {
    appendSerializedField(params, key, value)
  })

  return params.toString()
}

export async function submitFluentForm(
  formId: number,
  data: Record<string, unknown>,
  siteKey: WordPressSiteKey = 'connectCarfit'
) {
  const submitPath = buildWpPath(
    getOptionalEnv('WORDPRESS_FORM_SUBMIT_PATH') ?? DEFAULT_FORM_SUBMIT_PATH,
    formId
  )
  const body = new URLSearchParams({
    form_id: String(formId),
    data: serializeFluentFormData(data)
  })

  return fetchWordPress<Record<string, unknown>>(submitPath, {
    method: 'POST',
    siteKey,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  })
}

export async function getFluentBookingEvent(
  calendarId: number,
  eventId: number,
  siteKey: WordPressSiteKey = 'connectCarfit'
) {
  const path = buildBookingPath(
    `${DEFAULT_BOOKING_BASE_PATH}/calendars/{calendarId}/events/{eventId}`,
    calendarId,
    eventId
  )

  return fetchWordPress<FluentBookingEvent>(path, { siteKey })
}

export async function getFluentBookingAvailability(
  calendarId: number,
  eventId: number,
  siteKey: WordPressSiteKey = 'connectCarfit'
) {
  const path = buildBookingPath(
    `${DEFAULT_BOOKING_BASE_PATH}/calendars/{calendarId}/events/{eventId}/availability`,
    calendarId,
    eventId
  )

  return fetchWordPress<FluentBookingAvailability>(path, { siteKey })
}

export async function getFluentBookingFields(
  calendarId: number,
  eventId: number,
  siteKey: WordPressSiteKey = 'connectCarfit'
) {
  const path = buildBookingPath(
    `${DEFAULT_BOOKING_BASE_PATH}/calendars/{calendarId}/events/{eventId}/booking-fields`,
    calendarId,
    eventId
  )

  return fetchWordPress<FluentBookingFields>(path, { siteKey })
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
