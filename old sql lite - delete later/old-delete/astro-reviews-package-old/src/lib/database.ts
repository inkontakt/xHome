import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Database as BetterDatabase } from 'better-sqlite3';
import type { Review, ReviewStats } from '../types/review.js';

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
    const Database = require('better-sqlite3') as typeof import('better-sqlite3').default;
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
  const stmt = connection.prepare(`
    SELECT id, reviewer_name, reviewer_img, reviewer_url, rating, review_time, reviewer_text, platform_name, review_approved
    FROM wp_wpsr_reviews
    WHERE review_approved = 1
    ORDER BY datetime(review_time) DESC
    LIMIT ? OFFSET ?
  `);
  const rows = stmt.all(limit, offset) as Record<string, unknown>[];
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
