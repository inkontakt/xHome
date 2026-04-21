import type { APIRoute } from 'astro'

export const prerender = false

const ALLOWED_REMOTE_HOSTS = new Set(['connect.carfit-hamburg.de'])

function getAllowedOrigin(value: string | null) {
  if (!value) {
    return null
  }

  try {
    const originUrl = new URL(value)

    if (originUrl.protocol !== 'https:' || !ALLOWED_REMOTE_HOSTS.has(originUrl.hostname)) {
      return null
    }

    return originUrl.origin
  } catch {
    return null
  }
}

async function proxyAjaxRequest(request: Request) {
  const currentUrl = new URL(request.url)
  const origin = getAllowedOrigin(currentUrl.searchParams.get('origin'))

  if (!origin) {
    return new Response('Invalid origin parameter', { status: 400 })
  }

  const upstreamUrl = new URL(`${origin}/wp-admin/admin-ajax.php`)
  const requestHeaders = new Headers()
  const contentType = request.headers.get('content-type')

  if (contentType) {
    requestHeaders.set('Content-Type', contentType)
  }

  currentUrl.searchParams.forEach((value, key) => {
    if (key === 'origin') {
      return
    }

    upstreamUrl.searchParams.append(key, value)
  })

  const upstreamResponse = await fetch(upstreamUrl, {
    method: request.method,
    headers: requestHeaders,
    body: request.method === 'GET' || request.method === 'HEAD' ? null : await request.arrayBuffer()
  })

  const responseHeaders = new Headers()
  const upstreamContentType = upstreamResponse.headers.get('content-type')

  if (upstreamContentType) {
    responseHeaders.set('Content-Type', upstreamContentType)
  }

  responseHeaders.set('Cache-Control', 'no-store')

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders
  })
}

export const GET: APIRoute = async ({ request }) => proxyAjaxRequest(request)
export const POST: APIRoute = async ({ request }) => proxyAjaxRequest(request)
