# Integration guide

## 1. Copy or install the package

- **npm / pnpm**: add `"@carfit/astro-reviews": "file:../astro-reviews-package"` (adjust path), then `npm install`.
- **Types**: `import type { Review, … } from '@carfit/astro-reviews/components'` (see `package.json` → `exports`).
- **Copy-paste**: copy `src/components`, `src/lib`, `src/types`, `src/styles`, and `src/data/sample-reviews.json` into your project and fix import paths.

## 2. Native module (Vite / Astro)

In the consuming `astro.config.mjs`, keep SQLite on the server:

```javascript
export default defineConfig({
  vite: {
    ssr: { external: ['better-sqlite3'] },
    optimizeDeps: { exclude: ['better-sqlite3'] },
  },
});
```

## 3. Environment

From your Astro project root, set:

```bash
SQLITE_PATH=/absolute/path/to/wp-social-ninja-export.sqlite
```

Relative paths are resolved from `process.cwd()` (usually the Astro project root).

## 4. Create a page

`src/pages/reviews.astro`:

```astro
---
import TemplateReviewsGallery from '@carfit/astro-reviews/components/TemplateReviewsGallery.astro';
---

<TemplateReviewsGallery templateId={428} itemsPerPage={9} />
```

This is the recommended path for `[wp_social_ninja id="428" platform="reviews"]`.
It reads the template config from SQLite and applies the WP Social Ninja platform,
review count, ordering, include/exclude lists, star filter, selected business filter,
empty-review filter, and original/translated review text setting.

## 5. Serverless / edge

Do **not** import `better-sqlite3` in edge bundles. Options:

1. Build on a Node CI machine with `SQLITE_PATH` set, deploy static `dist/`, or  
2. Generate a JSON snapshot in CI and load that file in frontmatter instead of `getReviews`.

## 6. Customisation

Override CSS variables on a wrapper:

```css
.reviews-gallery {
  --review-star-filled: #ffb800;
  --review-btn-bg: #1a2d4d;
}
```

Set **fonts** and outer **spacing** on your own wrapper around `.reviews-gallery` (for example `font-family: Georgia, serif` on `.my-reviews`), or use scoped Astro styles with `:global(.reviews-gallery) { … }` as in `example/src/pages/reviews-advanced.astro`.

Or replace `@carfit/astro-reviews/styles/reviews.css` with your own rules targeting the same class names (`.review-card`, `.reviews-grid`, etc.).

## 7. Example routes in this repository

After `npm install` inside `example/`:

- **`/reviews`** — default gallery (see `example/src/pages/reviews.astro`).
- **`/reviews-advanced`** — custom props, no header logo, shorter excerpts, and CSS variable overrides (see `example/src/pages/reviews-advanced.astro`).
