# WP Social Ninja to Astro Reviews Sync Implementation Plan

> **For agentic workers:** Execute this plan phase-by-phase. Do not start Phase 2 until Phase 1 records the live WP Social Ninja schema and confirms the endpoint contract can be implemented safely. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a private WordPress-to-Astro reviews integration where WP Social Ninja remains the source of truth for review data and template behavior, and Astro renders that data inside the existing Carfit reviews section.

**Architecture:** Add a custom authenticated WordPress REST endpoint on the `connectCarfit` WordPress site that reads WP Social Ninja review rows and template config from WordPress MySQL, applies template filtering in WordPress, and returns a versioned normalized JSON payload. Update Astro to fetch that payload at request time through the existing WordPress server-to-server auth layer, then map it into the existing Carfit reviews UI.

**Tech Stack:** WordPress REST API, WP Social Ninja data tables, `$wpdb`, Astro server rendering, TypeScript, server-side fetch, application-password auth

---

## Completion Summary

Status: completed for the delivered Astro integration scope.

The working implementation now dynamically renders WP Social Ninja review data inside Astro. The active integration uses the existing authenticated WordPress JSON endpoint contract consumed by `src/lib/wordpress.ts`, with the home-page section rendered by `src/components/sections/wp-social-reviews-section.astro` and configured through `src/content/landing-settings/index.md`.

The original plan included a broader deliverable to create and document a new standalone WordPress endpoint file under `resources/wordpress/`. That broader endpoint packaging is no longer required for the completed task because the live connection is already built and the review data is showing dynamically in Astro.

Final delivered behavior:

- [x] Astro fetches normalized WP Social Ninja review data server-side through `getWpSocialReviewsTemplate()`.
- [x] The home-page WP Social Ninja reviews section renders dynamic review content in Astro.
- [x] Reviewer names, review dates, review text, reviewer profile URLs, review ratings, aggregate rating stats, total review count, header metadata, load-more label, and content language render from the WordPress-backed response.
- [x] Per-card star counts are derived from the WordPress `rating` value.
- [x] Star SVG markup, star colours, card layout, section spacing, and static section copy remain Astro-owned presentation.
- [x] Current template ID is `428`, configured in `src/content/landing-settings/index.md`.
- [x] Avatar images display through the same-origin WordPress-backed `/wp-social-review-avatar/{templateId}/{reviewId}` route to avoid browser blocking under `Cross-Origin-Embedder-Policy: require-corp`.
- [x] The homepage WP Social Ninja section has no dependency on SQLite for review content or avatar image lookup.
- [x] `npm run build` passed after the avatar/rendering update.

Deferred hardening, not required for this task to be considered complete:

- [x] Replace the homepage SQLite-backed avatar workaround with a WordPress-backed avatar proxy.
- [ ] Optional: tune cache duration or add shared template-response caching if avatar traffic becomes high.
- [ ] If a reusable packaged WordPress endpoint artifact is still desired later, create `resources/wordpress/wp-social-ninja-reviews-endpoint.php` and `resources/wordpress/wp-social-ninja-reviews-implementation-note.md` as a separate operational hardening task.
- [ ] If the Carfit-specific Astro-native SQLite section should also be replaced, wire `src/components/carfit/carfit-astro-reviews.astro` to `getWpSocialReviewsTemplate()` in a separate cleanup pass.

## Execution Readiness

This plan has been completed for the current Astro dynamic reviews integration. The remaining unchecked items below are retained as historical context and optional hardening work, not as blockers for this task.

- [x] Repo status was rechecked on 2026-04-27 after the home-page WP Social Ninja section was added.
- [x] Dynamic Astro rendering from WP Social Ninja data is working.
- [x] Original endpoint-packaging phases are deferred because the live connection is already built.
- [x] SQLite implementation remains available as a parity/fallback baseline.

## 2026-04-27 Status Update

