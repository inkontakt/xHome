# WP Social Ninja to Astro Reviews Sync Implementation Plan

> **For agentic workers:** Execute this plan phase-by-phase. Do not start Phase 2 until Phase 1 records the live WP Social Ninja schema and confirms the endpoint contract can be implemented safely. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a private WordPress-to-Astro reviews integration where WP Social Ninja remains the source of truth for review data and template behavior, and Astro renders that data inside the existing Carfit reviews section.

**Architecture:** Add a custom authenticated WordPress REST endpoint on the `connectCarfit` WordPress site that reads WP Social Ninja review rows and template config from WordPress MySQL, applies template filtering in WordPress, and returns a versioned normalized JSON payload. Update Astro to fetch that payload at request time through the existing WordPress server-to-server auth layer, then map it into the existing Carfit reviews UI.

**Tech Stack:** WordPress REST API, WP Social Ninja data tables, `$wpdb`, Astro server rendering, TypeScript, server-side fetch, application-password auth

---

## Execution Readiness

This plan is ready to execute in phases, but full implementation is gated by live WordPress discovery.

- [ ] Phase 1 is required before any endpoint or Astro implementation.
- [ ] Phase 2 may start only after the WP Social Ninja schema, plugin version, template config storage, and avatar URL strategy are confirmed.
- [ ] Phase 3 may start only after the endpoint response contract is validated with a real template ID.
- [ ] Do not remove the SQLite implementation until WordPress endpoint parity is verified.

## Current Repo Context

- Existing Astro WordPress auth lives in `src/lib/wordpress-site-config.ts` and `src/lib/wordpress.ts`.
- Current Astro-native reviews section is `src/components/carfit/carfit-astro-reviews.astro`.
- Current SQLite helper is `src/lib/carfit-sqlite-reviews.ts`.
- Current WP Social Ninja SQLite reference implementation is `new/astro-reviews-package/src/lib/database.ts`.
- Current review component types are in `new/astro-reviews-package/src/types/review.ts`.
- Current review gallery component is `new/astro-reviews-package/src/components/ReviewsGallery.astro`.
- Current Carfit page passes `reviewsTemplateId` only to `CarfitProxiedReviews`, not to `CarfitAstroReviews`.
- Current Carfit template ID source is `src/content/carfit-settings/index.md`, with `reviewsProxy.templateId: 9576`.
- Current avatar proxy route is `src/pages/carfit-review-avatar/[id].ts` and is SQLite-backed.
- Existing WordPress reference endpoint file pattern is `resources/wordpress/fluentform-embed-endpoint.php`.

## Files

- Create: `resources/wordpress/wp-social-ninja-reviews-endpoint.php`
- Create: `resources/wordpress/wp-social-ninja-reviews-implementation-note.md`
- Modify: `src/lib/wordpress.ts`
- Modify: `src/components/carfit/carfit-page.astro`
- Modify: `src/components/carfit/carfit-astro-reviews.astro`
- Modify if needed: `new/astro-reviews-package/src/types/review.ts`
- Modify if needed: `new/astro-reviews-package/src/components/ReviewsGallery.astro`
- Modify or retire if needed: `src/pages/carfit-review-avatar/[id].ts`
- Do not modify unless there is a verified need: `src/lib/wordpress-site-config.ts`
- Keep as temporary parity baseline: `src/lib/carfit-sqlite-reviews.ts`
- Keep as temporary parity baseline: `new/astro-reviews-package/src/lib/database.ts`

## Phase 1: WordPress Discovery Gate

- [ ] Confirm WordPress target is `connectCarfit` unless live inspection proves WP Social Ninja data lives elsewhere.
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

- [ ] Extend `src/lib/wordpress.ts` with DTO types:
  - `WpSocialReviewsTemplate`
  - `WpSocialReviewsHeader`
  - `WpSocialReviewsStats`
  - `WpSocialReview`
  - `WpSocialReviewsResponse`
- [ ] Add `getWpSocialReviewsTemplate(templateId: number, siteKey: WordPressSiteKey = 'connectCarfit')`.
- [ ] Use the existing `fetchWordPress` helper and application-password auth.
- [ ] Use the explicit path `/inkontakt/v1/wpsn/reviews/{templateId}`.
- [ ] Add a bounded timeout using `AbortController`.
- [ ] Use one short retry only for transient `502`, `503`, or `504` responses.
- [ ] Do not retry `400`, `401`, `403`, `404`, or malformed contract errors.
- [ ] Validate enough of the response shape before rendering:
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

- [ ] Default v1 strategy: return direct absolute avatar URLs from WordPress and render them as-is.
- [ ] If direct avatar URLs are used, stop using `/carfit-review-avatar/{id}` for the WordPress-backed reviews section.
- [ ] If a same-origin avatar proxy is required for caching/control, replace `src/pages/carfit-review-avatar/[id].ts` with a WordPress-backed lookup.
- [ ] Do not keep a SQLite-backed avatar proxy for the new WordPress-backed review data.
- [ ] Validate that avatar URLs are absolute `http` or `https` URLs before rendering/proxying.
- [ ] Use a placeholder avatar when a URL is empty or invalid.

## Phase 6: Parity And Rollout

- [ ] Validate the endpoint against the existing SQLite reference behavior for template ID `9576`.
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
- [ ] Keep the SQLite path available until endpoint parity is confirmed.
- [ ] After parity is confirmed, treat the WordPress endpoint as the primary source.

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
- [ ] `OPTIONS /wp-json/inkontakt/v1/wpsn/reviews/9576` exposes route schema.
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

- [ ] `npm run check-types`
- [ ] `npm run build`
- [ ] Carfit page passes the same template ID to proxied and Astro-native review sections.
- [ ] Carfit Astro-native section renders live WordPress data.
- [ ] Empty WordPress response renders an intentional empty state.
- [ ] WordPress fetch/auth failure renders an intentional fallback state.
- [ ] Header title, logo visibility, load-more label, content language, and review count are mapped from the endpoint.
- [ ] Avatar images load under the chosen direct/proxy strategy.
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
- [ ] Default WordPress target is `connectCarfit`.
- [ ] Default template ID is the Carfit setting value currently set to `9576`.
- [ ] The same template ID must drive both the WordPress proxy/embed section and Astro-native reviews section.
- [ ] WordPress owns review content, filtering behavior, header settings, and aggregate stats.
- [ ] Astro owns final layout, card styling, section spacing, and fallback presentation.
- [ ] V1 sync depth includes behavior and header metadata, not raw WP HTML and not WP style-token rendering.
- [ ] Unknown template ID means `404`.
- [ ] Existing template with no matching reviews means `200` with an empty `reviews[]`.
- [ ] Default avatar strategy is direct absolute URLs unless staging proves a same-origin proxy is needed.
- [ ] Application-password credentials stay in env only and must be rotated immediately if exposed.
- [ ] Required access before Phase 2:
  - WordPress codebase or mu-plugin deployment access
  - WordPress database/schema visibility
  - WordPress application-password credentials for Astro
  - Ability to create or assign the selected endpoint capability
