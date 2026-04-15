# Task 3 Visual Assets and Component Audit

Date: 2026-04-15
Taskmaster tag: `next-frontend-xhome-integration`

## Scope

Audited `nextjs-connect-wp-main` as a reference source for the Astro root. No dependencies were installed and no nested files were copied in this task.

## Visual Source Inventory

| Source | Port Status | Notes |
| --- | --- | --- |
| `nextjs-connect-wp-main/app/globals.css` | Adapt selectively | Tailwind v4 CSS-first theme, prose, shadows, sidebar/chart tokens, animated links, and cursor defaults are useful. Do not wholesale replace `src/styles/global.css`; root already has active tokens, `tw-animate-css`, and component assumptions. |
| `nextjs-connect-wp-main/components/craft.tsx` | Adapt selectively | Portable layout/prose helpers: `Section`, `Container`, `Article`, `Prose`, `Box`, and `cn`. Avoid its `Layout` component because Astro owns HTML/layout through `.astro` files. |
| `nextjs-connect-wp-main/components/layout/nav.tsx` | Needs adaptation | Visual/header ideas are useful, but it depends on `next/link`, `ConfiguratorDrawer`, `MobileNav`, `siteConfig`, and runtime `SiteSettings`. Root already has `src/components/layout/header.tsx` and section header wiring. |
| `nextjs-connect-wp-main/components/layout/footer.tsx` | Needs adaptation | Visual structure is useful; depends on `next/link`, `ThemeToggle`, `siteConfig`, and `SiteSettings`. Root footer content source should remain `src/content/landing-sections/090-footer.md`. |
| `nextjs-connect-wp-main/components/nav/mobile-nav.tsx` | Needs Astro-safe rewrite | Depends on `next/link` and `next/navigation`. Visual behavior can be recreated with root `Sheet`, normal anchors, and local state. |
| `nextjs-connect-wp-main/components/theme/*` | Partially portable | `ThemeToggle` and `ThemeProvider` align with root `next-themes`; `SiteTheme` can inspire CSS variable injection, but root should not copy nested runtime settings wholesale. |
| `nextjs-connect-wp-main/components/configurator/*` | Reference-only for this phase | Depends on Next navigation, site-settings API, Supabase image upload path, and mutable JSON-backed runtime settings. Not needed for visual migration. |
| `nextjs-connect-wp-main/components/estimate-details/*` | Needs adaptation | `ImageGalleryClient` and `ImageLightbox` are client-safe with minor cleanup. `PdfViewerClient` uses `next/dynamic`; `PdfViewer` depends on `@react-pdf-viewer/core`, `pdfjs-dist`, and `/api/pdf`. Use only if Task 8 approves dependencies/helpers. |
| `nextjs-connect-wp-main/app/estimate-details/page.tsx` | Reference-only logic, useful UI | Uses Next `searchParams`, Supabase service client, and nested route conventions. Its empty/error shell and layout are useful for an Astro route rewrite. |
| `nextjs-connect-wp-main/app/posts`, `app/pages`, archive components | Skip in this phase | The current Astro root already has `/blog` and content collections. Do not adopt nested Next `/posts`, `/pages`, categories, tags, or author route structure. |
| `nextjs-connect-wp-main/public/*` | Selective asset migration | `carfit_logo-300x273.png.webp` is relevant for Carfit estimate/header contexts. `logo.svg`, `next-js.svg`, and `wordpress.svg` are starter/reference assets only unless explicitly used. |

## UI Component Comparison

Nested `components/ui`:

- `badge.tsx`
- `button.tsx`
- `dropdown-menu.tsx`
- `form.tsx`
- `input.tsx`
- `label.tsx`
- `navigation-menu.tsx`
- `pagination.tsx`
- `scroll-area.tsx`
- `select.tsx`
- `separator.tsx`
- `sheet.tsx`

Root already has broader UI coverage:

- Matching/overlapping: `badge`, `button`, `dropdown-menu`, `input`, `label`, `navigation-menu`, `scroll-area`, `separator`, `sheet`
- Root-only useful primitives: `accordion`, `avatar`, `breadcrumb`, `card`, `carousel`, `checkbox`, `collapsible`, `tabs`, `textarea`, `tooltip`, `orion-button`, `motion-*`, `border-beam`, `marquee`, `number-ticker`, `rating`
- Nested-only candidates: `form`, `pagination`, `select`

