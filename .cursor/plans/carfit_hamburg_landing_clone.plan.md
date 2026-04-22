---
name: Carfit Hamburg Landing Page Clone Plan
overview: Build a new Astro route at /carfit-hamburg that recreates the carfit-hamburg.de homepage as closely as practical inside the existing Astro app, keeping the existing shared Astro header as the only page header and implementing the Carfit clone as a dedicated page body below it.
todos:
  - id: capture_reference
    content: Inspect the live reference page and record the exact section order, repeated patterns, key copy blocks, and visible CTA/contact elements
    status: pending
  - id: collect_assets
    content: Gather or recreate all required Carfit assets, including logos, photos, icons, colors, contact details, and any typography requirements
    status: pending
  - id: create_route_shell
    content: Add the new /carfit-hamburg Astro page using the existing shared Layout and SEO wrapper so the existing Astro header remains the only page header
    status: pending
  - id: wire_navigation
    content: Add the Carfit Hamburg menu entry to the shared desktop and mobile navigation without regressing existing header behavior
    status: pending
  - id: build_sections
    content: Implement the Carfit page body section by section in the same order as the reference site, starting with hero and ending with contact/footer CTA
    status: pending
  - id: scope_styles
    content: Add Carfit-specific styling and local design tokens without leaking the visual system into unrelated pages
    status: pending
  - id: responsive_polish
    content: Tune the page for mobile, tablet, desktop, and wide desktop so spacing and layout remain faithful to the reference
    status: pending
  - id: verify_and_refine
    content: Compare the Astro result against the live reference, fix mismatches, and run non-mutating verification commands
    status: pending
isProject: false
---

# Carfit Hamburg Landing Page Clone Plan

## Summary
Build a new Astro route at `/carfit-hamburg` that recreates the `carfit-hamburg.de` homepage as closely as practical inside the existing Astro app. The page will keep the existing shared Astro header as the only page header, avoid any duplicate Carfit-style top bar, and implement the Carfit landing-page body as a dedicated static page/component set for maximum visual fidelity with minimal structural risk.

## Core Decisions
- Create a dedicated Astro page for the Carfit clone rather than extending the current content-driven homepage system.
- Keep the shared Astro layout, SEO wrapper, and existing site header/navigation.
- Rebuild the Carfit page natively in Astro/Tailwind instead of copying production HTML/CSS.
- Reuse original Carfit assets and copy, assuming you have permission to use them.
- Keep Carfit-specific styling scoped to the new page/component set so the clone does not disturb the current global landing-page appearance.
- Add the new route to the shared site menu carefully as a small, isolated enhancement.
- Do not render a second Carfit-style top bar below the Astro header.

## Public Interfaces / Structure
- New public route: `/carfit-hamburg`
- New shared navigation item:
  label should be `Carfit Hamburg` unless a shorter menu label is later requested.
- No backend/API contract changes are required.
- No changes to the existing landing content schema are planned, because this page is intentionally static and code-owned.

## Execution Order
1. Capture the reference page accurately before writing code.
2. Gather all reusable assets and identify anything that must be recreated.
3. Create the Astro route shell and SEO metadata.
4. Add the new shared navigation entry.
5. Build the page body in the exact top-to-bottom order of the reference.
6. Apply Carfit-scoped styles and local design tokens.
7. Tune responsive behavior and visual parity.
8. Verify against the live site and fix mismatches before closing.

## Blocking Deliverable Before Coding
Before implementing the page, create and attach a short reference snapshot artifact for the live source page. This can live as a markdown appendix in the same plan file or a sibling note in `.cursor/plans`.

The artifact must include:
- the exact top-to-bottom section order
- exact CTA/button labels
- exact visible business/contact details
- all required image/logo/icon assets with their intended local filenames
- notes for desktop and mobile layout behavior
- any places where the Astro implementation is intentionally allowed to differ

Execution should not begin until this artifact exists, because otherwise each implementer will have to re-decide the source structure and parity target.

## Reference Snapshot
This snapshot is derived from the provided full-page screenshot of `carfit-hamburg.de` and should be treated as the current source map for implementation. If the live site differs, the screenshot remains the execution baseline unless a newer approved capture replaces it.

### Snapshot Confidence
- High confidence:
  section order, visual hierarchy, CTA placement, card/grid structure, dark/light section alternation, and the presence of the form/contact area.
- Medium confidence:
  exact headings, microcopy, icon labels, and some business-detail text that is too small to read perfectly in the screenshot.
