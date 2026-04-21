import type { APIRoute } from 'astro'

import {
  getFluentBookingProxyContext,
  isTextLikeContentType,
  rewriteBookingProxyTextAsset,
  rewriteProxyLocationHeader
} from '@/lib/fluent-booking-proxy'
import { getNumericParam } from '@/lib/wordpress'

export const prerender = false

async function proxyBookingRequest(request: Request, params: Record<string, string | undefined>) {
  const calendarId = getNumericParam(params, 'calendarId')
  const eventId = getNumericParam(params, 'eventId')
  const context = await getFluentBookingProxyContext(calendarId, eventId)
  const incomingUrl = new URL(request.url)
  const requestedPath = params.path ?? ''
  const trimmedPath = requestedPath.replace(/^\/+/, '')
  const upstreamUrl = new URL(`${context.remoteOrigin}/${trimmedPath}`)

  upstreamUrl.search = incomingUrl.search

  const upstreamHeaders = new Headers()
  const accept = request.headers.get('accept')
  const contentType = request.headers.get('content-type')
  const requestedWith = request.headers.get('x-requested-with')

  if (accept) {
    upstreamHeaders.set('Accept', accept)
  }

  if (contentType) {
    upstreamHeaders.set('Content-Type', contentType)
  }

  if (requestedWith) {
    upstreamHeaders.set('X-Requested-With', requestedWith)
  }

  upstreamHeaders.set('Origin', context.remoteOrigin)
  upstreamHeaders.set('Referer', `${context.remoteOrigin}/fb-embed/?event_id=${eventId}`)

  const upstreamResponse = await fetch(upstreamUrl, {
    method: request.method,
    headers: upstreamHeaders,
    body: request.method === 'GET' || request.method === 'HEAD' ? null : await request.arrayBuffer(),
    redirect: 'manual'
  })

  const responseHeaders = new Headers()
  const contentTypeHeader = upstreamResponse.headers.get('content-type')
  const location = upstreamResponse.headers.get('location')

  if (contentTypeHeader) {
    responseHeaders.set('Content-Type', contentTypeHeader)
  }

  responseHeaders.set('Cache-Control', 'no-store')

  if (location) {
    responseHeaders.set(
      'Location',
      rewriteProxyLocationHeader(location, context, incomingUrl.origin)
    )
  }

  if (isTextLikeContentType(contentTypeHeader)) {
    const text = await upstreamResponse.text()
    const rewrittenText = rewriteBookingProxyTextAsset(text, context, incomingUrl.origin)

    return new Response(rewrittenText, {
      status: upstreamResponse.status,
      headers: responseHeaders
    })
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders
  })
}

export const GET: APIRoute = async ({ request, params }) => proxyBookingRequest(request, params)
export const POST: APIRoute = async ({ request, params }) => proxyBookingRequest(request, params)
export const PUT: APIRoute = async ({ request, params }) => proxyBookingRequest(request, params)
export const PATCH: APIRoute = async ({ request, params }) => proxyBookingRequest(request, params)
export const DELETE: APIRoute = async ({ request, params }) => proxyBookingRequest(request, params)