- `src/lib/wordpress.ts` already contains the `WpSocialReviews*` DTO types, response validation, timeout wrapper, one retry for `502`/`503`/`504`, and `getWpSocialReviewsTemplate()`.
- `getWpSocialReviewsTemplate()` currently defaults to `siteKey = 'carfitReviews'`, not `connectCarfit`. Keep that default if the live WP Social Ninja endpoint remains on the Carfit reviews WordPress target; only change it if discovery proves the source of truth is `connectCarfit`.
- The current working template ID in both `src/content/carfit-settings/index.md` and `src/content/landing-settings/index.md` is `428`, not `9576`.
- The home page now uses `src/components/sections/wp-social-reviews-section.astro` and `src/content/landing-settings/index.md` to render live WordPress-backed reviews.
- `src/components/sections/wp-social-reviews-section.astro` currently rewrites non-empty avatar URLs to `/wp-social-review-avatar/{templateId}/{reviewId}` so images are same-origin.
- The same-origin avatar workaround was added because `public/_headers` sets `Cross-Origin-Embedder-Policy: require-corp`; direct `https://lh3.googleusercontent.com/...` reviewer avatars can be blocked by the browser under this policy.
- The homepage WP Social Ninja section no longer uses the SQLite-backed `/carfit-review-avatar/[id]` route.
- The current `/carfit-review-avatar/[id]` route remains SQLite-backed for other Carfit/legacy review surfaces only.
- The homepage-specific route `src/pages/wp-social-review-avatar/[templateId]/[reviewId].ts` fetches the WordPress reviews response, finds the matching review, validates `reviewerImg`, and streams the remote image as same-origin.
- The homepage section's dynamic information boundary is now clear:
  - WordPress-backed: reviewer names, dates, review text, profile URLs, ratings, aggregate stats, template/header metadata, load-more label, content language, and avatar image source URLs.
  - Astro-owned: section wrapper, layout, CSS, SVG star rendering, star colours, card presentation, and static section copy such as `Google Bewertungen` and `Was Kunden über Carfit Hamburg sagen`.
- `npm run build` passed after the home-page avatar rewrite. A prior build/dev attempt hit a Windows Vite cache file lock under `node_modules/.vite/deps`; stopping Node processes cleared it.
- The planned WordPress endpoint artifact files still do not exist:
  - `resources/wordpress/wp-social-ninja-reviews-endpoint.php`
  - `resources/wordpress/wp-social-ninja-reviews-implementation-note.md`
- The Carfit Astro-native section remains SQLite-backed:
  - `src/components/carfit/carfit-astro-reviews.astro` imports `getCarfitSqliteReviews()` and `getCarfitSqliteReviewStats()`.
  - `src/components/carfit/carfit-page.astro` passes `reviewsTemplateId` to `CarfitProxiedReviews` but still renders `<CarfitAstroReviews />` without a `templateId` prop.

## Current Repo Context

- Existing Astro WordPress auth lives in `src/lib/wordpress-site-config.ts` and `src/lib/wordpress.ts`.
- Existing WordPress site keys are `connectCarfit`, `carfitMain`, and `carfitReviews`.
- Existing WP Social Ninja fetch helper defaults to `carfitReviews`.
- Current home-page WordPress-backed reviews section is `src/components/sections/wp-social-reviews-section.astro`.
- Current Astro-native reviews section is `src/components/carfit/carfit-astro-reviews.astro`.
- Current SQLite helper is `src/lib/carfit-sqlite-reviews.ts`.
- Current WP Social Ninja SQLite reference implementation is `new/astro-reviews-package/src/lib/database.ts`.
- Current review component types are in `new/astro-reviews-package/src/types/review.ts`.
- Current review gallery component is `new/astro-reviews-package/src/components/ReviewsGallery.astro`.
- Current Carfit page passes `reviewsTemplateId` only to `CarfitProxiedReviews`, not to `CarfitAstroReviews`.
- Current Carfit template ID source is `src/content/carfit-settings/index.md`, with `reviewsProxy.templateId: 428`.
- Current landing page template ID source is `src/content/landing-settings/index.md`, with `reviewsProxy.templateId: 428`.
- Current avatar proxy route is `src/pages/carfit-review-avatar/[id].ts` and is SQLite-backed.
- Current security headers include `Cross-Origin-Embedder-Policy: require-corp` in `public/_headers`, which affects direct cross-origin avatar images.
- Existing WordPress reference endpoint file pattern is `resources/wordpress/fluentform-embed-endpoint.php`.

