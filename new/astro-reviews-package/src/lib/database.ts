import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Database as BetterDatabase } from 'better-sqlite3';
import type {
  Review,
  ReviewStats,
  ReviewTemplateConfig,
  TemplateReviewsOptions,
} from '../types/review.js';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

let db: BetterDatabase | null = null;
let warnedMissingDb = false;

/** Absolute path to bundled `sample-reviews.json`. */
function samplePath(): string {
  return join(__dirname, '../data/sample-reviews.json');
}

/**
 * Resolve the SQLite file: honours `SQLITE_PATH`, then searches common paths
 * relative to `process.cwd()` (project root, parent, grandparent).
 */
function resolveSqlitePath(): string | null {
  const configured = process.env.SQLITE_PATH?.trim();
  const candidates: string[] = [];
  if (configured) {
    candidates.push(isAbsolute(configured) ? configured : resolve(process.cwd(), configured));
  }
  candidates.push(
    resolve(process.cwd(), 'new', 'wp-social-ninja-export.sqlite'),
    resolve(process.cwd(), 'wp-social-ninja-export.sqlite'),
    resolve(process.cwd(), '..', 'wp-social-ninja-export.sqlite'),
    resolve(process.cwd(), '..', '..', 'wp-social-ninja-export.sqlite'),
  );
  const seen = new Set<string>();
  for (const p of candidates) {
    if (seen.has(p)) continue;
    seen.add(p);
    if (existsSync(p)) return p;
  }
  return null;
}

/** Load fallback reviews when SQLite is unavailable or fails to open. */
function loadSampleReviews(): Review[] {
  const raw = readFileSync(samplePath(), 'utf8');
  return JSON.parse(raw) as Review[];
}

/** True when export script created `wpsr_review_avatar_urls` (preferred avatar URLs). */
function hasAvatarUrlTable(connection: BetterDatabase): boolean {
  const row = connection
    .prepare(
      `SELECT 1 AS ok FROM sqlite_master WHERE type = 'table' AND name = 'wpsr_review_avatar_urls' LIMIT 1`,
    )
    .get() as { ok: number } | undefined;
  return !!row;
}

/** Map a `wp_wpsr_reviews` row to the public `Review` shape (camelCase). */
function mapRow(r: Record<string, unknown>): Review {
  return {
    id: Number(r.id),
    reviewerName: String(r.reviewer_name ?? ''),
    reviewerImg: String(r.reviewer_img ?? ''),
    reviewerUrl: String(r.reviewer_url ?? ''),
    rating: Number(r.rating ?? 0),
    reviewTime: String(r.review_time ?? ''),
    reviewerText: String(r.reviewer_text ?? ''),
    platformName: String(r.platform_name ?? ''),
    reviewApproved: Number(r.review_approved ?? 1),
  };
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : [];
}

function asNumberArray(value: unknown): number[] {
  return Array.isArray(value)
    ? value.map((item) => Number(item)).filter((item) => Number.isInteger(item))
    : [];
}

