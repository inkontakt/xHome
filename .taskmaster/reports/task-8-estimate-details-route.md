# Task 8 - Astro-Compatible Estimate Details Route

Date: 2026-04-15
Tag: next-frontend-xhome-integration

## Scope

Added a root-owned Astro `/estimate-details` route that preserves `tenant_id` and `estimate_id` query params and renders honest missing/unavailable states without copying Next runtime code or inventing successful estimate data.

## Files Added

- `src/pages/estimate-details.astro`
- `src/lib/estimate-files.ts`

## Implementation Notes

- `src/pages/estimate-details.astro`
  - Uses the existing `Layout`.
  - Parses `tenant_id` and `estimate_id` from `Astro.url.searchParams`.
  - Shows a missing-query state when either parameter is absent.
  - Shows an unavailable-data state when both parameters are present because the Astro root does not currently expose Supabase or a root estimate API.
  - Preserves the footer content through the existing Markdown-backed landing loader.
  - Provides PDF and image-gallery placeholder shells only, with disabled download behavior until real file URLs exist.
- `src/lib/estimate-files.ts`
  - Adds root-compatible helpers for future file wiring:
    - `extractFilenameFromUrl`
    - `isPdfFile`
    - `isImageFile`
    - `safeDownloadFileName`

## Boundary Checks

- Did not import from `nextjs-connect-wp-main`.
- Did not import `next/link`, `next/navigation`, `next/dynamic`, `next/server`, `next/cache`, or `next/font`.
- Did not add `@react-pdf-viewer`, `pdfjs-dist`, or Supabase dependencies.
- Forbidden import scan only found the intentional `tsconfig.json` exclusion for `nextjs-connect-wp-main`.

## Validation

- `npm run build`
  - Passed outside the sandbox.
  - Existing warning remains: `getStaticPaths()` ignored in SSR dynamic page `src/pages/blog/[slug].astro`.
- `npm run check-types`
  - Still fails on known baseline files from Task 2.
  - Targeted scan found no type errors in `src/pages/estimate-details.astro` or `src/lib/estimate-files.ts`.
- Route state checks on temporary dev server:
  - `/estimate-details` -> `200`, missing-query state rendered.
  - `/estimate-details?tenant_id=t1&estimate_id=e1` -> `200`, unavailable-data state rendered.
- `git diff --check -- src/pages/estimate-details.astro src/lib/estimate-files.ts`
  - Passed.

## Deferred by Design

Successful estimate rendering remains deferred until the root app has an approved estimate data source/API. This avoids carrying over the nested Next app's Supabase server dependency or fake data behavior.