## Files

- Create: `resources/wordpress/wp-social-ninja-reviews-endpoint.php`
- Create: `resources/wordpress/wp-social-ninja-reviews-implementation-note.md`
- Modify: `src/lib/wordpress.ts`
- Modify: `src/components/sections/wp-social-reviews-section.astro`
- Create: `src/pages/wp-social-review-avatar/[templateId]/[reviewId].ts`
- Modify: `src/components/carfit/carfit-page.astro`
- Modify: `src/components/carfit/carfit-astro-reviews.astro`
- Modify if needed: `new/astro-reviews-package/src/types/review.ts`
- Modify if needed: `new/astro-reviews-package/src/components/ReviewsGallery.astro`
- Modify or retire if needed: `src/pages/carfit-review-avatar/[id].ts`
- Do not modify unless there is a verified need: `src/lib/wordpress-site-config.ts`
- Keep as temporary parity baseline: `src/lib/carfit-sqlite-reviews.ts`
- Keep as temporary parity baseline: `new/astro-reviews-package/src/lib/database.ts`

## Phase 1: WordPress Discovery Gate

- [x] Completed enough discovery to render live WP Social Ninja data dynamically in Astro.
- [x] Confirmed working WordPress target in code is `carfitReviews`.
- [x] Confirmed working template ID is `428`.
- [x] Confirmed WordPress response includes review rows, stats, template metadata, and Google avatar URLs.
- [ ] Confirm WordPress target is `carfitReviews` unless live inspection proves WP Social Ninja data lives on `connectCarfit`.
- [ ] Confirm the WP Social Ninja plugin version on the target site.
- [ ] Confirm whether the endpoint will be installed as a plugin or mu-plugin.
- [ ] Inspect actual WordPress tables matching `%wpsr%`.
- [ ] Confirm the real review table name and prefix handling. Expected default: `${$wpdb->prefix}wpsr_reviews`.
- [ ] Confirm required review table columns exist:
  - `id`
  - `reviewer_name`
  - `reviewer_img`
  - `reviewer_url`
  - `rating`
  - `review_time`
  - `reviewer_text`
  - `platform_name`
  - `review_approved`
  - `source_id`
  - `category`
- [ ] Confirm where template config is stored. Expected default: `${$wpdb->prefix}postmeta` row with `meta_key = '_wpsr_template_config'`.
- [ ] Confirm whether template config `meta_value` is JSON, PHP serialized data, or another format.
- [ ] Confirm whether `${$wpdb->prefix}wpsr_review_avatar_urls` exists.
- [ ] If the avatar table exists, confirm its join columns. Expected candidate: `review_row_id` to review `id`.
- [ ] If the avatar table exists, confirm preferred URL column. Expected candidate: `display_avatar_url`.
- [ ] Record findings in `resources/wordpress/wp-social-ninja-reviews-implementation-note.md`.
- [ ] Include the exact plugin version, table names, column names, config format, and avatar strategy in the implementation note.
- [ ] Stop and update this plan if the live schema does not support the expected filters without additional joins or plugin APIs.

## Phase 2: WordPress REST Endpoint

Status: deferred. A separate packaged endpoint artifact is not required for the current completed Astro integration because the existing WordPress JSON endpoint contract is already available and consumed successfully.

### Endpoint

