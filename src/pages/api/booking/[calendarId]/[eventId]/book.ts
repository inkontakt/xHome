import type { APIRoute } from 'astro'

import { getFluentBookingEvent, getNumericParam, jsonResponse } from '@/lib/wordpress'

export const prerender = false

type BookingPayload = Record<string, string | string[]>

function appendFormValue(body: URLSearchParams, key: string, value: string | string[]) {
  if (Array.isArray(value)) {
    value.forEach(item => body.append(`${key}[]`, item))
    return
  }

  body.set(key, value)
}

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const calendarId = getNumericParam(params, 'calendarId')
    const eventId = getNumericParam(params, 'eventId')
    const payload = (await request.json()) as BookingPayload
    const event = await getFluentBookingEvent(calendarId, eventId)
    const publicUrl = String(event.calendar_event?.public_url ?? '')

    if (!publicUrl) {
      throw new Error('Missing public booking URL')
    }

    const origin = new URL(publicUrl).origin
    const body = new URLSearchParams()

    body.set('action', 'fluent_cal_schedule_meeting')
    body.set('event_id', String(eventId))
    body.set('source_url', publicUrl)

    Object.entries(payload).forEach(([key, value]) => {
      appendFormValue(body, key, value)
    })

    const response = await fetch(`${origin}/wp-admin/admin-ajax.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    })

    const result = (await response.json()) as Record<string, unknown>

    return jsonResponse(result, { status: response.status })
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'Unable to create booking'
      },
      { status: 500 }
    )
  }
}