- Low confidence:
  exact link targets, exact form behavior, and any hidden hover/mobile-only interactions not visible in the screenshot.

### Exact Section Order From Screenshot
1. Top navigation bar with Carfit logo at left, a few simple nav links across the top, and a top-right primary CTA button.
2. Dark hero section with a car/worker background image, left-aligned main headline, short supporting paragraph, and a primary CTA button.
3. White floating contact/info strip overlapping the hero bottom edge.
   It appears to contain phone/contact info, address/location info, and opening-hours/service-hours info with icons.
4. Customer review/testimonial section on a light background.
   Includes a section heading, a Google rating/review summary row, then a grid of testimonial cards, then a centered button below.
5. “Warum zu Carfit?” value proposition section.
   Left side has headline and benefit bullets; right side has a mechanic/mascot illustration.
6. Main services grid section.
   A 3-column grid of image cards showing major services such as polishing/detailing, repair, cleaning, washing, paint correction, and fleet/logistics-related work.
7. Full-width dark CTA band with centered heading and button.
8. Additional services/details section on a light background.
   Multi-column icon/text bullet layout listing more specific offerings and operational details.
9. Large dark differentiators section over a car-detail background image.
   Heading plus a dense multi-column grid of icon + short-copy value points, then another centered CTA button.
10. Owner/team section on a light background.
    Left-aligned portrait photo, right-aligned text block introducing Peter Bock and team, with another CTA button.
11. Map/location strip or location marker row.
    Appears as a narrow band between the owner block and the form, likely a small location indicator or map-related anchor.
12. Contact / “Online Anfrage” form section.
    Light background, centered heading, large multi-field form with text inputs, select/dropdown controls, textarea, consent text, and submit button.
13. Dark footer.
    Social media icons and links on the left/middle, with a trust/certificate badge graphic on the right.

### Visual System From Screenshot
- Overall page rhythm alternates between dark impact sections and clean white/light content sections.
- Primary accent color appears to be a saturated blue or blue-violet used for CTA buttons and key headings.
- Dark sections use near-black or charcoal overlays on top of photographic automotive backgrounds.
- Card surfaces are white with soft borders or subtle shadows.
- Layout is business-marketing oriented:
  centered content container, stacked full-width bands, and 3-column card grids on desktop.
- The hero and dark differentiator section rely heavily on photographic background imagery rather than flat color blocks.

### Screenshot-Derived CTA Inventory
- Top-right nav CTA button:
  likely a quote/request action.
- Hero CTA button:
  likely “Jetzt Angebot einholen” or similar request/quote action.
- Reviews section button:
  likely a “more reviews / learn more” style action.
- Dark CTA band button:
  quote/request action.
- Differentiators section button:
  quote/request action.
- Owner/team section button:
  likely contact/request/learn-more action.
- Form submit button:
  request submission.

Implementation rule:
- Until exact URLs are confirmed, all quote/request buttons should point to the in-page inquiry form anchor on `/carfit-hamburg`.
- Phone and email actions should only be wired once exact values are confirmed from source material.

### Screenshot-Derived Asset Inventory
- Carfit logo for top navigation.
- Hero background image with car and worker.
- Mechanic/mascot illustration for the “Warum zu Carfit?” section.
- Nine service card images for the main services grid.
- Automotive background image for the dark differentiators section.
- Portrait image of Peter Bock for the owner/team section.
- Footer trust/certificate badge image.
- Social media icons and standard UI icons for contact, address, hours, features, and value points.

### Responsive Implications From Screenshot
- Desktop layout clearly expects 3-column card grids in the services section.
- The hero content is left-heavy with the image/background carrying the right side.
- The floating info strip under the hero likely needs to collapse into stacked cards or a vertical list on smaller screens.
- The owner/team section likely becomes a stacked image-then-text layout on mobile.
- The long form section should collapse to a single-column input flow on mobile.
- The dense icon/value grids in the additional-services and differentiators sections should reduce columns progressively by breakpoint to avoid unreadable copy.

### Allowed Screenshot-Based Defaults
- Use the screenshot section order as authoritative.
- Use the form section as the default target for all quote/request CTAs until exact external destinations are approved.
- Treat the page as a German-language marketing page and preserve German headings/copy where readable.
- Where text is not legible enough in the screenshot, use structurally matching placeholder copy flagged for later source-text replacement.

