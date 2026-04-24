import { existsSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'

// @ts-ignore node:sqlite is available in the Node runtime used by this project.
import { DatabaseSync } from 'node:sqlite'

import type { Review, ReviewStats } from '../../new/astro-reviews-package/src/types/review'

type ReviewRow = {
  id: number
  reviewer_name: string | null
  reviewer_img: string | null
  reviewer_url: string | null
  rating: number | null
  review_time: string | null
  reviewer_text: string | null
  platform_name: string | null
  review_approved: number | null
}

type StatsRow = {
  avg_rating: number | null
  total: number
}

const DEFAULT_SQLITE_PATH = 'new/wp-social-ninja-export.sqlite'

const resolveSqlitePath = () => {
  const configuredPath = process.env.SQLITE_PATH?.trim()
  const candidate = configuredPath || DEFAULT_SQLITE_PATH
  const resolvedPath = isAbsolute(candidate) ? candidate : resolve(process.cwd(), candidate)

  return existsSync(resolvedPath) ? resolvedPath : null
}

const mapReview = (row: ReviewRow): Review => ({
  id: Number(row.id),
  reviewerName: String(row.reviewer_name ?? ''),
  reviewerImg: String(row.reviewer_img ?? '').trim() ? `/carfit-review-avatar/${Number(row.id)}` : '',
  reviewerUrl: String(row.reviewer_url ?? ''),
  rating: Number(row.rating ?? 0),
  reviewTime: String(row.review_time ?? ''),
  reviewerText: String(row.reviewer_text ?? ''),
  platformName: String(row.platform_name ?? ''),
  reviewApproved: Number(row.review_approved ?? 1)
})

const withDatabase = <T>(callback: (db: InstanceType<typeof DatabaseSync>) => T): T | null => {
  const sqlitePath = resolveSqlitePath()

  if (!sqlitePath) {
    console.warn(`[carfit-reviews] SQLite file not found at ${DEFAULT_SQLITE_PATH}.`)
    return null
  }

  const db = new DatabaseSync(sqlitePath, { readOnly: true })

  try {
    return callback(db)
  } finally {
    db.close()
  }
}

export const getCarfitSqliteReviews = (limit = 100, offset = 0): Review[] =>
  withDatabase(db => {
    const rows = db
      .prepare(
        `
          SELECT id, reviewer_name, reviewer_img, reviewer_url, rating, review_time, reviewer_text, platform_name, review_approved
          FROM wp_wpsr_reviews
          WHERE review_approved = 1
          ORDER BY datetime(review_time) DESC
          LIMIT ? OFFSET ?
        `
      )
      .all(limit, offset) as ReviewRow[]

    return rows.map(mapReview)
  }) ?? []

export const getCarfitSqliteReviewStats = (): ReviewStats | null =>
  withDatabase(db => {
    const row = db
      .prepare(
        `
          SELECT AVG(rating) AS avg_rating, COUNT(*) AS total
          FROM wp_wpsr_reviews
          WHERE review_approved = 1
        `
      )
      .get() as StatsRow

    const avgRating = row.avg_rating == null ? 0 : Math.round(Number(row.avg_rating) * 10) / 10

    return {
      avgRating,
      totalReviews: Number(row.total)
    }
  })

export const getCarfitSqliteReviewAvatarUrl = (id: string | number): string | null =>
  withDatabase(db => {
    const row = db
      .prepare(
        `
          SELECT reviewer_img
          FROM wp_wpsr_reviews
          WHERE id = ?
          LIMIT 1
        `
      )
      .get(String(id)) as { reviewer_img: string | null } | undefined

    const avatarUrl = row?.reviewer_img?.trim()

    if (!avatarUrl || !/^https?:\/\//i.test(avatarUrl)) {
      return null
    }

    return avatarUrl
  })
