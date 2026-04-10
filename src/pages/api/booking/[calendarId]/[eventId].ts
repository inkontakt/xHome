import type { APIRoute } from 'astro'

import {
  getFluentBookingAvailability,
  getFluentBookingEvent,
  getFluentBookingFields,
  getNumericParam,
  jsonResponse
} from '@/lib/wordpress'

export const prerender = false

export const GET: APIRoute = async ({ params }) => {
  try {
    const calendarId = getNumericParam(params, 'calendarId')
    const eventId = getNumericParam(params, 'eventId')

    const [event, availability, fields] = await Promise.all([
      getFluentBookingEvent(calendarId, eventId),
      getFluentBookingAvailability(calendarId, eventId),
      getFluentBookingFields(calendarId, eventId)
    ])

    return jsonResponse({
      calendarId,
      eventId,
      event,
      availability,
      fields
    })
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'Unable to fetch booking data'
      },
      { status: 500 }
    )
  }
}