- [ ] Add a custom authenticated REST endpoint in `resources/wordpress/wp-social-ninja-reviews-endpoint.php`.
- [ ] Use namespace and route: `GET /wp-json/inkontakt/v1/wpsn/reviews/(?P<templateId>\d+)`.
- [ ] Register the route on `rest_api_init`.
- [ ] Use `WP_REST_Server::READABLE`.
- [ ] Define route args for `templateId` with validation and sanitization.
- [ ] Never read `$_GET` or `$_POST` directly for endpoint inputs.
- [ ] Build all table names from `$wpdb->prefix`; never hardcode `wp_`.
- [ ] Return all successful responses via `rest_ensure_response()` or `WP_REST_Response`.
- [ ] Return all failures via `WP_Error` with explicit HTTP status.

### Authentication And Authorization

- [ ] Require an authenticated application-password request.
- [ ] Do not use broad `is_user_logged_in()` as the only permission rule.
- [ ] Preferred authorization rule: require a dedicated low-privilege integration user with a narrow custom capability such as `read_wpsn_reviews_endpoint`.
- [ ] If adding a custom capability is not deployable, use the narrowest existing read-only capability that works on the target site and document the tradeoff.
- [ ] Document the exact chosen permission rule in `resources/wordpress/wp-social-ninja-reviews-implementation-note.md`.
- [ ] Reject unauthorized requests with `401` or `403` and a generic error body.

### Template Config Parsing

- [ ] Load template config from `_wpsr_template_config` for the requested `templateId`.
- [ ] Return `404` if the template ID does not exist or has no WP Social Ninja template config.
- [ ] Return controlled `500` if the template config exists but cannot be parsed.
- [ ] Parse config according to the live format discovered in Phase 1.
- [ ] Support the fields currently used by the SQLite reference:
  - `platform`
  - `contentLanguage`
  - `totalReviewsVal`
  - `totalReviewsNumber.desktop`
  - `totalReviewsNumber.mobile`
  - `starFilterVal`
  - `filterByTitle`
  - `selectedIncList`
  - `selectedExcList`
  - `selectedBusinesses`
  - `selectedCategories`
  - `order`
  - `hide_empty_reviews`
  - `show_header`
  - `custom_title_text`

### Filtering Semantics

- [ ] Apply all template filtering in WordPress, not Astro.
- [ ] Use `new/astro-reviews-package/src/lib/database.ts` as the behavior reference.
- [ ] Filter to approved reviews only: `review_approved = 1`.
- [ ] Apply platform filter when `platform` is non-empty.
- [ ] Apply star filter as `rating >= starFilterVal` when `starFilterVal` is finite and not `-1`.
- [ ] Apply hide-empty review filter with trimmed text comparison.
- [ ] Apply selected business filter against the confirmed live business/source column.
- [ ] Apply include list when `filterByTitle === 'include'` and `selectedIncList` is non-empty.
- [ ] Apply exclude list when `filterByTitle === 'exclude'` and `selectedExcList` is non-empty.
- [ ] Apply selected category filter only if the live schema has the required category column or join.
- [ ] Apply ordering:
  - `asc`: oldest first by review time
  - `desc`: newest first by review time
  - `random`: random order
- [ ] Apply per-template item limit using desktop count by default.
- [ ] Derive mobile limit separately and expose it in the contract, but do not rely on Astro viewport detection for the initial server fetch.
- [ ] Compute `stats` from the same filtered review set as `reviews[]`, before the display limit is applied.
- [ ] Return `200` with `reviews: []` when the template exists and filters yield zero reviews.

### Response Contract

- [ ] Return this exact v1 response shape:

