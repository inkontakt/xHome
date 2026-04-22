import { getWordPressPublicSiteUrl } from '@/lib/wordpress-site-config'

const ROOT_PATH_PATTERN =
  /(["'=:(\s])\/(wp-admin\/|wp-content\/|wp-includes\/|wp-json(?:\/|[/?])|ff-embed\/|index\.php\?rest_route=)/g
const ESCAPED_ROOT_PATH_PATTERN =
  /\\\/(wp-admin\/|wp-content\/|wp-includes\/|wp-json(?:\/|[/?])|ff-embed\/|index\.php\?rest_route=)/g

export type FluentFormProxyContext = {
  formId: number
  remoteOrigin: string
  proxyBasePath: string
  publicUrl: string
}

export async function getFluentFormProxyContext(formId: number): Promise<FluentFormProxyContext> {
  const remoteOrigin = getWordPressPublicSiteUrl('connectCarfit')
  const publicUrl = `${remoteOrigin}/ff-embed/?form_id=${formId}`

  return {
    formId,
    remoteOrigin,
    proxyBasePath: buildFluentFormProxyPath(formId),
    publicUrl
  }
}

export function buildFluentFormProxyPath(formId: number) {
  return `/form-proxy/${formId}`
}

export function buildFluentFormEmbedUrl(context: FluentFormProxyContext) {
  return new URL(context.publicUrl)
}

function rewriteCommonProxyText(
  source: string,
  context: FluentFormProxyContext,
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

export function rewriteFluentFormProxyHtml(
  html: string,
  context: FluentFormProxyContext,
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

export function rewriteFluentFormProxyTextAsset(
  assetText: string,
  context: FluentFormProxyContext,
  localOrigin: string
) {
  return rewriteCommonProxyText(assetText, context, localOrigin)
}

export function rewriteFormProxyLocationHeader(
  location: string,
  context: FluentFormProxyContext,
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

export function buildFluentFormUpstreamReferer(context: FluentFormProxyContext, request: Request) {
  const fallbackReferer = context.publicUrl
  const requestUrl = new URL(request.url)
  const localProxyOrigin = `${requestUrl.origin}${context.proxyBasePath}`
  const incomingReferer = request.headers.get('referer')

  if (!incomingReferer) {
    return fallbackReferer
  }

  if (incomingReferer.startsWith(localProxyOrigin)) {
    return `${context.remoteOrigin}${incomingReferer.slice(localProxyOrigin.length)}`
  }

  return incomingReferer.replace(requestUrl.origin, context.remoteOrigin)
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
