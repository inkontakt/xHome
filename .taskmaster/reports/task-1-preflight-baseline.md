# Task 1 Preflight Baseline

Date: 2026-04-15
Branch: `connect-wp-estimate-fetch-integration`
Commit: `9539f99`
Taskmaster tag: `next-frontend-xhome-integration`

## Command Baseline

| Check | Result | Notes |
| --- | --- | --- |
| `git status --short --branch` | Pass | Initial status was clean on `connect-wp-estimate-fetch-integration`. |
| `npm run build` | Pass outside sandbox | Sandbox run failed with `GenerateContentTypesError` caused by `spawn EPERM`; rerun outside sandbox completed successfully in 6.41s. |
| `npm run check-types` | Fail | TypeScript scans `nextjs-connect-wp-main` because `tsconfig.json` includes `**/*`. It also reports existing root errors in `astro.config.mjs`, `src/lib/loaders/landing-sections-loader.ts`, and `src/lib/wordpress.ts`. |
| `npm run dev -- --host 127.0.0.1 --port 4321` | Pass outside sandbox | Sandbox run failed with `spawn EPERM` / `unlink node_modules/.vite/...`; outside sandbox dev server started at `http://127.0.0.1:4321/`. |

Build warnings observed:

- Duplicate content id `030-works-features` from `src/content/landing-sections/030-works-features.md`.
- `getStaticPaths()` ignored in dynamic page `src/pages/blog/[slug].astro` because the route is not prerendered.
- npm warns that `.npmrc` options `auto-install-peers` and `shamefully-hoist` are unknown project config values.

## Route Baseline

| Route | Status | Notes |
| --- | ---: | --- |
| `/` | 200 | Title: `Demo: Orion - AI Agent Landing Page | Shadcn Studio`. |
| `/blog` | 200 | Title: `Demo: Blog - Orion | Shadcn Studio`. |
| `/app-integration` | 200 | Title: `Demo: App Integration - Orion | Shadcn Studio`. |
| `/api/landing-content.json` | 200 | Returns landing settings/sections JSON. |
| `/api/forms/1` | 500 | Existing integration failure: `Missing required environment variable: WP_AUTH_MODE`. |
| `/api/booking/1/1` | 500 | Existing integration failure: `Missing required environment variable: WP_AUTH_MODE`. |
| `/blog/what-ai-agent-does` | 500 | Existing blog detail failure: `Cannot read properties of undefined (reading 'slug')`; root cause appears to be `getStaticPaths()` ignored on a server-rendered dynamic route, leaving `Astro.props` undefined in `src/pages/blog/[slug].astro`. |

Landing integration settings from `src/content/landing-settings/index.md`:

- `formId: 1`
- `bookingCalendarId: 1`
- `bookingEventId: 1`

## Visual Baseline

Captured screenshots:

- `.taskmaster/reports/task-1-screenshots/home-desktop.png`
- `.taskmaster/reports/task-1-screenshots/app-integration-desktop.png`
- `.taskmaster/reports/task-1-screenshots/blog-desktop.png`
- `.taskmaster/reports/task-1-screenshots/home-mobile.png`

Screenshot notes:

- Home desktop capture shows the sticky header and tab strip, but the hero area is blank/partially between animated states in headless Chrome.
- App integration desktop capture shows the sticky header, blurred hero animation state, integration tools grid, sidebar categories, and visible cards for Chat GPT, Google Docs, Google Sheets, and Google Calendar.
- Blog desktop capture shows the sticky header, blog section, category chips, and post listings. Several post images appear as broken/missing image icons.
- Home mobile capture is not a valid page baseline: it shows Chrome `ERR_CONNECTION_REFUSED`, likely from a delayed headless screenshot attempt after the dev server was stopped. Use the route status and desktop screenshot as the reliable home baseline for this task.

## Debug Instrumentation Baseline

Existing `localhost:7433` debug/instrumentation fetches are present and were not removed:

- `src/lib/wordpress.ts:149`
- `src/components/forms/DynamicFormRenderer.tsx:93`
- `src/components/forms/DynamicFormRenderer.tsx:99`
- `src/components/forms/DynamicFormRenderer.tsx:168`
- `src/components/forms/DynamicFormRenderer.tsx:173`
- `src/layouts/Layout.astro:58`
- `src/layouts/Layout.astro:65`
- `src/components/blocks/section-header.tsx:56`
- `src/components/blocks/section-header.tsx:73`
- `src/components/sections/features-section.tsx:16`
- `src/components/sections/hero-section.tsx:24`
- `src/components/sections/use-cases-section.tsx:102`
- `src/components/sections/testimonials-section.tsx:17`
- `src/components/sections/pricing-section.tsx:33`

All use debug session id `c66fb0`, run id `slow-homepage-1`, and ingest endpoint `http://localhost:7433/ingest/2b9349a0-c0a1-4e81-9aa0-918008adcca8`.

## Artifacts

- Dev stdout: `.taskmaster/reports/task-1-dev.stdout.log`
- Dev stderr: `.taskmaster/reports/task-1-dev.stderr.log`
- Screenshots: `.taskmaster/reports/task-1-screenshots/`

## Taskmaster Note

`task-master set-status` read the correct tag but failed to update canonical task status because it could not release/remove `.taskmaster/tasks/tasks.json.lock` on Windows. It wrote the intended status into `.taskmaster/tasks/.tasks.json.tmp`, but `.taskmaster/tasks/tasks.json` had to be patched directly.
