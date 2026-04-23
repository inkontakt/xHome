import { getCarfitSqliteReviewAvatarUrl } from '@/lib/carfit-sqlite-reviews'

export const prerender = false

const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" role="img" aria-label=""><rect width="80" height="80" rx="40" fill="#e8e8e8"/><circle cx="40" cy="32" r="14" fill="#bdbdbd"/><ellipse cx="40" cy="68" rx="24" ry="18" fill="#bdbdbd"/></svg>`

const placeholderResponse = () =>
  new Response(placeholderSvg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  })

export async function GET({ params }: { params: { id?: string } }) {
  const id = params.id?.trim()

  if (!id || !/^\d+$/.test(id)) {
    return placeholderResponse()
  }

  const avatarUrl = getCarfitSqliteReviewAvatarUrl(id)

  if (!avatarUrl) {
    return placeholderResponse()
  }

  try {
    const avatarResponse = await fetch(avatarUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 Carfit Astro Reviews',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    })

    if (!avatarResponse.ok || !avatarResponse.body) {
      return placeholderResponse()
    }

    const contentType = avatarResponse.headers.get('Content-Type') || 'image/jpeg'

    if (!contentType.startsWith('image/')) {
      return placeholderResponse()
    }

    return new Response(avatarResponse.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
      }
    })
  } catch {
    return placeholderResponse()
  }
}
