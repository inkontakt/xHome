import type { APIRoute } from 'astro'

import { carfitProxiedReviews } from '@/components/carfit/carfit-data'
import {
  getExternalSectionProxyContext,
  isTextLikeContentType,
  resolveExternalProxyAssetUrl,
  rewriteExternalProxyLocationHeader,
  rewriteExternalProxyTextAsset
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

async function proxyExternalSectionRequest(
  request: Request,
  params: Record<string, string | undefined>
) {
  const context = getExternalSectionProxyContext(
    getResolvedReviewsProxyConfig(request),
    PROXY_BASE_PATH
  )
  const incomingUrl = new URL(request.url)
  const requestedPath = params.path ?? ''
  const upstreamUrl = resolveExternalProxyAssetUrl(requestedPath, context)

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
  upstreamHeaders.set('Referer', context.sourceUrl)

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
      rewriteExternalProxyLocationHeader(location, context, incomingUrl.origin)
    )
  }

  if (isTextLikeContentType(contentTypeHeader)) {
    const text = await upstreamResponse.text()
    const rewrittenText = rewriteExternalProxyTextAsset(text, context, incomingUrl.origin)

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

export const GET: APIRoute = async ({ request, params }) =>
  proxyExternalSectionRequest(request, params)
export const POST: APIRoute = async ({ request, params }) =>
  proxyExternalSectionRequest(request, params)
