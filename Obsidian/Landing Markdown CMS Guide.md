---
title: Landing Markdown CMS Guide
aliases:
  - Landing CMS Guide
  - Landing Content Editing Guide
tags:
  - obsidian
  - cms
  - landing-page
  - markdown
created: 2026-04-13
updated: 2026-04-13
---

# Landing Markdown CMS Guide

> [!info]
> Phase 1 keeps the current landing page design and component structure intact.
> Content now lives in smaller Markdown files instead of one monolithic file.

## File Map

- Global settings: `src/content/landing-settings/index.md`
- Hero: `src/content/landing-sections/010-hero.md`
- Features: `src/content/landing-sections/020-features.md`
- How it works: `src/content/landing-sections/030-works-features.md`
- Use cases: `src/content/landing-sections/040-use-cases.md`
- Testimonials: `src/content/landing-sections/050-testimonials.md`
- Pricing: `src/content/landing-sections/060-pricing.md`
- FAQ: `src/content/landing-sections/070-faq.md`
- CTA: `src/content/landing-sections/080-cta.md`
- Footer: `src/content/landing-sections/090-footer.md`

## Editing Rules

- Edit frontmatter fields first. Phase 1 rendering is driven by frontmatter, not by Markdown body content.
- Keep the three-digit filename prefix. That prefix controls section order on the landing page.
- Keep the section `id` stable and matched to the filename slug.
- Do not invent new frontmatter keys unless the code is updated to support them.
- Keep image paths root-relative, for example `/images/use-cases/01.webp`.

## Settings File

Use `src/content/landing-settings/index.md` for page-level settings only:

- `seo.title`
- `seo.description`
- `seo.keywords`
- `seo.siteName`
- `integrations.formId`
- `integrations.bookingCalendarId`
- `integrations.bookingEventId`
- `integrations.standaloneBookingUrl`

## Section Ordering

The loader reads section files by numeric prefix:

- `010` hero
- `020` features
- `030` works-features
- `040` use-cases
- `050` testimonials
- `060` pricing
- `070` faq
- `080` cta
- `090` footer

If a prefix changes, the rendered section order changes too.

## Validation Behavior

The loader is expected to fail fast for:

- missing required section files
- duplicate numeric prefixes
- filename slug and frontmatter `id` mismatch
- duplicate section `id`
- missing required image assets under `public/`

## Phase 1 Limits

> [!warning]
> Markdown body content is optional and currently ignored by the live landing page.
> This phase does not include preview workflows, a block builder, inline editing, or image uploads.

## Migration Note

The legacy monolithic source has been retired. The single source of truth is now:

- `src/content/landing-settings/index.md`
- `src/content/landing-sections/*.md`
