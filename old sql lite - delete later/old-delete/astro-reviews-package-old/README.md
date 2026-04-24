# @carfit/astro-reviews

Standalone Astro components that recreate **WP Social Ninja** review **template 1** (card layout, Google-style header, load more) using data from a **SQLite** export of `wp_wpsr_reviews` or bundled sample JSON.

## Requirements

- **Node.js 18+** (for `better-sqlite3` native bindings)
- **Astro 4+** in the consuming project

`better-sqlite3` only runs in Node. It does **not** run on Vercel Edge, Cloudflare Workers, or Netlify Functions without a pre-built JSON snapshot and static HTML.

## Installation

### npm / local package

```bash
npm install file:./astro-reviews-package
# or publish / link the package, then:
npm install @carfit/astro-reviews
```

Configure Vite so the native addon stays on the server (see **INTEGRATION.md**).

### Static build vs SSR

- **Static (`output: 'static'`)**: Call `getReviews` / `getReviewStats` in page frontmatter at build time; HTML embeds the result.
- **SSR (Node adapter)**: The same calls run on each request when the route is server-rendered.

### Copy-paste (no package install)

1. Copy into your Astro project: `src/components/ReviewCard.astro`, `src/components/ReviewsGallery.astro`, `src/lib/database.ts`, `src/lib/helpers.ts`, `src/types/review.ts`, `src/styles/reviews.css`, `src/data/sample-reviews.json`.
2. Fix **import paths** in those files (they currently use paths relative to this package).
3. Add **`better-sqlite3`** to your app dependencies and the Vite `ssr.external` / `optimizeDeps.exclude` entries from **INTEGRATION.md**.
4. Set **`SQLITE_PATH`** (or rely on sample JSON fallback).

## Environment

Set `SQLITE_PATH` to your export file (absolute or relative to the **current working directory** of `astro dev` / `astro build`):

```bash
# .env in your Astro project
SQLITE_PATH=/var/www/proxy.carfit-hamburg.de/wp-social-ninja-export.sqlite
```

If the file is missing or unreadable, the library logs a warning and uses `src/data/sample-reviews.json`.

## Usage

```astro
---
import ReviewsGallery from '@carfit/astro-reviews/components/ReviewsGallery.astro';
import { getReviews, getReviewStats } from '@carfit/astro-reviews';

const reviews = getReviews(100, 0);
const stats = getReviewStats();
---

<ReviewsGallery
  reviews={reviews}
  stats={stats}
  showHeader={true}
  showGoogleLogo={true}
  showLoadMore={true}
  itemsPerPage={9}
  headerTitle="Google Reviews"
  excerptMaxChars={200}
/>
```

Single card:

```astro
---
import ReviewCard from '@carfit/astro-reviews/components/ReviewCard.astro';
import { getReviews } from '@carfit/astro-reviews';

const [review] = getReviews(1, 0);
---

{review && <ReviewCard review={review} excerptMaxChars={200} />}
```

Optional stylesheet import (styles are also pulled in by the components):

```astro
import '@carfit/astro-reviews/styles/reviews.css';
```

Types for props can be imported from the components entry (no `.astro` runtime from this path):

```ts
import type { Review, ReviewsGalleryProps } from '@carfit/astro-reviews/components';
```

## API

### `getReviews(limit?, offset?)`

Returns approved reviews (`review_approved = 1`), ordered by `review_time` descending. Maps rows to the `Review` type (camelCase fields).

### `getReviewStats()`

Returns `{ avgRating: number, totalReviews: number }` for the optional gallery header.

### `ReviewsGallery` props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `reviews` | `Review[]` | (required) | Reviews to render |
| `stats` | `ReviewStats \| null` | `null` | Shown when `showHeader` is true |
| `itemsPerPage` | `number` | `9` | Initial visible cards; load more reveals the next batch |
| `showHeader` | `boolean` | `true` | Average rating + count block |
| `showGoogleLogo` | `boolean` | `true` | Multicolour Google mark next to the header title (when header is shown) |
| `showLoadMore` | `boolean` | `true` | Footer button when `reviews.length > itemsPerPage` |
| `headerTitle` | `string` | `'Google Reviews'` | Heading next to the logo |
| `excerptMaxChars` | `number` | `200` | Plain-text excerpt length before “Read more” |

### `ReviewCard` props

| Prop | Type | Default |
|------|------|---------|
| `review` | `Review` | required |
| `excerptMaxChars` | `number` | `200` |

## Customisation (colours, fonts, layout)

The gallery root uses the class **`reviews-gallery`**. Override **CSS variables** on a wrapper (see `src/styles/reviews.css` for the full set):

| Variable | Effect |
|----------|--------|
| `--review-star-filled` | Filled star colour |
| `--review-star-empty` | Empty star colour |
| `--review-text` | Body text on cards |
| `--review-muted` | Date / platform caption |
| `--review-card-shadow` | Card shadow |
| `--review-btn-bg` | “Load more” button background |

**Fonts:** the package defaults to `system-ui, …`. Wrap the gallery and set `font-family` on your wrapper; use `:global(.reviews-gallery)` if you use scoped `<style>` in `.astro` (see `example/src/pages/reviews-advanced.astro`).

**Layout:** the grid is `1` / `2` / `3` columns at default breakpoints (`768px`, `1024px`). For deeper layout changes, copy `reviews.css` into your project and edit the `.reviews-grid` rules, or add more specific selectors after importing the base stylesheet.

## Example projects in this repo

| Page | Purpose |
|------|---------|
| `example/src/pages/reviews.astro` | Default props + full list from SQLite |
| `example/src/pages/reviews-advanced.astro` | Custom `itemsPerPage`, `excerptMaxChars`, `showGoogleLogo={false}`, and CSS variable overrides |

```bash
cd astro-reviews-package/example
npm install
SQLITE_PATH=/absolute/path/to/wp-social-ninja-export.sqlite npm run build
```

## Licence note

Markup and styling are **adapted** from the GPL-licensed **WP Social Ninja** (wp-social-reviews) template 1. This package does not ship plugin fonts or proprietary assets; star graphics are inline SVG. The header uses a standard multicolour **G** mark; ensure your use complies with [Google brand guidelines](https://about.google/brand-resource-center/brand-elements/) for production sites.

## FAQ

**Build fails with errors about `better-sqlite3` or native bindings.**  
Install build tooling (Python, `build-essential`, etc.) on the machine running `npm install`, or pin a prebuilt binary version supported by your OS. Keep `better-sqlite3` in `vite.ssr.external` (see **INTEGRATION.md**).

**No reviews appear; console warns about sample data.**  
`SQLITE_PATH` is unset or wrong for the current working directory. Use an absolute path or copy `example/.env.example` to `.env` and adjust.

**“Load more” does nothing.**  
Ensure JavaScript is enabled; the button only toggles `review-card-wrap--hidden` classes. With `showLoadMore={false}`, the button is omitted and all cards are visible.

**I deploy to Netlify / Vercel serverless.**  
Do not call `getReviews()` at runtime there. Build statically on a Node CI host with `SQLITE_PATH` set, or commit a JSON snapshot and read that instead of SQLite.

**Can I use only JSON, no SQLite?**  
Yes: omit `SQLITE_PATH` and ensure no default SQLite file is found; the package uses `sample-reviews.json`. For production, replace that file with your own export or load JSON from your CMS.

---

More step-by-step copy and deploy notes: **INTEGRATION.md**.
