import { getFluentBookingEvent } from '@/lib/wordpress'

const ROOT_PATH_PATTERN =
  /(["'=:(\s])\/(wp-admin\/|wp-content\/|wp-includes\/|wp-json(?:\/|[/?])|fb-embed\/|index\.php\?rest_route=)/g

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
  upstreamUrl.searchParams.set('calendar_id', String(context.calendarId))
  upstreamUrl.searchParams.set('event_id', String(context.eventId))
  upstreamUrl.searchParams.set('mode', 'calendar')
  return upstreamUrl
}

function rewriteCommonProxyText(
  source: string,
  context: FluentBookingProxyContext,
  localOrigin: string
) {
  const proxyBaseUrl = `${localOrigin}${context.proxyBasePath}`

  let output = source.replaceAll(context.remoteOrigin, proxyBaseUrl)

  output = output.replace(ROOT_PATH_PATTERN, `$1${context.proxyBasePath}/$2`)

  output = output.replaceAll('"baseurl":"/"', `"baseurl":"${context.proxyBasePath}/"`)
  output = output.replaceAll("'baseurl':'/'", `'baseurl':'${context.proxyBasePath}/'`)

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
    contentType.includes('javascript') ||
    contentType.includes('application/x-javascript')
  )
}
