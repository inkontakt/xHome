---
name: Next Frontend Integration Into xHome
overview: Keep xHome as the primary Astro + React application while using nextjs-connect-wp-main as a reference/source folder for visual design. Phase 1 migrates the nested Next app's frontend look into existing Astro routes and data flows without deleting duplicate files.
todos:
  - id: preflight_baseline
    content: Capture current root and nested app behavior before changes, including critical routes, dependencies, assets, and integration entry points
    status: pending
  - id: isolate_reference_repo
    content: Isolate nextjs-connect-wp-main from root Astro type checking and record the existing root-only typecheck baseline before migration
    status: pending
  - id: audit_visual_assets
    content: Audit reusable visual assets from nextjs-connect-wp-main, including global theme values, layout primitives, UI components, icons, and required static assets
    status: pending
  - id: create_migration_map
    content: Create a migration map from nested design files to root Astro locations, marking untouched nested files as reference-only
    status: pending
  - id: integrate_visual_system
    content: Merge compatible theme tokens, typography, layout utilities, and reusable UI primitives into the root Astro frontend
    status: pending
  - id: restyle_existing_pages
    content: Restyle the existing homepage, blog pages, and integration-driven pages while preserving current URLs and data loaders
    status: pending
  - id: integrate_estimate_route
    content: Add or adapt the estimate-details frontend in Astro-compatible form while preserving existing query params and using existing working data/integration logic where available
    status: in_progress
  - id: validate_integration
    content: Run non-regression checks, type checks, production build, local visual inspection, and integration checks before any duplicate cleanup
    status: pending
  - id: plan_cleanup
    content: After validation, create a separate cleanup plan for duplicate nested repo files
    status: completed
isProject: false
---

# Next Frontend Integration Into xHome - Implementation Plan

> **For agentic workers:** REQUIRED SKILLS: Use `writing-plans` to execute task-by-task, `frontend-design` for the visual migration, `tailwind-design-system` for Tailwind v4 tokens and theme work, `vercel-react-best-practices` for React adaptation/performance review, and `systematic-debugging` for any build, typecheck, integration, or visual failure. Use `web-design-guidelines` for the final UI/accessibility review. Use `playwright-best-practices` if browser screenshot verification is added. Use `shadcn-ui` only when adapting shadcn/Radix-style components.

## Goal

Integrate the frontend look from `nextjs-connect-wp-main` into the main `xHome` Astro repository while preserving existing Astro routes, content loading, Astro build behavior, and working fetch/XML/WordPress integration.

## Core Decision

This plan follows a two-phase safety approach:

- **Do now:** Use `nextjs-connect-wp-main` as a reference/source folder and migrate only the visual system and selected compatible frontend pieces into the existing Astro app.
- **Do not do now:** Delete duplicate nested repo files, convert the app to Next.js, or migrate every Next-only feature system.
- **Reason:** The current integration works, and the main risk is deleting or rewiring too much before the Astro app is validated with the new look.
- **Non-regression rule:** Existing Astro/xHome logic must not be replaced, weakened, or bypassed. Enhancements should layer on top of working code paths unless a change is explicitly required and validated.
- **Typecheck reality:** Root `npm run check-types` currently fails before migration because the nested Next app is included by root TypeScript and because there are existing root type errors. Execution must isolate the nested reference folder and record the root-only baseline before judging migration regressions.
- **Tailwind reality:** The root app is already on Tailwind CSS v4 (`tailwindcss` 4.1.x with `@tailwindcss/vite` and CSS-first `@theme` usage). This is not a Tailwind upgrade project.

## Current Reality In The Codebase

- The root repo is an Astro + React app with routes under `src/pages`, components under `src/components`, global CSS under `src/styles/global.css`, and landing content under `src/content/landing-sections`.
- The nested `nextjs-connect-wp-main` folder is a full standalone Next.js app with its own `app`, `components`, `lib`, `public`, `package.json`, lockfile, configs, docs, Supabase files, and WordPress helpers.
- The root app already has active WordPress/fetch helpers in `src/lib/wordpress.ts` and a landing content loader in `src/lib/loaders/landing-sections-loader.ts`.
- The nested app contains useful visual references such as `app/globals.css`, `components/craft.tsx`, UI components, icons, and estimate/configurator UI.