### Remaining Confirmations After Screenshot Snapshot
The plan is executable with the screenshot as baseline, but these items should still be confirmed during implementation or immediately after first pass:
- exact CTA target URLs
- exact phone, email, and address strings
- exact nav labels in the top bar
- exact review text and score details
- whether the contact form is visual-only first or wired to a real endpoint
- whether the location strip should become a real map, a static map image, or a simple address marker row

## Reference Capture Checklist
- Inspect `https://carfit-hamburg.de/` and write down the exact section order from top to bottom.
- Record all visible content blocks:
  headline, subheadline, CTA text, trust markers, services, reviews, badges, differentiators, and contact/footer details.
- Record all business details shown on the page:
  company name, phone, email, address, opening/service claims, social proof counts, and button labels.
- Identify all images and icons:
  hero image, service imagery, logos, rating stars, trust badges, social icons, and map/contact visuals.
- Record the visual system:
  dominant colors, accent colors, card styles, border radii, shadows, section spacing, font feel, and button treatments.
- Record the responsive behavior:
  how hero stacks, how cards reflow, what stays side by side, and what collapses on smaller screens.

## Chrome Policy
- Keep the existing shared Astro header/navigation at the top of the page.
- Do not add a second Carfit-style top bar/header below it.
- Do not render the default global marketing footer section unless the implemented Carfit page clearly requires it after parity review.
- Default implementation rule:
  shared Astro header at the top, Carfit-specific page body below it, Carfit-style footer/contact presentation inside the page body if needed for fidelity, and no duplicate header block.
- If the shared global footer is later required for site-wide consistency, add it only after the Carfit page body is visually complete and verify that it does not create duplicate footer/contact blocks.

## Section Inventory To Lock Before Building
The implementing agent must first confirm the live page’s actual section order, then map each section into the Astro page in the same order. At minimum, expect these section categories:

1. Hero section with headline, supporting copy, CTA, and primary image or visual cluster.
2. Immediate trust/contact strip with ratings, contact methods, or key reassurance points.
3. Services or offering cards section.
4. Benefits/value section explaining why to choose Carfit.
5. Review/testimonial or social proof block.
6. Secondary CTA or lead-capture encouragement block.
7. Supporting detail section:
   process, differentiators, guarantees, or FAQ-like explanation.
8. Footer/contact presentation inside the page body if needed for fidelity.

If the live page contains additional sections, they are in scope and should be included rather than skipped.

## File Responsibilities
- `src/pages/carfit-hamburg.astro`
  new page entry using the shared `Layout.astro` wrapper and route-specific SEO metadata.
- `src/components/sections` or a new Carfit-specific page component file
  use only if splitting the page improves readability; do not over-componentize a one-off clone.
- `src/components/sections/header-section.tsx`
  add the new `Carfit Hamburg` navigation item.
- `src/components/layout/header-navigation.tsx`
  only touch if active-state or navigation behavior needs adjustment for the new route.
- `public/images/carfit-hamburg`
  store copied or recreated local assets for this page.
- `src/styles/global.css`
  avoid broad edits unless necessary; prefer local page-scoped classes or a tightly scoped Carfit section namespace.

## Implementation Rules
- Match the reference page structure and hierarchy closely, adapting only what is necessary for Astro layout integration, responsive behavior, accessibility, and local asset management.
- Prefer one page-level Astro entry with local sections over a large new reusable content system.
- Do not route this page through the existing markdown/content loader system.
- Keep Carfit-specific design tokens local where possible:
  colors, spacing, service-card styling, button treatments, and section backgrounds should not leak into the rest of the site.
- Use the shared Astro header/navigation as the only page header.
- If the reference footer/contact presentation differs from the main site, implement the Carfit-style footer/contact area inside the page body.
- Do not scrape or paste production CSS or JS directly.
- Do not introduce dependencies unless the existing Astro/Tailwind stack cannot reasonably reproduce the design.
- Keep shared-navigation changes minimal and isolated to adding the new route entry.

## CTA And Link Policy
Every interactive element from the reference page must be mapped before coding. The reference snapshot artifact must include a CTA matrix with:
- visible label
- element type:
  primary button, secondary button, text link, phone link, email link, social link
- destination type:
  internal route, external URL, `tel:`, `mailto:`, WhatsApp, booking flow, or placeholder
- final target URL or URI

Default rules:
- Phone actions should use `tel:` links.
- Email actions should use `mailto:` links.
- Internal Astro pages should use local routes.
- External booking or connect flows should only be used if they are explicitly confirmed in the reference snapshot artifact.
- No CTA should be left as `#` unless the plan explicitly marks it as a temporary placeholder.

