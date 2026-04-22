# Carfit Reviews Proxy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reverse-proxied external reviews section to the Carfit Hamburg landing page without removing the existing static reviews block.

**Architecture:** Introduce a dedicated external HTML proxy for one configured reviews source URL, with optional section extraction and catch-all asset passthrough. Render the proxied block below the current static reviews section so rollout remains non-breaking until the static block is removed later.

**Tech Stack:** Astro, TypeScript, server-side fetch, iframe-based rendering

---

### Task 1: Define Carfit reviews proxy configuration

**Files:**
- Modify: `src/components/carfit/carfit-data.ts`

- [ ] Add a page-level config object for the proxied reviews source URL, optional selector, and section copy.
- [ ] Keep the existing static reviews data unchanged so the current section still renders.

### Task 2: Implement external HTML proxy helpers

**Files:**
- Create: `src/lib/external-section-proxy.ts`

- [ ] Add utilities to build the proxy path, normalize the upstream URL, rewrite HTML/text assets, and rewrite redirects.
- [ ] Support optional extraction of a common selector shape (`#id`, `.class`, `tag`, `tag.class`, `[data-attr="value"]`) before returning HTML.

### Task 3: Add Carfit reviews proxy routes

**Files:**
- Create: `src/pages/carfit-proxy/reviews.ts`
- Create: `src/pages/carfit-proxy/reviews/[...path].ts`

- [ ] Fetch the configured reviews page through Astro on the server.
- [ ] Rewrite HTML and asset URLs back through the local proxy path.
- [ ] Proxy follow-up asset and script requests through the catch-all route.

### Task 4: Render the proxied reviews section

**Files:**
- Create: `src/components/carfit/carfit-proxied-reviews.astro`
- Modify: `src/components/carfit/carfit-page.astro`

- [ ] Add a new section below the existing static reviews block.
- [ ] Show an iframe when the proxy source is configured.
- [ ] Show setup guidance instead of a broken iframe when the source URL is still blank.

### Task 5: Verify

**Files:**
- Test: project build

- [ ] Run `npm run build`.
- [ ] Fix any TypeScript or Astro issues introduced by the proxy changes.