## Implementation Strategy

Keep Astro as the source of truth. Preserve existing URLs such as `/`, `/blog`, and the current integration endpoints. Restyle existing pages and sections instead of replacing the app with Next.js routes.

Treat `nextjs-connect-wp-main` as a read-only reference during Phase 1. Copy or adapt only the files required by the root app. Any imported code must be made Astro-compatible before use.

Active root code must not import from `nextjs-connect-wp-main/...`. If a component, style, or asset is needed, copy/adapt it into the root structure so the root app can run without treating the nested folder as a dependency.

Before implementation, capture the current behavior of key root pages and integrations. This provides a rollback/comparison baseline and prevents visual migration work from accidentally changing existing application logic.

Do not treat pre-existing typecheck, debug instrumentation, or root content-loader issues as migration regressions. Record them before migration, then require that the migration introduces no new failures.

## Key Changes

- Preserve current Astro routes and do not introduce Next.js as a second runnable application.
- Restyle the current Astro landing sections using the nested app's visual language: theme tokens, typography, spacing, cards, buttons, prose styling, and layout primitives.
- Port selected reusable frontend pieces from `nextjs-connect-wp-main`, especially compatible layout primitives, UI components, icons, and CSS variables.
- Add explicit support for the estimate/download flow if it is part of the desired frontend, using an Astro-compatible route such as `/estimate-details` and preserving query params like `tenant_id` and `estimate_id`.
- Adapt or avoid Next-only APIs:
  - Replace `next/link` with Astro-compatible anchors or existing navigation components.
  - Avoid `next/image`, `next/navigation`, `next/cache`, App Router metadata APIs, and Next route handlers in active Astro code.
  - Replace `next/font` with the root app's existing font/CSS approach.
  - Replace `next/dynamic` with Astro/React-compatible lazy loading or a normal client island.
  - Keep existing Astro layouts and data loaders as the active runtime path.
- Keep `src/lib/wordpress.ts`, `src/lib/loaders/landing-sections-loader.ts`, and existing content files as the active data layer.
- Keep existing form, booking, WordPress, XML/fetch, and landing content logic as the source of truth. Do not swap in nested Next data helpers unless they are first adapted and proven not to break existing behavior.
- Defer Supabase comments, analytics, newsletter APIs, revalidation plugin behavior, standalone Next build config, Railway/Docker files, and Next metadata routes unless a specific UI depends on them.
- For theme/site settings, migrate the visual result of logo, menus, header/footer colors, and CSS variables; do not copy nested runtime file-writing behavior unless explicitly needed.
- Keep `nextjs-connect-wp-main` unchanged until the root Astro app builds, runs, and visually passes review.
- Add a top-level `Estimate` navigation item in the Astro header that points to the working `/estimate-details` route with preserved `tenant_id` and `estimate_id` query params.
- Update Astro navigation active-state handling so links containing query strings still highlight correctly in desktop and mobile menus.
- Mirror the Next.js estimate-details PDF rendering approach in Astro with a client-side React viewer instead of a native browser `iframe`/`object` embed.
- Add an Astro `/api/pdf` proxy/download route so PDF preview and download work through a same-origin endpoint.
- Port the Next.js estimate image popup flow into Astro with a React gallery/lightbox, full-screen modal, keyboard navigation, thumbnail strip, and scroll locking.
- Align Astro estimate-details header copy and control styling with the Next.js reference, including the fixed `6607` heading label, greeting behavior, supporting sentence, and lightbox button color adjustments.
- Add only the minimum new estimate-page dependencies required by the ported PDF viewer (`@react-pdf-viewer/core`, `pdfjs-dist`) and a local type declaration for `pdfjs-dist/build/pdf`.

## Execution Order

1. Preflight baseline and non-regression boundaries.
2. TypeScript/workspace isolation for the nested reference repo.
3. Visual asset, dependency, and component audit.
4. Migration map and file responsibility map.
5. Global visual system integration.
6. Header/footer/logo/menu visual layer.
7. Homepage restyle.
8. Estimate details route integration, gated after the base visual system is stable.
9. Blog visual alignment.
10. Validation and final UI/accessibility review.
11. Cleanup planning only.

## Current Status Snapshot

**Completed**