function truthyWpBoolean(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function templateLimit(config: ReviewTemplateConfig | null, device: 'desktop' | 'mobile'): number {
  const responsiveLimit = Number(config?.totalReviewsNumber?.[device]);
  if (Number.isFinite(responsiveLimit) && responsiveLimit > 0) return responsiveLimit;

  const totalReviewsVal = Number(config?.totalReviewsVal);
  if (Number.isFinite(totalReviewsVal) && totalReviewsVal > 0) return totalReviewsVal;

  return 50;
}

function templateOrder(config: ReviewTemplateConfig | null): string {
  const order = String(config?.order ?? 'desc').toLowerCase();
  if (order === 'asc') return 'datetime(r.review_time) ASC';
  if (order === 'random') return 'RANDOM()';
  return 'datetime(r.review_time) DESC';
}

function buildTemplateWhere(config: ReviewTemplateConfig | null): { clauses: string[]; params: unknown[] } {
  const clauses = ['r.review_approved = 1'];
  const params: unknown[] = [];

  const platforms = asStringArray(config?.platform);
  if (platforms.length) {
    clauses.push(`r.platform_name IN (${platforms.map(() => '?').join(', ')})`);
    params.push(...platforms);
  }

  const starFilterVal = Number(config?.starFilterVal ?? -1);
  if (Number.isFinite(starFilterVal) && starFilterVal !== -1) {
    clauses.push('r.rating >= ?');
    params.push(starFilterVal);
  }

  if (truthyWpBoolean(config?.hide_empty_reviews)) {
    clauses.push("COALESCE(TRIM(r.reviewer_text), '') != ''");
  }

  const selectedBusinesses = asStringArray(config?.selectedBusinesses);
  if (selectedBusinesses.length) {
    clauses.push(`r.source_id IN (${selectedBusinesses.map(() => '?').join(', ')})`);
    params.push(...selectedBusinesses);
  }

  const filterByTitle = config?.filterByTitle ?? 'all';
  const includeIds = asNumberArray(config?.selectedIncList);
  const excludeIds = asNumberArray(config?.selectedExcList);
  if (filterByTitle === 'include' && includeIds.length) {
    clauses.push(`r.id IN (${includeIds.map(() => '?').join(', ')})`);
    params.push(...includeIds);
  }
  if (filterByTitle === 'exclude' && excludeIds.length) {
    clauses.push(`r.id NOT IN (${excludeIds.map(() => '?').join(', ')})`);
    params.push(...excludeIds);
  }

  const selectedCategories = asStringArray(config?.selectedCategories);
  if (selectedCategories.length) {
    clauses.push(`r.category IN (${selectedCategories.map(() => '?').join(', ')})`);
    params.push(...selectedCategories);
  }

  return { clauses, params };
}

function reviewSelectSql(connection: BetterDatabase, whereSql: string, orderSql: string): string {
  const joinAvatars = hasAvatarUrlTable(connection);
  return joinAvatars
    ? `
    SELECT r.id, r.reviewer_name,
           COALESCE(NULLIF(TRIM(av.display_avatar_url), ''), r.reviewer_img) AS reviewer_img,
           r.reviewer_url, r.rating, r.review_time, r.reviewer_text, r.platform_name, r.review_approved
    FROM wp_wpsr_reviews r
    LEFT JOIN wpsr_review_avatar_urls av ON av.review_row_id = r.id
    WHERE ${whereSql}
    ORDER BY ${orderSql}
    LIMIT ? OFFSET ?
  `
    : `
    SELECT r.id, r.reviewer_name, r.reviewer_img, r.reviewer_url, r.rating, r.review_time,
           r.reviewer_text, r.platform_name, r.review_approved
    FROM wp_wpsr_reviews r
    WHERE ${whereSql}
    ORDER BY ${orderSql}
    LIMIT ? OFFSET ?
  `;
}

/** Open the SQLite database (read-only). Returns null if no file resolves or open fails. */
export function getDb(): BetterDatabase | null {
  if (db) return db;
  const path = resolveSqlitePath();
  if (!path) {
    if (!warnedMissingDb) {
      console.warn(
        '[astro-reviews] No SQLite file resolved. Using sample-reviews.json. Set SQLITE_PATH or place wp-social-ninja-export.sqlite near the project cwd.',
      );
      warnedMissingDb = true;
    }
    return null;
  }
  try {
    const Database = require('better-sqlite3') as typeof import('better-sqlite3');
    db = new Database(path, { readonly: true, fileMustExist: true });
    return db;
  } catch (e) {
    console.warn('[astro-reviews] Failed to open SQLite; using sample data.', e);
    return null;
  }
}

/** Approved reviews (`review_approved = 1`), newest first; falls back to `sample-reviews.json`. */
export function getReviews(limit = 10, offset = 0): Review[] {
  const connection = getDb();
  if (!connection) {
    return loadSampleReviews().slice(offset, offset + limit);
  }
  const joinAvatars = hasAvatarUrlTable(connection);
  const sql = joinAvatars
    ? `
    SELECT r.id, r.reviewer_name,
           COALESCE(NULLIF(TRIM(av.display_avatar_url), ''), r.reviewer_img) AS reviewer_img,
           r.reviewer_url, r.rating, r.review_time, r.reviewer_text, r.platform_name, r.review_approved
    FROM wp_wpsr_reviews r
    LEFT JOIN wpsr_review_avatar_urls av ON av.review_row_id = r.id
    WHERE r.review_approved = 1
    ORDER BY datetime(r.review_time) DESC
    LIMIT ? OFFSET ?
  `
    : `
    SELECT id, reviewer_name, reviewer_img, reviewer_url, rating, review_time, reviewer_text, platform_name, review_approved
    FROM wp_wpsr_reviews
    WHERE review_approved = 1
    ORDER BY datetime(review_time) DESC
    LIMIT ? OFFSET ?
  `;
  const stmt = connection.prepare(sql.trim());
  const rows = stmt.all(limit, offset) as Record<string, unknown>[];
  return rows.map(mapRow);
}

/** WP Social Ninja template config stored in `wp_postmeta._wpsr_template_config`. */
export function getReviewTemplateConfig(templateId: number): ReviewTemplateConfig | null {
  const connection = getDb();
  if (!connection) return null;

  const row = connection
    .prepare(
      `
    SELECT meta_value
    FROM wp_postmeta
    WHERE post_id = ? AND meta_key = '_wpsr_template_config'
    LIMIT 1
  `,
    )
    .get(templateId) as { meta_value: string } | undefined;

  if (!row?.meta_value) return null;

  try {
    return JSON.parse(row.meta_value) as ReviewTemplateConfig;
  } catch {
    return null;
  }
}

/** Reviews filtered like a WP Social Ninja reviews template. */
export function getReviewsForTemplate(
  templateId: number,
  options: TemplateReviewsOptions = {},
): Review[] {
  const connection = getDb();
  if (!connection) {
    const limit = options.limit ?? 50;
    return loadSampleReviews().slice(options.offset ?? 0, (options.offset ?? 0) + limit);
  }

  const config = getReviewTemplateConfig(templateId);
  const limit = options.limit ?? templateLimit(config, options.device ?? 'desktop');
  const offset = options.offset ?? 0;
  const { clauses, params } = buildTemplateWhere(config);
  const sql = reviewSelectSql(connection, clauses.join(' AND '), templateOrder(config));
  const rows = connection.prepare(sql.trim()).all(...params, limit, offset) as Record<string, unknown>[];
  return rows.map(mapRow);
}

/** Average rating and total count for the optional gallery header. */
export function getReviewStats(): ReviewStats {
  const connection = getDb();
  if (!connection) {
    const all = loadSampleReviews();
    const n = all.length;
    const sum = all.reduce((a, r) => a + r.rating, 0);
    return { avgRating: n ? Math.round((sum / n) * 10) / 10 : 0, totalReviews: n };
  }
  const row = connection
    .prepare(
      `
    SELECT AVG(rating) AS avg_rating, COUNT(*) AS total
    FROM wp_wpsr_reviews
    WHERE review_approved = 1
  `,
    )
    .get() as { avg_rating: number | null; total: number };
  const avg = row.avg_rating == null ? 0 : Math.round(Number(row.avg_rating) * 10) / 10;
  return { avgRating: avg, totalReviews: Number(row.total) };
}

/** Average/count for the same filtered review set used by `getReviewsForTemplate()`. */
export function getReviewStatsForTemplate(templateId: number): ReviewStats {
  const connection = getDb();
  if (!connection) return getReviewStats();

  const config = getReviewTemplateConfig(templateId);
  const { clauses, params } = buildTemplateWhere(config);
  const row = connection
    .prepare(
      `
    SELECT AVG(r.rating) AS avg_rating, COUNT(*) AS total
    FROM wp_wpsr_reviews r
    WHERE ${clauses.join(' AND ')}
  `,
    )
    .get(...params) as { avg_rating: number | null; total: number };

  const avg = row.avg_rating == null ? 0 : Math.round(Number(row.avg_rating) * 10) / 10;
  return { avgRating: avg, totalReviews: Number(row.total) };
}

/** Close the underlying SQLite connection (e.g. after tests). */
export function closeDb(): void {
  if (db) {
    try {
      db.close();
    } catch {
      /* ignore */
    }
    db = null;
  }
}