Decision: prefer root UI components. Port nested `select`, `pagination`, or `form` only if a later route requires them. Root uses the `radix-ui` aggregate package while nested components use scoped `@radix-ui/react-*` packages, so direct copy would introduce avoidable dependency churn.

## Package Classification

Already covered or equivalent in root:

- `class-variance-authority`
- `clsx`
- `lucide-react`
- `next-themes`
- `react`
- `react-dom`
- `tailwindcss`
- `@tailwindcss/typography`
- `tailwind-merge` (root is newer major)
- Radix primitives via root `radix-ui` aggregate package

Do not add during visual audit:

- `next`
- `@vercel/analytics`
- `@tailwindcss/postcss`
- `eslint-config-next`

Potential later additions, only if required by Task 8 or future approved feature work:

- `@react-pdf-viewer/core`
- `@react-pdf-viewer/page-navigation`
- `pdfjs-dist`
- `@supabase/ssr`
- `@supabase/supabase-js`
- `@supabase/auth-*`
- `react-hook-form`
- `@hookform/resolvers`
- `zod`
- `date-fns`
- `query-string`
- `use-debounce`

## Dependency Graph

| Candidate | Depends On | Next Runtime? | Server/Data Assumption | Port Decision | Target If Ported |
| --- | --- | --- | --- | --- | --- |
| Global theme tokens/prose | Tailwind v4, `@tailwindcss/typography` | No | None | Adapt selectively | `src/styles/global.css` |
| Craft `Section`/`Container`/`Prose`/`Box` | React, `clsx`, `tailwind-merge` | No | None | Adapt selectively | `src/components/layout` or `src/components/blocks` helper file |
| Header/nav visual layer | Button, Sheet, ScrollArea, site settings | Yes via `next/link`, mobile router | Nested `SiteSettings` | Rewrite in root style | `src/components/layout/header.tsx`, `src/components/layout/header-navigation.tsx` |
| Footer visual layer | Craft, ThemeToggle, site settings | Yes via `next/link` | Nested `SiteSettings` | Rewrite in root style | `src/components/layout/footer.tsx` and existing footer section data |
| Mobile nav | Sheet, ScrollArea, Separator | Yes via `next/link`, `useRouter` | Menu arrays | Rewrite with anchors | Root header/navigation components |
| Site theme runtime | `next-themes`, generated CSS variables | No for CSS injection; provider is client | Nested mutable settings JSON | Partial adaptation only | Root layout/theme components |
| Configurator | Form, Sheet, image upload, API route | Yes via `useRouter` | Writes `data/site-settings.json`; uses API route | Reference-only | None in this migration phase |
| Estimate shell | Craft, Supabase service, PDF/image components | Yes in page conventions | Supabase tables and query params | Rewrite later | `src/pages/estimate-details.astro` plus root React islands |
| Image gallery/lightbox | React state, `createPortal`, lucide icons | No | Image file array | Adapt later | Root estimate components |
| PDF viewer | `@react-pdf-viewer/core`, `pdfjs-dist`, `/api/pdf` | `PdfViewerClient` uses `next/dynamic` | Needs proxy/download API | Adapt only if dependencies approved | Root estimate components/API |
| Nested blog/posts routes | WordPress lib, Next routing, Supabase analytics | Yes | WordPress/Supabase stack | Skip | Existing Astro `/blog` |
| Public Carfit logo | Static asset | No | None | Candidate | `public/images` or `public/` if estimate/header needs it |

## Protected Boundaries

Keep these root flows as source of truth:

- `src/pages/index.astro` and `loadLandingContent()`
- `src/content/landing-sections/*`
- `src/content/landing-settings/index.md`
- `src/lib/wordpress.ts`
- `src/pages/api/forms/[formId].ts`
- `src/pages/api/booking/[calendarId]/[eventId].ts`
- Existing Astro `/blog` routes and content collection

## Recommendations for Next Tasks

1. Task 4 should map selective CSS/prose/layout helpers and explicitly avoid copying Next runtime code.
2. Task 5 can merge theme/prose tokens into `src/styles/global.css`, but should preserve root `oklch` variables unless a mapped visual requirement says otherwise.
3. Task 6 should rewrite header/footer visuals using root links/data instead of nested `SiteSettings`, `ConfiguratorDrawer`, or `next/link`.
4. Task 8 should decide separately whether PDF/Supabase dependencies are allowed; they are not required for global/homepage visual migration.
