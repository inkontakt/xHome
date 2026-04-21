import { getFluentBookingEvent } from '@/lib/wordpress'

const ROOT_PATH_PATTERN =
  /(["'=:(\s])\/(wp-admin\/|wp-content\/|wp-includes\/|wp-json(?:\/|[/?])|fb-embed\/|index\.php\?rest_route=|\?fluent-booking=)/g
const ESCAPED_ROOT_PATH_PATTERN =
  /\\\/(wp-admin\/|wp-content\/|wp-includes\/|wp-json(?:\/|[/?])|fb-embed\/|index\.php\?rest_route=|\?fluent-booking=)/g

export type FluentBookingProxyContext = {
  calendarId: number
  eventId: number
  remoteOrigin: string
  proxyBasePath: string
}

export async function getFluentBookingProxyContext(
  calendarId: number,
  eventId: number
): Promise<FluentBookingProxyContext> {
  const event = await getFluentBookingEvent(calendarId, eventId)
  const publicUrl = String(event.calendar_event?.public_url ?? '')

  if (!publicUrl) {
    throw new Error('Missing public booking URL')
  }

  return {
    calendarId,
    eventId,
    remoteOrigin: new URL(publicUrl).origin,
    proxyBasePath: buildBookingProxyPath(calendarId, eventId)
  }
}

export function buildBookingProxyPath(calendarId: number, eventId: number) {
  return `/booking-proxy/${calendarId}/${eventId}`
}

export function buildBookingEmbedUrl(context: FluentBookingProxyContext) {
  const upstreamUrl = new URL(`${context.remoteOrigin}/fb-embed/`)
  upstreamUrl.searchParams.set('event_id', String(context.eventId))
  return upstreamUrl
}

export function isBookingManagementRequest(url: URL) {
  const flow = url.searchParams.get('fluent-booking')
  const meetingHash = url.searchParams.get('meeting_hash')
  const type = url.searchParams.get('type')

  return flow === 'booking' && Boolean(meetingHash) && (type === 'cancel' || type === 'reschedule')
}

export function buildBookingProxyEntryUrl(context: FluentBookingProxyContext, incomingUrl: URL) {
  if (isBookingManagementRequest(incomingUrl)) {
    const upstreamUrl = new URL(`${context.remoteOrigin}/`)
    incomingUrl.searchParams.forEach((value, key) => {
      upstreamUrl.searchParams.set(key, value)
    })
    return upstreamUrl
  }

  const upstreamUrl = buildBookingEmbedUrl(context)
  incomingUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.set(key, value)
  })
  return upstreamUrl
}

export function buildUpstreamReferer(context: FluentBookingProxyContext, request: Request) {
  const fallbackReferer = `${context.remoteOrigin}/fb-embed/?event_id=${context.eventId}`
  const requestUrl = new URL(request.url)
  const localProxyOrigin = `${requestUrl.origin}${context.proxyBasePath}`
  const incomingReferer = request.headers.get('referer')

  if (!incomingReferer) {
    return isBookingManagementRequest(requestUrl)
      ? `${context.remoteOrigin}/${requestUrl.search}`
      : fallbackReferer
  }

  if (incomingReferer.startsWith(localProxyOrigin)) {
    return `${context.remoteOrigin}${incomingReferer.slice(localProxyOrigin.length)}`
  }

  return incomingReferer.replace(requestUrl.origin, context.remoteOrigin)
}

function rewriteCommonProxyText(
  source: string,
  context: FluentBookingProxyContext,
  localOrigin: string
) {
  const proxyBaseUrl = `${localOrigin}${context.proxyBasePath}`
  const escapedRemoteOrigin = context.remoteOrigin.replaceAll('/', '\\/')
  const escapedProxyBaseUrl = proxyBaseUrl.replaceAll('/', '\\/')
  const escapedProxyBasePath = context.proxyBasePath.replaceAll('/', '\\/')

  let output = source.replaceAll(context.remoteOrigin, proxyBaseUrl)
  output = output.replaceAll(escapedRemoteOrigin, escapedProxyBaseUrl)

  output = output.replace(ROOT_PATH_PATTERN, `$1${context.proxyBasePath}/$2`)
  output = output.replace(ESCAPED_ROOT_PATH_PATTERN, `${escapedProxyBasePath}\\/$1`)

  output = output.replaceAll('"baseurl":"/"', `"baseurl":"${context.proxyBasePath}/"`)
  output = output.replaceAll("'baseurl':'/'", `'baseurl':'${context.proxyBasePath}/'`)
  output = output.replaceAll('"baseurl":"\\/"', `"baseurl":"${escapedProxyBasePath}\\/"`)
  output = output.replaceAll("'baseurl':'\\/'", `'baseurl':'${escapedProxyBasePath}\\/'`)

  return output
}

export function rewriteBookingProxyHtml(
  html: string,
  context: FluentBookingProxyContext,
  localOrigin: string
) {
  let output = rewriteCommonProxyText(html, context, localOrigin)

  output = output.replace(
    /<meta[^>]+http-equiv=["']Content-Security-Policy["'][^>]*>/gi,
    ''
  )
  output = output.replace(/<meta[^>]+http-equiv=["']X-Frame-Options["'][^>]*>/gi, '')

  if (/<head[^>]*>/i.test(output)) {
    const baseHref = `${localOrigin}${context.proxyBasePath}/`
    output = output.replace(/<head[^>]*>/i, match => `${match}\n<base href="${baseHref}">`)
  }

  return output
}

export function rewriteBookingProxyTextAsset(
  assetText: string,
  context: FluentBookingProxyContext,
  localOrigin: string
) {
  return rewriteCommonProxyText(assetText, context, localOrigin)
}

export function rewriteProxyLocationHeader(
  location: string,
  context: FluentBookingProxyContext,
  localOrigin: string
) {
  if (location.startsWith(context.remoteOrigin)) {
    return location.replace(context.remoteOrigin, `${localOrigin}${context.proxyBasePath}`)
  }

  if (location.startsWith('/')) {
    return `${localOrigin}${context.proxyBasePath}${location}`
  }

  return location
}

export function isTextLikeContentType(contentType: string | null) {
  if (!contentType) {
    return false
  }

  return (
    contentType.includes('text/html') ||
    contentType.includes('text/css') ||
    contentType.includes('text/plain') ||
    contentType.includes('javascript') ||
    contentType.includes('application/x-javascript') ||
    contentType.includes('application/json')
  )
}