## Embeds And Third-Party Policy
- Do not embed third-party JavaScript widgets from the source site.
- Do not copy cookie banners, chat widgets, analytics snippets, or opaque scripts.
- If the source page includes a map, prefer a static visual block or a simple external map link unless an iframe is explicitly approved.
- If the source page includes an iframe-based booking or contact tool, do not embed it by default; replace it with a CTA button or link-out unless the implementation task explicitly approves that integration.
- If a visual third-party badge is important for fidelity, recreate it as a static design element where legally and technically appropriate.

## Build Order For The Page
1. Create the route shell with title, description, and base page wrapper.
2. Build the hero first and tune its spacing, CTA, visual weight, and above-the-fold fidelity before moving on.
3. Build the trust/contact strip directly below the hero if it exists on the source page.
4. Build services/offers cards in source order.
5. Build the benefits/differentiators block.
6. Build reviews/testimonials/social proof.
7. Build any secondary CTA band or lead-capture encouragement block.
8. Build the lower-page support sections:
   process, guarantees, FAQ-like content, map/contact, or branded footer block.
9. Only after all sections exist, do a second pass for shadows, borders, font scale, spacing rhythm, and responsive polish.

## Asset Handling Rules
- Prefer local assets under `public/images/carfit-hamburg` rather than hotlinking to the live site.
- If an original asset cannot be obtained cleanly, recreate the layout with a placeholder of the same approximate dimensions and note that it must be replaced later.
- Copy all text carefully; avoid paraphrasing if the goal is near 1:1 fidelity.
- If fonts are not already available in the project, approximate them with the closest existing stack unless adding a font is clearly necessary for parity.

## Language And Accessibility Policy
- The page copy may remain in German for fidelity.
- The current site layout uses `html lang='en'` in `src/layouts/Layout.astro`; accept this temporarily unless the implementation also includes a safe page-level or layout-level language improvement.
- Do not block implementation on a layout language refactor.
- Preserve basic accessibility:
  semantic headings, alt text for meaningful images, visible button labels, adequate color contrast, and keyboard-accessible links/buttons.

## SEO And Indexing Policy
- The current shared `HeadSeo.astro` title pattern prefixes passed titles with `Demo:` and appends `- Orion | Shadcn Studio`.
- For this Carfit clone page, the default policy is to treat it as a demo/reference page unless told otherwise.
- Implementation default:
  pass a Carfit-specific title and set `noindex={true}` so the page is not intended as a production-indexed marketing page by default.
- Keep canonical handling through the existing layout/head system.
- Accept the existing Open Graph image fallback unless a Carfit-specific preview image is added locally.
- If later promoted to a public indexed page, revisit title formatting and remove the demo/noindex behavior explicitly rather than implicitly.

## Done Criteria
- The new `Carfit Hamburg` menu item appears in desktop and mobile navigation and routes correctly to `/carfit-hamburg`.
- The new `/carfit-hamburg` route renders correctly under the existing shared Astro header without any duplicate secondary header.
- The page renders correctly at mobile, tablet, desktop, and wide desktop breakpoints.
- The page follows the same section order as the live reference and includes all major visible content blocks.
- Typography, spacing, CTA placement, card structure, and visual hierarchy feel materially aligned with the reference site.
- All required images and business/contact details are present.
- The shared header/navigation still works correctly on existing pages.
- SEO basics are present:
  page title, description, and standard social preview fallback through the existing layout/head system.

## Verification Steps
- Run these non-mutating project checks if the environment supports them:
  `npm run build`
  `npm run check-types`
  `npm run lint .`
- Manually compare the Astro implementation against `carfit-hamburg.de` section by section.
- Check for desktop/mobile regressions in the shared header/navigation.
- Verify no unrelated homepage, blog, or app-integration page behavior regressed.
- Fix visual mismatches before considering the page complete:
  spacing, image scale, headline wrapping, button styling, card density, and footer/contact presentation.

## Assumptions
- Fidelity target is near 1:1, not merely inspired by the reference.
- The shared Astro navigation/header remains in use as the only header; only the page body is cloned closely.
- Original Carfit branding, images, and copy can be reused.
- Asset/copy reuse permission is assumed to be client-confirmed.
- The page is a static Astro implementation, not integrated into the current markdown/content loader system.
- Default route and menu target are `/carfit-hamburg` and `Carfit Hamburg`.
- The page is demo-oriented by default and should ship as `noindex` unless explicitly changed during implementation.
