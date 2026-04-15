# Task 2 Typecheck Isolation

Date: 2026-04-15
Taskmaster tag: `next-frontend-xhome-integration`

## Change

Updated `tsconfig.json` so the nested Next reference repository is no longer part of root Astro TypeScript validation:

```json
"exclude": [
  "dist",
  "nextjs-connect-wp-main"
]
```

This keeps `nextjs-connect-wp-main` available as a reference source while preventing root `npm run check-types` from scanning its Next-specific app, routes, and dependencies.

## Verification

| Check | Result | Notes |
| --- | --- | --- |
| `npm run check-types` | Fails, expected | `nextjs-connect-wp-main` and `next/*` errors are gone. Remaining errors are root-only baseline errors. |
| `rg "nextjs-connect-wp-main|next/server|next/cache|next/navigation|next/font" tsconfig.json src astro.config.mjs package.json` | Pass | Only remaining match is the intentional `tsconfig.json` exclude entry. |
| `npm run build` | Pass | Build completed outside sandbox after the tsconfig change. Existing warning remains for `src/pages/blog/[slug].astro` `getStaticPaths()` being ignored. |

## Remaining Root-Only Typecheck Baseline

Remaining `npm run check-types` failures are now in active root files:

- `astro.config.mjs`: Vite plugin type mismatch between root `vite` and Astro's nested `vite` types.
- `src/components/forms/DynamicFormRenderer.tsx`: form/booking response shape typing issues, including `enabled`, `slots`, and `placeholder`.
- `src/lib/loaders/landing-sections-loader.ts`: Astro content collection narrowing issues where entries are inferred as `never`, plus section typing mismatches.
- `src/lib/wordpress.ts`: `APIRoute` is used as if it exposes `params` directly.

No Next reference repo errors remain after the isolation change.
