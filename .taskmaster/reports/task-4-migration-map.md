# Task 4 Migration Map and Responsibility Boundaries

Date: 2026-04-15
Taskmaster tag: `next-frontend-xhome-integration`

## Execution Order

1. Global theme and layout primitives
2. Header, footer, logo, and menu visual layer
3. Homepage section restyling
4. Astro-compatible estimate details route
5. Blog visual alignment
6. Final validation and UI/accessibility review

## File Migration Map

| Area | Nested Reference | Root Target | Action |
| --- | --- | --- | --- |
| Tailwind theme tokens | `nextjs-connect-wp-main/app/globals.css` | `src/styles/global.css` | Merge selectively: prose styles, token aliases, shadows, animated link, cursor defaults. Preserve root `@import 'tw-animate-css'`, active `oklch` token model, and existing component tokens unless a later visual task explicitly changes them. |
| Craft layout helpers | `nextjs-connect-wp-main/components/craft.tsx` | New `src/components/layout/craft.tsx` or local helper under `src/components/blocks/` | Port only `Section`, `Container`, `Article`, `Prose`, `Box`, and `cn`-style helpers if they reduce duplicated layout work. Do not port nested `Layout`. |
| Header visual treatment | `nextjs-connect-wp-main/components/layout/nav.tsx`, `components/nav/mobile-nav.tsx` | `src/components/layout/header.tsx`, `src/components/layout/header-navigation.tsx`, possibly `src/components/sections/header-section.tsx` | Rewrite with root anchors, root `Sheet`, root content/routes. Do not import `next/link`, `next/navigation`, `ConfiguratorDrawer`, or nested `SiteSettings`. |
| Footer visual treatment | `nextjs-connect-wp-main/components/layout/footer.tsx` | `src/components/layout/footer.tsx`, `src/components/sections/footer-section.tsx` | Rewrite visual structure while preserving root footer Markdown content and newsletter behavior. |
| Theme toggle/provider | `nextjs-connect-wp-main/components/theme/theme-toggle.tsx`, `theme-provider.tsx`, `site-theme.tsx` | Existing `src/components/layout/theme-toggle.tsx`, `src/layouts/Layout.astro`, `src/styles/global.css` | Use as reference only. Root already uses `next-themes`; avoid copying nested runtime settings injection unless needed for tokens. |
| UI components | `nextjs-connect-wp-main/components/ui/*` | Existing `src/components/ui/*` | Prefer root components. Only add/adapt `select`, `pagination`, or `form` if a later route requires them. |
| Estimate shell | `nextjs-connect-wp-main/app/estimate-details/page.tsx` | New `src/pages/estimate-details.astro` | Rebuild in Astro with query parsing for `tenant_id` and `estimate_id`, empty/error states, and React islands only where needed. |
| Estimate image UI | `nextjs-connect-wp-main/components/estimate-details/ImageGalleryClient.tsx`, `ImageLightbox.tsx` | New `src/components/estimate-details/` | Adapt as client React components. Replace Next lint comments with plain `<img>` guidance. |
| Estimate PDF UI | `nextjs-connect-wp-main/components/estimate-details/PdfViewer.tsx`, `PdfViewerClient.tsx`, `app/api/pdf/route.ts` | Optional `src/components/estimate-details/` and `src/pages/api/pdf.ts` | Task 8 decision gate. Requires approved PDF dependencies/helpers. Do not copy `next/dynamic` or Next route handler code. |
| Carfit logo asset | `nextjs-connect-wp-main/public/carfit_logo-300x273.png.webp` | `public/images/` or existing `public/` target selected by Task 6/8 | Copy only if header/footer or estimate route uses Carfit branding. |
| Starter icons | `nextjs-connect-wp-main/public/logo.svg`, `next-js.svg`, `wordpress.svg` | None by default | Reference-only unless explicitly needed. |
| Site settings | `nextjs-connect-wp-main/site.config.ts`, `menu.config.ts`, `data/site-settings.json`, `lib/site-settings.ts` | Existing root Markdown/content config, optional static constants only if needed | Do not copy mutable JSON settings or file-writing behavior. Extract only static labels/URLs after confirming they are wanted. |
| Nested WordPress/posts routes | `nextjs-connect-wp-main/app/posts`, `app/pages`, `lib/wordpress.ts` | None | Skip. Root Astro blog and WordPress integration routes remain source-of-truth. |

## Protected Source-of-Truth Boundaries

Do not replace or bypass these files/flows during visual migration:

- `src/pages/index.astro`: must continue to call `loadLandingContent()`.
- `src/lib/loaders/landing-sections-loader.ts`: remains the landing content assembly boundary.
- `src/content/landing-sections/*.md`: remains the homepage section content source.
- `src/content/landing-settings/index.md`: remains the page settings/integration content source.
- `src/lib/wordpress.ts`: remains the root WordPress/Fluent API integration boundary.
- `src/pages/api/forms/[formId].ts`: remains the root Fluent Forms API route.
- `src/pages/api/booking/[calendarId]/[eventId].ts`: remains the root Fluent Booking API route.
- `src/pages/blog/index.astro` and `src/pages/blog/[slug].astro`: remain the Astro blog route owners.
- `nextjs-connect-wp-main/**`: remains reference-only until a specific task copies an approved asset/component into root.

## Forbidden Direct Imports

Implementation tasks should not introduce active imports from:

- `nextjs-connect-wp-main/*`
- `next/link`
- `next/navigation`
- `next/dynamic`
- `next/server`
- `next/cache`
- `next/font/*`
- `@supabase/*` unless Task 8 explicitly approves data integration dependencies
- `@react-pdf-viewer/*` or `pdfjs-dist` unless Task 8 explicitly approves PDF rendering

## Route Priority Checklist

### Global Theme

- Update `src/styles/global.css` first.
- Confirm build still passes.
- Confirm `npm run check-types` remains no worse than the Task 2 root-only baseline.
- Search for accidental `next/*` or nested imports.

### Header/Footer

- Align `src/components/layout/header.tsx`, `src/components/layout/header-navigation.tsx`, `src/components/layout/footer.tsx`, and section wrappers as needed.
- Keep existing root route links stable: `/`, `/blog`, `/app-integration`, auth routes, and any later `/estimate-details`.
- Copy Carfit logo only if the route design explicitly needs it.

### Homepage

- Restyle `src/components/sections/*` and `src/components/blocks/*` while preserving props and Markdown-backed content.
- Do not replace homepage content with nested Next starter content.
- Check desktop/mobile for overflow, overlap, and animation blank states noted in Task 1.

### Estimate Route

- Create Astro shell after global/header/homepage are stable.
- Preserve query params: `tenant_id`, `estimate_id`.
- Validate empty state when IDs are absent and error state when integration data is unavailable.
- Add PDF/image helpers only when required and explicitly mapped.

### Blog

- Align `/blog` and one detail route visually.
- Do not adopt nested `/posts`, `/pages`, category, tag, or author route hierarchy.
- Address or document the existing Task 1 blog-detail runtime failure before relying on detail screenshots.

## Validation Gates

Each implementation task should run:

- `npm run build`
- `npm run check-types` and compare against Task 2 baseline
- `rg "nextjs-connect-wp-main|next/link|next/navigation|next/dynamic|next/server|next/cache|next/font" src tsconfig.json package.json`

The final integration task should also rerun the Task 1 route baseline.
