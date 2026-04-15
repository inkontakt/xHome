# Task 6 - Header, Footer, Logo, and Menu Visual Alignment

Date: 2026-04-15
Tag: next-frontend-xhome-integration

## Scope

Aligned the root Astro header, desktop navigation, mobile menu, and footer with the compact visual rhythm of the nested Next reference while preserving root-owned data, routing, logo usage, and component boundaries.

## Files Updated

- `src/components/layout/header.tsx`
- `src/components/layout/header-navigation.tsx`
- `src/components/layout/footer.tsx`

## Implementation Notes

- Kept `Logo`, `ThemeToggle`, root navigation data, and existing route hrefs as the source of truth.
- Added `header-menu` and `footer-menu` class hooks already supported by the global visual layer.
- Narrowed header/footer containers from `max-w-7xl` to `max-w-5xl`, matching the nested reference density without copying nested runtime code.
- Refined desktop navigation to compact, button-like active and hover states using root tokens.
- Refined mobile sheet spacing, width, border treatment, and active menu styling.
- Refined footer newsletter and link grids for a tighter two-column desktop rhythm and cleaner mobile stacking.

## Boundary Checks

- No active imports from `nextjs-connect-wp-main`.
- No active imports from `next/link`, `next/navigation`, `next/dynamic`, `next/server`, `next/cache`, or `next/font`.
- The only `nextjs-connect-wp-main` search hit remains the intentional `tsconfig.json` exclusion.

## Validation

- `npm run build`
  - Sandbox result: failed with known Windows/Astro `spawn EPERM`.
  - Escalated result: passed.
  - Existing warning remains: `getStaticPaths()` ignored in SSR dynamic page `src/pages/blog/[slug].astro`.
- `npm run check-types`
  - Still fails with known Task 2 baseline errors in:
    - `astro.config.mjs`
    - `src/components/forms/DynamicFormRenderer.tsx`
    - `src/lib/loaders/landing-sections-loader.ts`
    - `src/lib/wordpress.ts`
  - No new type errors were reported in the updated header/footer files.
- `git diff --check -- src/components/layout/header.tsx src/components/layout/header-navigation.tsx src/components/layout/footer.tsx`
  - Passed; only existing line-ending warnings were reported.
