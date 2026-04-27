import { getWpSocialReviewsTemplate } from '@/lib/wordpress'

export const prerender = false

const AVATAR_CACHE_TTL_MS = 5 * 60 * 1000

type AvatarCacheEntry = {
  expiresAt: number
  avatarUrl: string | null
}

const avatarCache = new Map<string, AvatarCacheEntry>()

const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" role="img" aria-label=""><rect width="80" height="80" rx="40" fill="#e8e8e8"/><circle cx="40" cy="32" r="14" fill="#bdbdbd"/><ellipse cx="40" cy="68" rx="24" ry="18" fill="#bdbdbd"/></svg>`

const placeholderResponse = () =>
  new Response(placeholderSvg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  })

const isValidRemoteImageUrl = (value: string) => {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

const getCachedAvatarUrl = async (templateId: number, reviewId: number) => {
  const cacheKey = `${templateId}:${reviewId}`
  const cached = avatarCache.get(cacheKey)

  if (cached && cached.expiresAt > Date.now()) {
    return cached.avatarUrl
  }

  const response = await getWpSocialReviewsTemplate(templateId)
  const review = response.reviews.find(item => item.id === reviewId)
  const avatarUrl = review?.reviewerImg?.trim() ?? ''
  const resolvedAvatarUrl = avatarUrl && isValidRemoteImageUrl(avatarUrl) ? avatarUrl : null

  avatarCache.set(cacheKey, {
    expiresAt: Date.now() + AVATAR_CACHE_TTL_MS,
    avatarUrl: resolvedAvatarUrl
  })

  return resolvedAvatarUrl
}

export async function GET({
  params
}: {
  params: {
    templateId?: string
    reviewId?: string
  }
}) {
  const templateId = Number.parseInt(String(params.templateId ?? ''), 10)
  const reviewId = Number.parseInt(String(params.reviewId ?? ''), 10)

  if (!Number.isInteger(templateId) || templateId <= 0 || !Number.isInteger(reviewId) || reviewId <= 0) {
    return placeholderResponse()
  }

  try {
    const avatarUrl = await getCachedAvatarUrl(templateId, reviewId)

    if (!avatarUrl) {
      return placeholderResponse()
    }

    const avatarResponse = await fetch(avatarUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 Astro WP Social Ninja Reviews',
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
  } catch (error) {
    console.error('[wp-social-review-avatar] Failed to proxy avatar', error)
    return placeholderResponse()
  }
}