- Astro estimate-details route is present and wired to preserved `tenant_id` and `estimate_id` query params.
- Header menu includes an `Estimate` entry that links to the Astro estimate-details route.
- Header navigation active-state logic handles menu links that include query strings.
- Astro estimate data loading remains rooted in `src/lib/estimate-data.ts`.
- Astro PDF proxy/download endpoint exists at `src/pages/api/pdf.ts`.
- Astro PDF display now uses a client-side React viewer instead of a browser-native embed.
- Astro estimate image gallery now uses a full-screen lightbox flow with thumbnail strip, keyboard navigation, and scroll lock.
- Estimate-page header copy has been aligned to the current Next.js reference for the heading, greeting logic, and supporting sentence.
- Estimate lightbox button styling has been adjusted for visibility/readability.
- Required viewer dependencies were added to root `package.json`.
- Local `pdfjs-dist/build/pdf` typing support was added.
- Duplicate cleanup has been executed by removing the nested `nextjs-connect-wp-main` folder after confirming the active Astro app did not import from it.
- Root `tsconfig.json` was simplified to remove the stale `nextjs-connect-wp-main` exclusion after the folder deletion.

**In Progress**

- Task 5: estimate-details parity and validation are partially complete. Core implementation is done, but browser-level validation and a few parity decisions remain open.

**Not Done Yet**

- Preflight baseline documentation is not yet recorded in this plan as completed.
- Nested Next.js reference repo isolation from root type checking is not yet recorded as completed.
- Visual asset audit, migration map, global visual system integration, homepage restyle, blog alignment, and overall integration validation are not yet recorded as completed.
- Browser verification of the Astro estimate route is still pending.
- End-to-end verification of PDF downloads and viewer behavior with real data is still pending.
- Final decision on any remaining structural parity differences, such as sticky gallery/layout behavior, is still pending.
- Root `npm run check-types` still reports pre-existing root-only issues in `astro.config.mjs`, booking/form code, `src/lib/loaders/landing-sections-loader.ts`, and `src/lib/wordpress.ts`.
- Root `npm run build` still hits a pre-existing `.vite` cache unlink `EPERM` issue under `node_modules`.

## File Responsibility Map

- `tsconfig.json`: keep root type checking focused on active Astro source; exclude or otherwise isolate `nextjs-connect-wp-main` as reference code.
- `src/styles/global.css`: Tailwind v4 theme tokens, CSS variables, typography, dark mode, and prose styling.
- `src/components/ui/*`: reused/adapted UI primitives; prefer existing root components over duplicated nested components.
- `src/components/sections/*`: visual restyling only; keep incoming props and content contracts unchanged.
- `src/components/layout/*`: header/footer/navigation visual alignment if needed; preserve existing route behavior.
- `src/pages/index.astro`: preserve `loadLandingContent()` and current section ordering while changing visual composition only if necessary.
- `src/pages/estimate-details.astro` or equivalent: Astro-compatible estimate/download route if implemented.
- `src/pages/api/*`: preserve existing form, booking, landing-content, and integration routes; add compatible helpers only when needed for estimate/PDF behavior.
- `src/lib/*`: preserve existing WordPress/fetch/XML helpers; do not replace with nested Next helpers.
- `public/*`: only required migrated assets such as logo/images/icons used by active root pages.
- `nextjs-connect-wp-main/*`: reference-only during Phase 1; active root code must not import from it.

## Preflight Checklist

Before migrating any frontend code, record the current state:

- Run `git status --short` and note tracked/untracked files.
- Run `npm run dev` and record whether the root Astro app starts.
- Run `npm run build` and record whether the current root build succeeds or fails.
- Run `npm run check-types` and save the output as the pre-isolation typecheck baseline.
- Manually test `/` in the browser.
- Manually test `/blog` in the browser.
- Manually test one existing blog detail route.
- Manually test any existing route or page that exercises the working fetch/XML/WordPress integration.
- Capture screenshots or manual visual notes for `/`, `/blog`, and any integration-driven page.
- Optionally test whether `nextjs-connect-wp-main` can still run/build independently for reference integrity. This is useful but not required for the Astro migration unless preserving the nested app as runnable is made a separate requirement.