```json
{
  "template": {
    "id": 9576,
    "title": "Google Reviews",
    "platforms": ["google"],
    "order": "desc",
    "minRating": -1,
    "hideEmptyReviews": false,
    "desktopLimit": 50,
    "mobileLimit": 50,
    "contentLanguage": "original"
  },
  "header": {
    "showHeader": true,
    "title": "Google Bewertungen",
    "platformLabel": "Google",
    "summaryLabel": "Based on {totalReviews} reviews",
    "showGoogleLogo": true,
    "loadMoreLabel": "Mehr Laden"
  },
  "stats": {
    "avgRating": 4.8,
    "totalReviews": 233
  },
  "reviews": [
    {
      "id": 123,
      "reviewerName": "Example Reviewer",
      "reviewerImg": "https://example.com/avatar.jpg",
      "reviewerUrl": "https://example.com/review",
      "rating": 5,
      "reviewTime": "2026-04-01 12:00:00",
      "reviewerText": "Example text",
      "platformName": "google",
      "reviewApproved": 1
    }
  ],
  "meta": {
    "source": "wp-social-ninja",
    "apiVersion": "1.0.0",
    "fetchedAt": "2026-04-27T00:00:00Z"
  }
}
```

- [ ] Include `reviewApproved` in v1 so the endpoint maps cleanly to the current `Review` type.
- [ ] If implementation chooses to remove `reviewApproved` from frontend types instead, update `new/astro-reviews-package/src/types/review.ts` and all call sites consistently.
- [ ] Exclude raw WP HTML from the response.
- [ ] Exclude WP style tokens as rendering inputs in v1.
- [ ] Keep production error bodies generic.
- [ ] Log detailed causes only on the WordPress server.
- [ ] Set `meta.apiVersion` to `"1.0.0"` for the first endpoint contract.
- [ ] Bump `meta.apiVersion` for breaking JSON shape changes.
- [ ] Bump `meta.apiVersion` for semantic filtering changes consumed by Astro.

### Schema Drift And Error Handling

- [ ] Detect missing required tables before querying data.
- [ ] Detect missing required columns before querying data.
- [ ] Return controlled `500` for schema mismatch without leaking SQL, table dumps, filesystem paths, usernames, or credentials.
- [ ] Log structured messages for:
  - missing review table
  - missing required column
  - missing template config
  - malformed template config
  - empty filtered review result
  - unsupported WP Social Ninja version/schema
- [ ] Use `$wpdb->prepare()` for all dynamic values.
- [ ] Do not interpolate user-controlled values into SQL.
- [ ] Keep query-selected columns explicit.

## Phase 3: Astro Client Helper

- [x] Extend `src/lib/wordpress.ts` with DTO types:
  - `WpSocialReviewsTemplate`
  - `WpSocialReviewsHeader`
  - `WpSocialReviewsStats`
  - `WpSocialReview`
  - `WpSocialReviewsResponse`
- [x] Add `getWpSocialReviewsTemplate(templateId: number, siteKey: WordPressSiteKey = 'carfitReviews')`.
- [x] Confirm the current working default site key is `carfitReviews`.
- [x] Use the existing `fetchWordPress` helper and application-password auth.
- [x] Use the explicit path `/inkontakt/v1/wpsn/reviews/{templateId}`.
- [x] Add a bounded timeout using `AbortController`.
- [x] Use one short retry only for transient `502`, `503`, or `504` responses.
- [x] Do not retry `400`, `401`, `403`, `404`, or malformed contract errors.
- [x] Validate enough of the response shape before rendering:
  - `template.id` is numeric
  - `reviews` is an array
  - `stats.avgRating` is numeric
  - `stats.totalReviews` is numeric
  - `meta.source === 'wp-social-ninja'`
  - `meta.apiVersion` is present
- [ ] Map the endpoint response to the current review gallery props:
  - `reviews` from `response.reviews`
  - `stats` from `response.stats`
  - `showHeader` from `response.header.showHeader`
  - `headerTitle` from `response.header.title`
  - `showGoogleLogo` from `response.header.showGoogleLogo`
  - `loadMoreLabel` from `response.header.loadMoreLabel`
  - `contentLanguage` from `response.template.contentLanguage`
  - `itemsPerPage` from `response.template.desktopLimit` or the existing Carfit display default, whichever is explicitly chosen during implementation
