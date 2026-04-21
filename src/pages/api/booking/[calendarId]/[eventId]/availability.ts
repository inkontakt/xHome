import type { APIRoute } from 'astro'

import { getFluentBookingEvent, getNumericParam, jsonResponse } from '@/lib/wordpress'

export const prerender = false

function getMonthStart(rawValue: string | null) {
  if (!rawValue) {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
    throw new Error('Invalid month start date')
  }

  return rawValue
}

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const calendarId = getNumericParam(params, 'calendarId')
    const eventId = getNumericParam(params, 'eventId')
    const currentUrl = new URL(request.url)
    const startDate = getMonthStart(currentUrl.searchParams.get('startDate'))
    const timezone = currentUrl.searchParams.get('timezone') ?? ''
    const duration = currentUrl.searchParams.get('duration') ?? ''

    const event = await getFluentBookingEvent(calendarId, eventId)
    const publicUrl = String(event.calendar_event?.public_url ?? '')

    if (!publicUrl) {
      throw new Error('Missing public booking URL')
    }

    const origin = new URL(publicUrl).origin
    const upstreamUrl = new URL(`${origin}/wp-admin/admin-ajax.php`)
    upstreamUrl.searchParams.set('action', 'fluent_cal_get_available_dates')
    upstreamUrl.searchParams.set('event_id', String(eventId))
    upstreamUrl.searchParams.set('timezone', timezone)
    upstreamUrl.searchParams.set('duration', duration)
    upstreamUrl.searchParams.set('start_date', startDate)

    const response = await fetch(upstreamUrl)
    const payload = (await response.json()) as Record<string, unknown>

    return jsonResponse(payload, { status: response.status })
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'Unable to fetch booking availability'
      },
      { status: 500 }
    )
  }
}