Do not assume `npm run build` or `npm run check-types` currently passes. If either fails before migration, record it as baseline and require that migration introduces no new unrelated failures.

## Checkpoint Guidance

After Task 0 and Task 0.5 complete:

- Record `git status --short` again.
- Keep the preflight notes and typecheck/build output available for comparison.
- Create a commit or checkpoint if the repository workflow allows it.
- Do not begin visual migration until the nested reference repo is isolated from root type checking and the baseline is documented.

## Task 0: Preflight Baseline And Non-Regression Boundaries

**Files and routes to inspect:**

- `src/pages/index.astro`
- `src/layouts/Layout.astro`
- `src/lib/wordpress.ts`
- `src/lib/loaders/landing-sections-loader.ts`
- `src/components/forms/DynamicFormRenderer.tsx`
- `/`
- `/blog`
- One existing blog detail route
- Any current route/page that exercises the working fetch/XML/WordPress integration
- `nextjs-connect-wp-main/app/page.tsx`
- `nextjs-connect-wp-main/app/estimate-details/page.tsx`
- `nextjs-connect-wp-main/app/estimate-details/[tenantId]/[submissionId]/page.tsx`
- `nextjs-connect-wp-main/app/configurator/page.tsx`

**Steps:**

1. Record the current root Astro behavior and critical data flow before making changes.
2. Capture visual baselines or manual notes for the root homepage, blog, and any integration-driven page.
3. Capture visual baselines or manual notes for the nested Next homepage and estimate-details page if runnable.
4. Identify root files whose logic must be preserved and treat them as non-regression boundaries.
5. Confirm that any planned change is additive or visual unless it is explicitly required for compatibility.
6. Identify existing debug/instrumentation fetches to `http://localhost:7433/ingest/...`; do not remove them during this migration unless separately approved.
7. Record that these debug calls may appear during network/performance validation and should not be confused with newly introduced migration behavior.
8. Run the full preflight checklist and store results in notes or a baseline artifact that the next executor can inspect.

## Task 0.5: Isolate Nested Reference Repo And Record Typecheck Baseline

**Files to inspect or modify:**

- `tsconfig.json`
- `package.json`
- `astro.config.mjs`
- `nextjs-connect-wp-main`
- `src/lib/loaders/landing-sections-loader.ts`
- `src/lib/wordpress.ts`

**Current known state:**

- `tsconfig.json` includes `**/*` and only excludes `dist`.
- Because of that, root `npm run check-types` currently scans `nextjs-connect-wp-main`.
- The nested app expects Next.js runtime modules, its own `@/` alias, and nested-only dependencies, so it causes many root typecheck errors.
- Root typecheck also currently reports root-only issues in `astro.config.mjs`, `src/lib/loaders/landing-sections-loader.ts`, and `src/lib/wordpress.ts`.

**Steps:**

1. Treat `nextjs-connect-wp-main` as reference code, not active root TypeScript source.
2. Update root TypeScript validation boundaries so the nested folder is excluded from root `npm run check-types`.
3. Run `npm run check-types` again and record remaining root-only errors as the pre-existing baseline.
4. Do not fix unrelated root-only type errors as part of visual migration unless they block build/runtime validation.
5. During migration, require that no new root type errors are introduced beyond the recorded baseline.

## Task 1: Audit Visual Assets

**Files to inspect:**

- `nextjs-connect-wp-main/app/globals.css`
- `nextjs-connect-wp-main/components/craft.tsx`
- `nextjs-connect-wp-main/components/ui`
- `nextjs-connect-wp-main/components/layout`
- `nextjs-connect-wp-main/components/icons`
- `nextjs-connect-wp-main/public`
- Existing root equivalents under `src/components`, `src/styles/global.css`, and `public`
- `nextjs-connect-wp-main/site.config.ts`
- `nextjs-connect-wp-main/menu.config.ts`
- `nextjs-connect-wp-main/data/site-settings.json`
- `nextjs-connect-wp-main/lib/site-settings.ts`
- Root `package.json`
- Nested `nextjs-connect-wp-main/package.json`

**Steps:**

1. List nested components that are purely visual and compatible with React in Astro.
2. List components that depend on Next.js APIs and must be adapted or skipped.
3. Compare nested UI components against root `src/components/ui` to avoid unnecessary duplicate imports.
4. Identify required static assets and icons.
5. Audit component dependencies against root `package.json`; add only minimum required packages during implementation.
6. Identify Next-only dependencies and APIs that must not enter active Astro code.
7. Record which files are source references only and which files should be migrated.