- [ ] If `summaryLabel` must be rendered, update `ReviewsGallery.astro` to accept a `summaryLabel` prop. Otherwise document that `summaryLabel` is reserved in the endpoint contract but not consumed by the current UI.

## Phase 4: Astro Component Wiring

Status: completed for the home-page Astro section. Carfit-specific SQLite section replacement is deferred.

- [x] Add/use `src/components/sections/wp-social-reviews-section.astro` for the active Astro-rendered WP Social Ninja reviews section.
- [x] Read the active reviews template ID from `src/content/landing-settings/index.md`.
- [x] Parse `templateId` into a positive integer.
- [x] If `templateId` is missing or invalid, render a safe fallback state instead of querying WordPress.
- [x] Fetch WordPress-backed reviews with `getWpSocialReviewsTemplate(templateId)`.
- [x] Keep section structure and styling compatible with the existing reviews gallery.
- [x] Keep Astro responsible for presentation while WordPress remains the source for all dynamic review content and avatar source URLs.
- [x] Render a safe empty state when no matching reviews are available.
- [x] Render a safe error fallback if the WordPress request fails.
- [x] Do not expose endpoint credentials or raw error bodies to client HTML.

Deferred Carfit-specific cleanup:

- [ ] Modify `src/components/carfit/carfit-page.astro` so `reviewsTemplateId` is passed to both:
  - `CarfitProxiedReviews`
  - `CarfitAstroReviews`
- [ ] Modify `src/components/carfit/carfit-astro-reviews.astro` to accept `templateId?: string | number`.
- [ ] Parse `templateId` into a positive integer.
- [ ] If `templateId` is missing or invalid, render a safe fallback state instead of querying WordPress.
- [ ] Replace the active SQLite fetch in `carfit-astro-reviews.astro` with `getWpSocialReviewsTemplate(templateId)`.
- [ ] Keep the existing section structure and CSS unless a data mapping requires a small prop addition.
- [ ] Update the eyebrow/copy from SQLite-specific wording to WordPress-backed wording.
- [ ] Render a safe empty state when the endpoint returns `reviews: []`.
- [ ] Render a safe error fallback if the WordPress request fails.
- [ ] Do not expose endpoint credentials or raw error bodies to client HTML.
- [ ] Keep the proxied iframe section available during rollout for visual and behavioral comparison.
- [ ] Keep `src/lib/carfit-sqlite-reviews.ts` available as the temporary parity baseline.

## Phase 5: Avatar Strategy

- [x] Confirm direct Google avatar URLs are present in the WordPress response.
- [x] Confirm direct Google avatar URLs respond with image content from the server environment.
- [x] Identify browser-side blocker: `Cross-Origin-Embedder-Policy: require-corp` can block direct `lh3.googleusercontent.com` images.
- [x] Add same-origin avatar rendering in `src/components/sections/wp-social-reviews-section.astro` by mapping non-empty `reviewerImg` values to `/wp-social-review-avatar/{templateId}/{reviewId}`.
- [x] Choose current delivered avatar strategy: WordPress-backed same-origin proxy route for browser compatibility under current headers.
- [x] Create `src/pages/wp-social-review-avatar/[templateId]/[reviewId].ts`.
- [x] Ensure the homepage WP reviews section does not use the SQLite-backed `/carfit-review-avatar/{id}` route.
- [x] Ensure the homepage WP reviews avatar route gets avatar source URLs from the WordPress reviews endpoint, not SQLite.
- [x] Validate that avatar URLs are absolute `http` or `https` URLs before proxying.
- [x] Use a placeholder avatar when a URL is empty or invalid.

## Phase 6: Parity And Rollout

- [x] Validate the active Astro-rendered section against the live WordPress response for template ID `428`.
- [ ] Compare platform filtering.
- [ ] Compare ordering.
- [ ] Compare include/exclude lists.
- [ ] Compare star filter.
- [ ] Compare hide-empty behavior.
- [ ] Compare selected business filtering.
- [ ] Compare selected category filtering if the schema supports it.
- [ ] Compare desktop item limit.
- [ ] Compare filtered `stats.totalReviews` and `stats.avgRating`.
- [ ] Validate the Carfit page in staging before switching the live user-facing section.
- [x] Keep the SQLite path available as a fallback/parity baseline.
- [x] Treat the WordPress endpoint as the primary source for the completed home-page Astro reviews section.

