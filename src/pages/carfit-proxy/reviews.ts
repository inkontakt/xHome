import type { APIRoute } from 'astro'

import { carfitProxiedReviews } from '@/components/carfit/carfit-data'
import {
  extractConfiguredSection,
  getExternalSectionProxyContext,
  rewriteExternalProxyHtml,
  rewriteExternalProxyLocationHeader
} from '@/lib/external-section-proxy'

export const prerender = false

const PROXY_BASE_PATH = '/carfit-proxy/reviews'

function getResolvedReviewsProxyConfig(request: Request) {
  const url = new URL(request.url)
  const templateId = url.searchParams.get('templateId') ?? ''

  return {
    ...carfitProxiedReviews,
    templateId
  }
}

export const GET: APIRoute = async ({ request }) => {
  try {
    const context = getExternalSectionProxyContext(
      getResolvedReviewsProxyConfig(request),
      PROXY_BASE_PATH
    )
    const incomingUrl = new URL(request.url)

    const upstreamResponse = await fetch(context.sourceUrl, {
      headers: {
        Accept: 'text/html,application/xhtml+xml'
      },
      redirect: 'manual'
    })

    const html = await upstreamResponse.text()
    const sectionHtml = extractConfiguredSection(html, context.sectionSelector)
    const rewrittenHtml = rewriteExternalProxyHtml(sectionHtml, context, incomingUrl.origin)
    const responseHeaders = new Headers({
      'Content-Type': upstreamResponse.headers.get('content-type') ?? 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    })
    const location = upstreamResponse.headers.get('location')

    if (location) {
      responseHeaders.set(
        'Location',
        rewriteExternalProxyLocationHeader(location, context, incomingUrl.origin)
      )
    }

    return new Response(rewrittenHtml, {
      status: upstreamResponse.status,
      headers: responseHeaders
    })
  } catch (error) {
    return new Response(
      error instanceof Error ? error.message : 'Unable to render external reviews proxy',
      { status: 500 }
    )
  }
}