**Component dependency graph format:**

For every candidate nested component, record:

```text
nextjs-connect-wp-main/components/example.tsx
  depends on packages: React, Tailwind, ...
  imports next/*: yes/no
  imports nested lib/data: yes/no
  browser-only behavior: yes/no
  server-only behavior: yes/no
  port status: ready / needs adaptation / skip / reference only
  target root location: src/...
  notes: specific adaptation required
```

Use this graph to prevent scope creep during Tasks 3-5.

**Dependency policy:**

- Do not install `next`.
- Do not install nested dependencies wholesale.
- Prefer existing root dependencies and versions.
- Add only packages required by migrated active root components.
- Add PDF packages such as `pdfjs-dist` or viewer libraries only if the implemented Astro estimate route actually needs them.
- Do not add Supabase packages unless the estimate route requires active Supabase access and an Astro-compatible data path is approved.

## Task 2: Create Migration Map

**Expected mapping:**

- Nested design primitives -> `src/components`
- Nested UI components -> existing `src/components/ui` where possible
- Nested global theme values -> `src/styles/global.css`
- Required static assets -> `public`
- Nested app routes -> existing Astro pages, not copied as Next routes
- Nested site/menu settings -> root config/content/static data or CSS variables, not nested file-write runtime behavior
- Estimate route visuals -> Astro-compatible page/component using preserved query params and existing/root-compatible data helpers

**Steps:**

1. Decide the final root location for each reusable visual primitive.
2. Prefer modifying existing root components over adding a parallel duplicate component tree.
3. Mark skipped files explicitly, especially Next configs, package files, deployment files, docs, Supabase-only files, and Next route handlers.
4. Keep route names unchanged.
5. Mark root files whose functional logic should not be changed except for visual composition.
6. Create a short route priority checklist: global theme first, header/footer second, homepage third, estimate route fourth, blog alignment fifth.

## Task 3: Integrate Visual System

**Files likely to modify:**

- `src/styles/global.css`
- Existing section components under `src/components/sections`
- Existing shared UI under `src/components/ui`
- New or adapted layout primitives under `src/components`

**Steps:**

1. Merge compatible Tailwind v4 theme tokens into root global CSS.
2. Preserve root tokens currently used by active components unless replacing them is required for visual parity.
3. Add or adapt a Craft-style layout utility component set for React islands.
4. Ensure typography and prose styles work for landing content and blog content.
5. Confirm no active root code imports from `next/*`.
6. Confirm no active root code imports from `nextjs-connect-wp-main/*`.
7. Migrate only required logo/image assets into root `public`; avoid copying social metadata images unless the Astro SEO layer needs them.
8. Use `tailwind-design-system` rules for Tailwind v4 CSS-first tokens, dark mode, and responsive component styling.

## Task 4: Restyle Existing Pages

**Pages to preserve:**

- `/`
- `/blog`
- Existing blog detail pages
- Current integration-driven pages and APIs

**Steps:**

1. Update current homepage sections to use the new visual language while still reading from `src/content/landing-sections`.
2. Keep current blog and content routes intact.
3. Keep form, booking, landing content, and WordPress/fetch integrations wired through existing Astro code.
4. Avoid replacing current content with the nested Next starter homepage copy.
5. Confirm mobile and desktop layouts remain readable with no text overflow or incoherent overlap.
6. Confirm `/` still calls `loadLandingContent()` and landing section Markdown files remain the content source.

## Task 5: Integrate Estimate Details Route

**Target behavior:**

- Provide the nested app's estimate/download frontend experience in the root Astro app if this flow is part of the migrated look.
- Preserve `/estimate-details` style access with query params `tenant_id` and `estimate_id`.
- Use existing root integration logic where available. If root does not already expose the required estimate data, add an Astro-compatible helper or endpoint instead of copying Next server code directly.
- Execute this task only after the global visual system, header/footer layer, and homepage restyle are stable.
- Treat the estimate route as in-scope for Phase 1, but gate successful dynamic-data validation on known valid `tenant_id` and `estimate_id` values.

