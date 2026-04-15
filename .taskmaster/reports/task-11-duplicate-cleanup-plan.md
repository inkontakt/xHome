# Task 11: Duplicate Cleanup Planning

Date: 2026-04-15
Tag: `next-frontend-xhome-integration`

## Scope

This is a planning note only. No files under `nextjs-connect-wp-main` were deleted, moved, archived, or rewritten.

The nested reference repo currently contains 136 files discovered by `rg --files nextjs-connect-wp-main`.

High-level nested file counts:

| Area | File Count |
| --- | ---: |
| `app` | 27 |
| `components` | 39 |
| `feature-docs` | 13 |
| `lib` | 11 |
| `plugin` | 5 |
| `public` | 4 |
| `wordpress` | 8 |

Root source boundary check after validation: the only remaining root reference to `nextjs-connect-wp-main` is the intentional `tsconfig.json` exclusion.

## Migrated or Rebuilt in Astro Root

These nested files have had their useful behavior or visual intent selectively migrated or rebuilt in root-compatible form. They can be considered candidates for later removal from the active workspace after a dedicated cleanup phase confirms no user workflow still depends on them.

| Nested Source | Root Result | Cleanup Classification |
| --- | --- | --- |
| `app/globals.css` | Selective token/prose/layout ideas merged into `src/styles/global.css`. | Migrated; safe to remove later after visual sign-off. |
| `components/craft.tsx` | Rebuilt as `src/components/layout/craft.tsx`. | Migrated; safe to remove later after final component review. |
| `components/layout/nav.tsx`, `components/nav/mobile-nav.tsx` | Rebuilt through root header/navigation components. | Migrated visually; safe to remove later after nav regression checks. |
| `components/layout/footer.tsx` | Rebuilt through root footer component while preserving root content flow. | Migrated visually; safe to remove later after footer/content review. |
| `components/theme/theme-toggle.tsx` | Used as reference for compact root theme controls. | Migrated conceptually; safe to archive later. |
| `app/estimate-details/page.tsx` | Rebuilt as `src/pages/estimate-details.astro` with query parsing and safe empty/error states. | Rebuilt; keep nested copy only until estimate data integration is finalized. |
| `components/estimate-details/*` | File-type behavior covered by `src/lib/estimate-files.ts`; full gallery/PDF UI was intentionally not copied. | Partially referenced; archive after estimate route scope is locked. |
| `app/posts/*`, `components/posts/*` visual ideas | Blog visuals aligned in existing Astro `/blog` routes. | Not directly migrated; mostly reference-only because Astro blog remains source of truth. |

## Reference-Only and Safe to Archive Later

These files are useful as historical implementation context but should not be active runtime dependencies for the Astro app.

- `README.md`, `QUICK_START.md`, `ARCHITECTURE.md`, `IMPLEMENTATION_SUMMARY.md`, `COMPLETION_REPORT.md`, `CLAUDE.md`
- `site.config.ts`, `menu.config.ts`, `data/site-settings.json`, `lib/site-settings.ts`
- `components/ui/*`, because the root already owns its UI primitives.
- `components/configurator/*`, because runtime site-setting mutation was not part of this phase.
- `app/pages/*`, `app/posts/*`, `app/configurator/*`, and nested archive/category/tag/author routes.
- Starter assets in `public/logo.svg`, `public/next-js.svg`, and `public/wordpress.svg`.
- `components.json`, `postcss.config.js`, `next.config.ts`, `tsconfig.json`, `pnpm-lock.yaml`, and nested package manager/build metadata.

## Still Required for Comparison

Keep these nested files available until the next feature phase decides whether to implement their behavior in Astro or retire it:

- `feature-docs/estimate-details/**`
- `SUPABASE_*.md`
- `supabase-migrations.sql`
- `lib/supabase-*.ts`
- `app/estimate-details/[tenantId]/[submissionId]/page.tsx`
- `components/estimate-details/ImageGalleryClient.tsx`
- `components/estimate-details/ImageLightbox.tsx`
- `components/estimate-details/PdfViewer.tsx`
- `components/estimate-details/PdfViewerClient.tsx`
- `types/pdfjs-dist.d.ts`
- `app/api/pdf/route.ts`

Reason: Task 8 intentionally avoided copying Supabase and PDF viewer dependencies. These files remain useful references if a later task adds real estimate data fetching, gallery interaction, or PDF delivery.

## Unknown or Needs Inspection Before Cleanup

Do not remove these without a separate owner decision:

- `wordpress/**`
- `plugin/**`
- `app/api/revalidate/route.ts`
- `wordpress/next-revalidate/**`
- `plugin/next-revalidate/**`
- `Dockerfile`, `railway.json`, `railway.toml`, and `.env.example`
- `lib/wordpress.ts` and `lib/wordpress.d.ts`
- `app/api/comments/route.ts`, `app/api/analytics/route.ts`, `app/api/newsletter/route.ts`, `app/api/og/route.tsx`, `app/api/site-settings/route.ts`

Reason: these files may represent WordPress deployment, revalidation, hosting, analytics, or API behavior outside the Astro visual migration scope. They should be evaluated against deployment and integration ownership before archiving.

## Cleanup Risks

- Removing the nested repo too early would lose comparison material for unresolved estimate/Supabase/PDF behavior.
- WordPress plugin and revalidation files may be operational artifacts rather than frontend duplicates.
- Nested documentation may contain deployment assumptions that are not yet represented in root docs.
- The root still has baseline typecheck failures; cleanup should not hide whether those failures predated or followed later work.
- If future tasks need real estimate files, nested Supabase and PDF code may still be the fastest reference path.

## Prerequisites for a Future Cleanup Phase

1. Confirm the root app has owner-approved behavior for `/estimate-details`, including whether Supabase and PDF viewing are in scope.
2. Decide whether WordPress plugin/revalidation files are deployment artifacts that belong outside the frontend workspace.
3. Add or update root documentation for any nested docs that are still operationally useful.
4. Run `rg "nextjs-connect-wp-main" .` and confirm only intentional documentation/history references remain.
5. Run `npm run build` and the route validation matrix after any archive/delete operation.
6. Keep cleanup in a separate task or branch so it can be reviewed independently from the visual migration.

## Recommendation

Do not delete `nextjs-connect-wp-main` as part of this integration phase. Create a future cleanup task that first archives reference docs and build metadata, then separately reviews WordPress/plugin assets and estimate/Supabase/PDF files with explicit owner approval.
