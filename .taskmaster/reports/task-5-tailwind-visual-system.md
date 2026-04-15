# Task 5 Tailwind Visual System Integration

Date: 2026-04-15
Taskmaster tag: `next-frontend-xhome-integration`

## Changes

Added a root-owned Craft-style layout helper:

- `src/components/layout/craft.tsx`

Exports:

- `Section`
- `Container`
- `Article`
- `Prose`
- `Box`

The helper adapts the useful layout/prose patterns from the nested reference repo without importing from `nextjs-connect-wp-main` and without introducing any `next/*` runtime API.

## CSS Boundary

`src/styles/global.css` already contains the compatible Tailwind v4 visual-system layer identified in Tasks 3 and 4:

- Tailwind v4 CSS-first theme tokens
- `tw-animate-css`
- OKLCH semantic token model
- prose styles
- `link-animated`
- dark-mode token overrides
- cursor defaults for interactive menu/listbox controls

No extra global CSS churn was needed in this task. The current root token model was preserved.

## Verification

| Check | Result | Notes |
| --- | --- | --- |
| `npm run build` | Pass | Build completed outside sandbox after adding `src/components/layout/craft.tsx`. Existing `/blog/[slug].astro` `getStaticPaths()` warning remains. |
| `npm run check-types` | Fails, expected | Failure remains the Task 2 root-only baseline. `src/components/layout/craft.tsx` is not reported. Output saved to `.taskmaster/reports/task-5-check-types.log`. |
| Forbidden import search | Pass | Only `tsconfig.json` contains `nextjs-connect-wp-main`, as the intentional exclude entry. |

Forbidden import search:

```powershell
rg "nextjs-connect-wp-main|next/link|next/navigation|next/dynamic|next/server|next/cache|next/font" src tsconfig.json package.json
```

Result:

```text
tsconfig.json:    "nextjs-connect-wp-main"
```

## Notes for Later Tasks

Later visual tasks can use `src/components/layout/craft.tsx` as a root-safe layout/prose primitive instead of copying `nextjs-connect-wp-main/components/craft.tsx`.
