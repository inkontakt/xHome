import type { APIRoute } from 'astro'

import { safeDownloadFileName } from '@/lib/estimate-files'

export const GET: APIRoute = async ({ url }) => {
  const startedAt = Date.now()
  const fileUrl = url.searchParams.get('url')
  const isDownload = url.searchParams.get('download') === '1'
  const requestedFilename = url.searchParams.get('filename')

  if (!fileUrl) {
    return new Response(JSON.stringify({ error: 'Missing url parameter.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
    return new Response(JSON.stringify({ error: 'Invalid url parameter.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const upstreamResponse = await fetch(fileUrl)
    const durationMs = Date.now() - startedAt

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      if (durationMs >= 3000) {
        console.warn('[pdf] slow-fetch', {
          ms: durationMs,
          status: upstreamResponse.status,
          url: fileUrl
        })
      }

      return new Response(JSON.stringify({ error: 'Unable to fetch PDF.' }), {
        status: upstreamResponse.status || 502,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const headers = new Headers(upstreamResponse.headers)

    if (isDownload) {
      const fileName = safeDownloadFileName(requestedFilename, 'document.pdf')
      headers.set('content-disposition', `attachment; filename="${fileName}"`)
    } else {
      headers.set('content-disposition', 'inline')
    }

    headers.set('cache-control', 'public, max-age=600, stale-while-revalidate=86400')

    if (!headers.get('content-type')) {
      headers.set('content-type', 'application/pdf')
    }

    if (durationMs >= 3000) {
      console.warn('[pdf] slow-fetch', {
        ms: durationMs,
        status: upstreamResponse.status,
        url: fileUrl,
        size: headers.get('content-length')
      })
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers
    })
  } catch (error) {
    console.error('[pdf] fetch-failed', error)

    return new Response(JSON.stringify({ error: 'Unable to fetch PDF.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
