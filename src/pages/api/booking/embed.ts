import type { APIRoute } from 'astro'

export const prerender = false

const ALLOWED_REMOTE_HOSTS = new Set(['connect.carfit-hamburg.de'])

function badRequest(message: string, status = 400) {
  return new Response(message, { status })
}

function rewriteHtmlDocument(html: string, sourceUrl: URL, localOrigin: string) {
  const baseHref = `${sourceUrl.origin}/`
  const proxyAjaxUrl = `${localOrigin}/api/booking/embed-ajax?origin=${encodeURIComponent(sourceUrl.origin)}`

  let output = html

  if (/<head[^>]*>/i.test(output)) {
    output = output.replace(/<head[^>]*>/i, match => `${match}\n<base href="${baseHref}">`)
  }

  // Remove remote frame restrictions so the proxied document can render inside Astro.
  output = output.replace(
    /<meta[^>]+http-equiv=["']Content-Security-Policy["'][^>]*>/gi,
    ''
  )
  output = output.replace(/<meta[^>]+http-equiv=["']X-Frame-Options["'][^>]*>/gi, '')

  output = output.replace(
    /"ajaxurl":"([^"]+)"/i,
    `"ajaxurl":"${proxyAjaxUrl.replace(/"/g, '&quot;')}"`
  )

  return output
}

export const GET: APIRoute = async ({ request }) => {
  const currentUrl = new URL(request.url)
  const target = currentUrl.searchParams.get('url')

  if (!target) {
    return badRequest('Missing url parameter')
  }

  let remoteUrl: URL

  try {
    remoteUrl = new URL(target)
  } catch {
    return badRequest('Invalid url parameter')
  }

  if (remoteUrl.protocol !== 'https:') {
    return badRequest('Only https URLs are allowed')
  }

  if (!ALLOWED_REMOTE_HOSTS.has(remoteUrl.hostname)) {
    return badRequest('Remote host is not allowed', 403)
  }

  const upstreamResponse = await fetch(remoteUrl, {
    headers: {
      Accept: 'text/html,application/xhtml+xml'
    }
  })

  if (!upstreamResponse.ok) {
    return badRequest(`Upstream request failed with status ${upstreamResponse.status}`, 502)
  }

  const upstreamContentType = upstreamResponse.headers.get('content-type') ?? 'text/html; charset=utf-8'
  const upstreamHtml = await upstreamResponse.text()
  const rewrittenHtml = rewriteHtmlDocument(upstreamHtml, remoteUrl, currentUrl.origin)

  return new Response(rewrittenHtml, {
    status: 200,
    headers: {
      'Content-Type': upstreamContentType,
      'Cache-Control': 'no-store'
    }
  })
}
