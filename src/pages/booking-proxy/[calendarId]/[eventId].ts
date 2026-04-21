import type { APIRoute } from 'astro'

import {
  buildBookingProxyEntryUrl,
  getFluentBookingProxyContext,
  rewriteBookingProxyHtml,
  rewriteProxyLocationHeader
} from '@/lib/fluent-booking-proxy'
import { getNumericParam } from '@/lib/wordpress'

export const prerender = false

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const calendarId = getNumericParam(params, 'calendarId')
    const eventId = getNumericParam(params, 'eventId')
    const context = await getFluentBookingProxyContext(calendarId, eventId)
    const incomingUrl = new URL(request.url)
    const upstreamUrl = buildBookingProxyEntryUrl(context, incomingUrl)

    const upstreamResponse = await fetch(upstreamUrl, {
      headers: {
        Accept: 'text/html,application/xhtml+xml'
      }
    })

    const html = await upstreamResponse.text()
    const rewrittenHtml = rewriteBookingProxyHtml(html, context, incomingUrl.origin)
    const responseHeaders = new Headers({
      'Content-Type': upstreamResponse.headers.get('content-type') ?? 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    })
    const location = upstreamResponse.headers.get('location')

    if (location) {
      responseHeaders.set(
        'Location',
        rewriteProxyLocationHeader(location, context, incomingUrl.origin)
      )
    }

    return new Response(rewrittenHtml, {
      status: upstreamResponse.status,
      headers: responseHeaders
    })
  } catch (error) {
    return new Response(
      error instanceof Error ? error.message : 'Unable to render booking proxy',
      { status: 500 }
    )
  }
}
