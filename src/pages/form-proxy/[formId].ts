import type { APIRoute } from 'astro'

import {
  buildFluentFormEmbedUrl,
  getFluentFormProxyContext,
  rewriteFluentFormProxyHtml,
  rewriteFormProxyLocationHeader
} from '@/lib/fluent-form-proxy'
import { getNumericFormId } from '@/lib/wordpress'

export const prerender = false

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const formId = getNumericFormId(params)
    const context = await getFluentFormProxyContext(formId)
    const upstreamUrl = buildFluentFormEmbedUrl(context)
    const incomingUrl = new URL(request.url)

    incomingUrl.searchParams.forEach((value, key) => {
      upstreamUrl.searchParams.set(key, value)
    })

    const upstreamResponse = await fetch(upstreamUrl, {
      headers: {
        Accept: 'text/html,application/xhtml+xml'
      },
      redirect: 'manual'
    })

    const html = await upstreamResponse.text()
    const rewrittenHtml = rewriteFluentFormProxyHtml(html, context, incomingUrl.origin)
    const responseHeaders = new Headers({
      'Content-Type': upstreamResponse.headers.get('content-type') ?? 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    })
    const location = upstreamResponse.headers.get('location')

    if (location) {
      responseHeaders.set(
        'Location',
        rewriteFormProxyLocationHeader(location, context, incomingUrl.origin)
      )
    }

    return new Response(rewrittenHtml, {
      status: upstreamResponse.status,
      headers: responseHeaders
    })
  } catch (error) {
    return new Response(
      error instanceof Error ? error.message : 'Unable to render form proxy',
      { status: 500 }
    )
  }
}