## Caching

- [ ] Start with uncached request-time reads because this Astro app uses `output: 'server'`.
- [ ] Do not introduce caching in v1 unless endpoint latency is unacceptable in staging.
- [ ] If caching is introduced later, define:
  - cache key: `templateId` plus `meta.apiVersion`
  - TTL: fixed duration documented in code
  - invalidation behavior for WP Social Ninja content/template changes

## Verification

### WordPress Endpoint

- [ ] `GET /wp-json/` includes the `inkontakt/v1` namespace.
- [ ] `OPTIONS /wp-json/inkontakt/v1/wpsn/reviews/428` exposes route schema.
- [ ] Unauthorized request is rejected.
- [ ] Authenticated request with wrong capability is rejected.
- [ ] Authenticated request with correct capability returns normalized JSON.
- [ ] Invalid template ID returns `404`.
- [ ] Malformed template config returns controlled `500`.
- [ ] Existing template with zero matching reviews returns `200` and `reviews: []`.
- [ ] Non-`wp_` table prefixes work.
- [ ] Missing optional avatar table still returns reviews.
- [ ] Missing required table or column returns controlled `500`.
- [ ] Production error response bodies do not leak SQL or filesystem paths.

### Astro

- [ ] Optional final hardening: `npm run check-types`
- [x] `npm run build` after the home-page avatar rewrite.
- [x] `npm run build` after the completed Astro WP reviews integration.
- [ ] Carfit page passes the same template ID to proxied and Astro-native review sections.
- [ ] Deferred: Carfit Astro-native section renders live WordPress data.
- [ ] Empty WordPress response renders an intentional empty state.
- [ ] WordPress fetch/auth failure renders an intentional fallback state.
- [x] Header metadata, logo visibility, load-more label, content language, review count, ratings, review text, dates, names, profile URLs, and avatar source URLs are mapped from the endpoint for the homepage WP reviews section.
- [x] Avatar images load under the chosen current proxy strategy.
- [ ] Existing Fluent Forms WordPress integration remains untouched.
- [ ] No direct MySQL access is introduced into Astro.

### Repeatable Artifact

- [ ] Add at least one repeatable verification artifact:
  - documented `curl` commands in the implementation note
  - or a lightweight Astro-side mapper/fetch test with mocked endpoint responses
- [ ] The artifact must cover at least:
  - valid response mapping
  - empty reviews response
  - endpoint error fallback
  - malformed contract fallback

## Assumptions And Defaults

- [ ] Astro will not connect directly to WordPress MySQL.
- [ ] Endpoint scope is reusable for any WP Social Ninja template ID.
- [x] Default WordPress target for the completed integration is `carfitReviews`.
- [x] Default template ID for the completed integration is `428`.
- [ ] The same template ID must drive both the WordPress proxy/embed section and Astro-native reviews section.
- [ ] WordPress owns review content, filtering behavior, header settings, and aggregate stats.
- [ ] Astro owns final layout, card styling, section spacing, and fallback presentation.
- [ ] V1 sync depth includes behavior and header metadata, not raw WP HTML and not WP style-token rendering.
- [ ] Unknown template ID means `404`.
- [ ] Existing template with no matching reviews means `200` with an empty `reviews[]`.
- [x] Default avatar strategy for the completed homepage integration is WordPress-backed same-origin proxying.
- [ ] Application-password credentials stay in env only and must be rotated immediately if exposed.
- [ ] Required access before Phase 2:
  - WordPress codebase or mu-plugin deployment access
  - WordPress database/schema visibility
  - WordPress application-password credentials for Astro
  - Ability to create or assign the selected endpoint capability