**Files to inspect:**

- `nextjs-connect-wp-main/app/estimate-details/page.tsx`
- `nextjs-connect-wp-main/app/estimate-details/[tenantId]/[submissionId]/page.tsx`
- `nextjs-connect-wp-main/components/estimate-details`
- `nextjs-connect-wp-main/app/api/pdf/route.ts`
- `nextjs-connect-wp-main/lib/supabase-server.ts`
- Current root integration files under `src/lib` and `src/pages/api`

**Steps:**

1. Port only the visual/client-safe estimate components needed for the UI.
2. Replace `next/dynamic` and other Next-only code with Astro/React-compatible patterns.
3. Do not copy `lib/supabase-server.ts` directly if it depends on `next/headers`.
4. Preserve existing query parameter names and expected URLs.
5. Keep PDF/image rendering behind root-compatible routes or helpers.
6. Verify the estimate route does not break homepage, blog, forms, booking, or WordPress behavior.
7. If root does not have known test values for `tenant_id` and `estimate_id`, validate the route shell, empty state, and query parsing without inventing fake successful data behavior.
8. If valid estimate test IDs are discovered, validate the dynamic PDF/image behavior against those IDs; otherwise document that dynamic-data validation remains pending test data.

**Completed so far in Astro (`src/pages/estimate-details.astro` and related files):**

- Added/retained the Astro route shell for `/estimate-details` with preserved `tenant_id` and `estimate_id` query parsing.
- Added a header menu link for the estimate route in `src/components/sections/header-section.tsx`.
- Updated `src/components/layout/header-navigation.tsx` so links with query strings can be treated as active navigation targets.
- Kept Astro-side estimate data loading in `src/lib/estimate-data.ts` as the active source instead of importing the Next.js server helper directly.
- Added Astro PDF proxy/download handling in `src/pages/api/pdf.ts`.
- Switched Astro PDF display from a native embed to a React viewer island in `src/components/estimate-details/pdf-viewer.tsx`.
- Added `src/types/pdfjs-dist.d.ts` to support the PDF viewer import.
- Installed the minimum viewer dependencies in root `package.json`: `@react-pdf-viewer/core` and `pdfjs-dist`.
- Replaced static image links with a React gallery/lightbox flow using:
  - `src/components/estimate-details/image-gallery.tsx`
  - `src/components/estimate-details/image-lightbox.tsx`
- Matched the Astro estimate-page text closer to the Next.js reference:
  - fixed heading number `6607`
  - greeting fallback logic
  - supporting sentence capitalization
- Adjusted image lightbox control styling for visibility and closer visual parity:
  - dark text on the tinted `Next` button
  - white close button label

**Still pending for Task 5 completion:**

- Browser-side validation that the Astro estimate route now visually matches the Next.js reference closely enough on desktop and mobile.
- Direct verification that the Astro PDF download buttons work end-to-end with real data and that `/api/pdf` returns a valid attachment response in-browser.
- Direct verification that the lightbox interaction, keyboard controls, thumbnail strip, and close/next/previous buttons behave correctly in-browser.
- Decision on whether the Astro estimate layout should also adopt the Next.js sticky image-gallery ordering (`lg:order-2 lg:sticky lg:top-24`) for closer structural parity.
- Final confirmation that the current Astro estimate header copy should remain intentionally fixed to the Next.js reference text instead of dynamically reflecting submission title text.

**Task 5 completion rule for this plan:**

- Mark `integrate_estimate_route` as `completed` only after the pending browser verification items above are checked off or explicitly waived/documented.

## Task 6: Validate Integration

**Commands:**

```bash
npm run check-types
npm run build
npm run dev
```

**Typecheck expectations:**

- `npm run check-types` should not scan `nextjs-connect-wp-main` after isolation.
- If pre-existing root-only type errors remain, compare against the recorded baseline.
- Migration is acceptable only if it introduces no new type errors beyond that baseline.

**Manual checks:**

