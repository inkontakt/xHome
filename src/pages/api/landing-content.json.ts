import type { APIRoute } from 'astro'
import { loadLandingContent } from '@/lib/loaders/landing-sections-loader'

export const GET: APIRoute = async () => {
  try {
    const content = await loadLandingContent()
    return new Response(JSON.stringify(content), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  } catch (error) {
    console.error('Error loading landing content:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to load landing content' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