- Visit `/`.
- Visit `/blog`.
- Visit one blog detail page.
- Visit any page that uses the working fetch/XML/WordPress integration.
- Visit `/estimate-details?tenant_id=<known-test-tenant>&estimate_id=<known-test-estimate>` if known test values are available.
- Verify the header menu `Estimate` link navigates to the Astro estimate route and remains visibly active.
- Verify both estimate-page PDF download buttons trigger a real file download from the Astro `/api/pdf` endpoint.
- Verify the Astro PDF viewer renders the document instead of falling back to the browser-native PDF viewer UI.
- Verify image thumbnails open the Astro lightbox, `Esc` closes it, arrow keys navigate, and the thumbnail strip updates the selected image.
- Verify the lightbox button colors/text remain readable against the active theme.

**Acceptance criteria:**

- Root Astro app builds successfully.
- No active imports from `next/*`.
- Existing content still renders.
- Existing URLs still work.
- Existing fetch/XML/WordPress integration still works.
- Existing Astro build behavior still works.
- `/` still loads through `loadLandingContent()`.
- Landing section Markdown files still control landing content.
- Existing API routes under `src/pages/api/forms`, `src/pages/api/booking`, and `src/pages/api/landing-content.json.ts` still behave as before.
- Existing WordPress/fetch helpers still use `src/lib/wordpress.ts`.
- Existing form and booking behavior still works if configured.
- Visual system is applied consistently.
- Mobile and desktop layouts do not overflow or overlap.
- The Astro estimate route is reachable from the header menu and preserves the working query params.
- The Astro estimate route uses the same broad UX structure as the Next.js reference:
  - fixed estimate heading line
  - person greeting/fallback
  - client-side PDF viewer
  - same-origin PDF download route
  - full-screen image lightbox with navigation controls
- `nextjs-connect-wp-main` is not required as a runnable nested app.
- Root code does not import from the nested folder.
- Root code does not depend on Next.js runtime APIs.
- No new uncontrolled debug/instrumentation fetches are added.
- Final UI/accessibility review is performed with `web-design-guidelines`.
- If browser verification is available, desktop and mobile screenshots are checked using Playwright-compatible practices.

## Task 7: Cleanup Planning Only

After successful validation, create a separate cleanup plan for duplicate nested repo files. Do not delete duplicate files in this plan.

The cleanup plan should classify nested files into:

- Migrated and safe to remove later.
- Reference-only and safe to archive later.
- Still required for comparison.
- Unknown and requiring another inspection pass.

## Cleanup Execution Update

Cleanup was completed conservatively after confirming that active root Astro code did not import from `nextjs-connect-wp-main`.

**Executed changes**

- Removed the full nested `nextjs-connect-wp-main` standalone Next.js project from the repository.
- Kept all active root Astro code under `src`, `public`, root config files, and existing integrations unchanged.
- Removed the obsolete `nextjs-connect-wp-main` entry from root `tsconfig.json` because the folder no longer exists.

**Verification results after cleanup**

- Search confirmed there are no active root imports or runtime references to `nextjs-connect-wp-main`.
- The only remaining textual references to `nextjs-connect-wp-main` are in this plan document.
- `npm run check-types` still fails, but the failures are root-only and pre-existing rather than caused by nested Next.js code.
- `npm run build` still fails because of a pre-existing `.vite` cache unlink permission error, not because of the cleanup.

**Non-regression conclusion**

- Active Astro logic structure was not changed by cleanup.
- The cleanup removed duplicate/reference-only project material, not working root runtime code.
- Remaining validation work is now focused entirely on the root Astro application.

## Public Interfaces

- No framework-level public API change.
- No URL changes in Phase 1.
- `nextjs-connect-wp-main` has been removed after the visual migration work that depended on it was already ported into the root app.
- Existing landing content remains in `src/content/landing-sections`.
- Existing WordPress/fetch helpers remain in `src/lib/wordpress.ts`.
- Astro pages remain the routing source.
- New or adapted frontend utilities may be added under `src/components`, but they must not require Next.js runtime APIs.
- Existing working logic is protected as a non-regression boundary; changes should enhance visuals or add compatible surfaces, not replace working Astro behavior.

## Assumptions

- Astro remains the main application framework.
- The first goal is visual parity, not full Next feature parity.
- Existing URLs are preserved.
- Existing working fetch/XML/WordPress integration remains the source of truth.
- Duplicate cleanup has now been performed because the nested Next.js app was no longer part of the active runtime path.
- Any missing package should be added only after confirming the specific migrated component needs it.
