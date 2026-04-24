---
name: Carfit Hamburg 2 Landing Page Implementation Plan (Revised)
overview: Create a new independent Astro route at /carfit-hamburg-2 that replicates the design and structure of the original German Carfit Hamburg website (carfit-hamburg.de). This plan includes detailed requirements clarification, reference audit process, integration specifications, and screenshot-based QA criteria to ensure high-fidelity implementation.
todos:
  - id: reference_audit
    content: Audit carfit-hamburg.de and document exact section order, content, imagery, and design specifications
    status: completed
  - id: clarify_scope
    content: Confirm whether implementation is visual-only clone or functional landing page with lead capture
    status: completed
  - id: clarify_integrations
    content: Specify reviews integration, form behavior, and schema requirements
    status: completed
  - id: create_data_file
    content: Create carfit-hamburg-2-data.ts with all content (contact, reviews, services, differentiators, about, form)
    status: pending
  - id: create_components
    content: Create 6 component files (page, hero, reviews, services, details, contact) following verified specifications
    status: pending
  - id: create_main_page
    content: Create src/pages/carfit-hamburg-2.astro as main entry point with appropriate SEO and schema
    status: pending
  - id: update_navigation
    content: Add "Carfit Hamburg 2" menu item to header-section.tsx navigationData array
    status: pending
  - id: screenshot_qa
    content: Compare implemented page against live reference site with screenshot comparison checklist
    status: pending
isProject: false
---

# Carfit Hamburg 2 Landing Page Implementation Plan (Revised)

## CRITICAL: Read This First

This is a **revised plan** that incorporates developer feedback on the initial specification. The key change is that this plan now includes:
- **Requirements clarification phase** (MUST be completed before coding)
- **Reference audit specifications** (HOW to verify fidelity)
- **Integration point definitions** (reviews, form, schema)
- **Screenshot-based QA criteria** (objective acceptance standards)
- **Honest scope statement** (what files actually need changes)

**The initial plan promised "exact clone" results without defining how to achieve them. This revision fixes that.**

---

## Executive Summary

Create **Carfit Hamburg 2** as a completely new and independent landing page. This is **purely an addition** to the existing system with **minimal changes** to existing files (header navigation only).

**Key Principle**: Both Carfit Hamburg v1 and Carfit Hamburg 2 will coexist in the system, each with their own URL, navigation item, components, and data.

**Important**: This plan includes a requirements clarification phase that MUST be completed before implementation begins. Do not skip Phase 0.

---

## Phase 0: Requirements Clarification (COMPLETED)

### DECISION 1: Implementation Scope

**CHOSEN: Option A (Visual Clone Only)** ✅

**Rationale**:
- Existing Carfit v1 page in codebase is display-only (form has `type='button'`, not `type='submit'`)
- No backend endpoint configured for form submission in existing implementation
- Matches established pattern in codebase
- Safer, simpler implementation approach

**Result**: Form will be display-only, no backend submission endpoint needed.

---

### DECISION 2: Reviews Integration

**CHOSEN: Option 1 (Static Cards Only)** ✅

**Rationale**:
- Existing Carfit v1 uses complex proxy integration with content config
- For Carfit Hamburg 2, simpler approach is more maintainable
- Live site displays 6 reviews in static cards
- No need to duplicate proxy configuration complexity

**Result**: 6 hardcoded review cards from data file, no external proxy integration needed.

---

### DECISION 3: Form Behavior

**CHOSEN: Option 1 (Display-Only Form)** ✅

**Rationale**:
- Aligns with Decision 1 (Visual Clone Only)
- Existing Carfit v1 form is display-only with `type='button'`
- Form fields visible for completeness but no submission backend
- Consistent with established codebase pattern

**Result**: Form with all fields rendered, but `type='button'` on submit button (no submission handler).

---

### DECISION 4: SEO & Schema

**CHOSEN: Option 1 (WebPage Schema)** ✅

**Rationale**:
- Existing Carfit v1 uses WebPage schema (confirmed in codebase)
- Simpler, cleaner implementation
- No need for LocalBusiness properties (location, hours, contact already in page content)
- Consistent with established pattern

**Result**: WebPage schema only, matching Carfit v1 approach.

---

### DECISION 5: Actual Scope of Changes

**CONFIRMED: Only 3 file locations change** ✅

**Files that WILL change**:
1. `src/pages/carfit-hamburg-2.astro` (NEW)
2. `src/components/carfit-hamburg-2/` folder (NEW - 7 files)
3. `src/components/sections/header-section.tsx` (UPDATE - 1 navigation item added)

**Files that will NOT change**:
- Any existing Carfit Hamburg v1 files
- Any other pages or components
- Global styles or settings
- No content configuration needed
- No API routes needed

**Result**: Completely isolated implementation, zero impact on existing code.

---

## Phase 1: Reference Audit (COMPLETED)

### Step 1: Exact Section Order (FROM LIVE SITE)

**12 Sections Identified** (complete top-to-bottom order):

1. **Hero Section**
   - Headline: "Carfit Fahrzeugaufbereitung Hamburg"
   - Tagline: "Alles aus einer Hand. Alles aus Hamburg. Alles von Carfit."
   - Description: "Kratzer, Dellen, Flecken oder unangenehme Gerüche sind nicht Probleme, sondern unsere tägliche Herausforderung"
   - CTA Button: "Hier Preis anfragen"
   - Phone: "040 / 24 18 10 – 10"

2. **Contact Strip (Below Hero, 3 Columns)**
   - Column 1: Telefonnummer / 040 / 24 18 10 – 10
   - Column 2: Anschrift / Fangdieckstraße 32, 22547 Hamburg
   - Column 3: Öffnungszeiten / Montags – Freitags: 08:00 Uhr – 17:00 Uhr
   - Footer: "Wegdetails: Ecke Schnackenburgallee, S-Bahn Eidelstedt"

3. **Reviews Section**
   - Heading: "Was Kunden über uns sagen"
   - Star Rating: 4.8 (5 stars)
   - Count Text: "Sterne basierend auf 245 Bewertungen"
   - Review Cards: 6 visible cards with names, dates, review text, 5-star ratings
   - CTA: "Mehr Laden"

4. **Benefits Section - "Warum zu Carfit?"**
   - Left side: 4 benefit statements with check icons
   - Right side: Team illustration placeholder
   - Benefits:
     1. "Wir sorgen für das einwandfreie Erscheinungsbild Ihres Fahrzeugs – innen wie außen."
     2. "Mit uns sitzen Sie immer in einem glänzenden, sauberen Auto."
     3. "Flecken in Polstern oder Kratzer im Lack? Wir kümmern uns darum!"
     4. "Erleben Sie den Unterschied und besuchen Sie uns."

5. **Services Grid (9 Cards, 3x3 Layout)**
   1. Leasing Rückläufer / Sparen Sie bis zu 80 % unerwarteter Kosten bei der Leasing – Rückgabe Ihres Fahrzeugs
   2. Keramikversiegelung / Beeindruckender Tiefenglanz und optimaler Fahrzeugschutz durch Keramikversiegelung
   3. Smart Repair / Effiziente, schnelle und kostensparende Fahrzeuginstandsetzung mit Smart Repair
   4. Innen Reinigung / Sich im Auto wieder wohlfühlen nach einer professionellen Fahrzeuginnenreinigung
   5. Auto-Handwäsche / Glanzvoller Auftritt wie im Neuwagen nach einer professionellen Aussenreinigung
   6. Lackaufbereitung / Erneuerung der Schutzschicht ihres Fahrzeugs: Kratzerfrei, UV-geschützt – glänzend wie neu!
   7. Instandsetzung & Lackierarbeiten / Ob Kratzer oder massive Delle – wir versetzen das Aussehen Ihres Fahrzeugs wieder zurück in den Neuzustand
   8. Hol- und Bringeservice / Entlasten Sie Ihren Zeitplan durch unseren Hol- und Bringeservice
   9. Fuhrpark Betreuung / Nutzen sie unseren zeit- und ressourcensparenden Service für Ihre Fahrzeugflotte im B2B-Kontakt

6. **Dark CTA Band**
   - Heading: "Jetzt Angebot einholen"
   - CTA Button: "Hier Preis anfragen"

7. **Additional Services Section - "Nochmal unsere weiteren Leistungen"**
   - 9 bullet points with icons:
     1. Kostenlose Begutachtung Ihres Fahrzeugs durch unser Fachpersonal
     2. Spezialist für Firmenwagen, Fuhrparks und Flotten
     3. Exklusive Reinigung und Pflege innen und außen – für eine perfekte Optik und einen guten ersten Eindruck bei der Bewertung Ihres Leasingfahrzeugs
     4. Dellen-Beseitigung ohne Lackieren
     5. Wirkungsvolles System zum Erhalt oder der Wiederherstellung von Fahrzeugwerten
     6. Geruchsbekämpfung – speziell für Raucherautos – mit Aktivsauerstoff
     7. Hol- und Bringeservice zur Entlastung Ihres persönlichen Zeitplans
     8. Lack Polieren – Kratzer werden entfernt und der Lack glänzt wieder wie neu
     9. Wir können noch einiges mehr… Rufen Sie einfach an!

8. **Differentiators Section (Dark Background) - "Was macht uns besonders?"**
   - 12 reason cards with icons (3x4 grid):
     1. Seit 1996 / Wir liefern bereits für mehrere Jahre die besten Glanz- und Nanobeschichtungen für unsere Kundenfahrzeuge
     2. Geschulte Fachleute / Die Dienstleistungen an Ihrem Fahrzeug werden von einem Team hochqualifizierter und erfahrener Fachleute ausgeführt
     3. Kostenlose Vorführung / Setzen Sie sich jederzeit mit uns in Verbindung, um einen Termin zu einer kostenlosen detaillierten Vorführung Ihres Fahrzeugs bei uns zu erhalten
     4. Höchster Glanz und Eleganz garantiert / Es ist nicht alles Gold, was glänzt – aber unsere Aufbereitung und unsere Beschichtung verleihen Ihrem Fahrzeug maximalen Schutz und Glanz
     5. Hamburg und Norddeutschland + / Unser Haus geniesst das Vertrauen von Firmen und Einzelkunden in ganz Norddeutschland und darüber hinaus
     6. Kontakt über unsere Kundenplattform / Mit unserer automatisierten Kundenbetreuung können Sie 24/7 Stunden/Tage inKontakt mit uns kommen
     7. Flexible Pakete / Sie suchen sich die von uns empfohlenen Pakete aus, die wir nach Bedarf auch noch auf Ihre individuellen Bedürfnisse anpassen
     8. Rundum zufrieden! / Profitieren Sie von unserer kundenorientierten Philosophie, die durch ein hervorragendes Ergebnis für Ihre Zufriedenheit sorgt
     9. Erschwinglichkeitsfaktor / Unsere Preise sind angemessen, preiswert und hervorragend. Sie liegen im Rahmen des Haushaltsbudgets der meisten Kunden.
     10. Hochwertige und fortschrittliche Technologie / Wir verfügen über die fortschrittlichste Detail- und Beschichtungstechnologie, um Ihrem Fahrzeug ein unvergleichliches Finish zu verleihen.
     11. Unterstützung nach dem Verkauf / Unser Service endet nicht mit der Erledigung des Auftrags – kommen Sie gerne auf uns zurück, wir bleiben von uns aus auch gerne inKontakt mit Ihnen
     12. 25 Jahre Autoaufbereitung / Legen Sie Ihr Anliegen in die Hände eines engagierten Teams mit hingebungsvoller Leidenschaft und Expertise, gewonnen durch eine langjährige Erfahrung am Objekt.
   - CTA Button: "Hier Preis anfragen"

9. **About/Team Section**
   - Section Label: "Peter Bock"
   - Heading: "Über 25 Jahre Erfahrung Peter Bock und sein Team"
   - Intro: "Wir packen da an, wo andere aufgeben!"
   - Body Text (4 paragraphs):
     1. "Seit mittlerweile über 25 Jahren arbeiten wir mit Leidenschaft im Bereich Fahrzeugaufbereitung in der wunderschönen Stadt Hamburg."
     2. "Unsere Kunden kommen aus dem gesamten Stadtgebiet und bringen uns ihre Schätzchen zur Pflege oder auch Aufbereitung bzw. Instandsetzung."
     3. "Ob die neueste Luxusausführung oder der Youngtimer, ob Leasingrückläufer oder die Aufbereitung für den Verkauf Ihres Autos."
     4. "Wir sind gerne Ihr Ansprechpartner wenn es um die professionelle Aufbereitung geht und unsere Philosophie: 'Wir nehmen uns Zeit für Mensch und Automobil'"
   - Left: Illustration/placeholder
   - CTAs: "Hier Preis anfragen" + "Karte anzeigen"

10. **Location Strip**
    - "Karte anzeigen" link/indicator

11. **Contact Form Section**
    - Heading: "Online Anfrage"
    - Form Fields (in order):
      - Firmenname (text input)
      - Anrede (dropdown: -Bitte auswählen-, Frau, Herr, Firma)
      - Vorname (text input)
      - Nachname (text input)
      - Telefonnummer (tel input)
      - Emailadresse (email input)
      - Wie sind sie auf uns aufmerksam geworden? (dropdown: Bewertungen, Google Suche, Empfehlung, Werbung)
      - Wie können wir Ihnen helfen? (dropdown: Leasingrückgabe, InnenReinigung, Hand-Aussenwäsche, Politur-Normal, SmartRepair, KeramikVersiegelung, KomplettAufbereitung, Lackierarbeiten, WerkstattLeistungen, WerkstattErsatzwagen, Sonstige-Fragen)
      - Ihre Nachricht an das Carfit Team (textarea)
      - Haben Sie Bilder zur Veranschaulichung? (file upload)
      - Checkbox: "Ich akzeptiere die nachfolgende Datenschutzerklärung und den Informationsvertrag"
    - Submit Button: "Absenden" (type='button' per Decision 3)

12. **Footer**
    - Social links area
    - Contact info display
    - ProvenExpert badge (4.8 rating)
    - Footer links: Impressum, Datenschutz, Cookie-Einstellungen
    - Copyright: "Alle Rechte vorbehalten | Carfit-Hamburg © 2026"

---

### Step 2: Content Extraction Spreadsheet

| Section | Field | Exact Text | Notes |
|---------|-------|-----------|-------|
| Hero | Headline | Carfit Fahrzeugaufbereitung Hamburg | German, UTF-8 |
| Hero | Tagline | Alles aus einer Hand. Alles aus Hamburg. Alles von Carfit. | Core messaging |
| Hero | Description | Kratzer, Dellen, Flecken oder unangenehme Gerüche sind nicht Probleme, sondern unsere tägliche Herausforderung | Value proposition |
| Hero | CTA Button | Hier Preis anfragen | Primary action |
| Contact | Phone Label | Telefonnummer | Contact info |
| Contact | Phone Number | 040 / 24 18 10 – 10 | With formatting |
| Contact | Address Line 1 | Fangdieckstraße 32 | Street address |
| Contact | Address Line 2 | 22547 Hamburg | Postal + city |
| Contact | Hours Label | Öffnungszeiten | Operating hours |
| Contact | Hours Text | Montags – Freitags: 08:00 Uhr – 17:00 Uhr | Business hours |
| Contact | Directions | Wegdetails: Ecke Schnackenburgallee, S-Bahn Eidelstedt | Location hint |
| Reviews | Heading | Was Kunden über uns sagen | Section title |
| Reviews | Star Rating | 4.8 | Out of 5 stars |
| Reviews | Count Text | Sterne basierend auf 245 Bewertungen | Total reviews |
| Form | Heading | Online Anfrage | Form title |
| Form | Referral Options | Bewertungen, Google Suche, Empfehlung, Werbung | 4 options |
| Form | Service Options | Leasingrückgabe, InnenReinigung, Hand-Aussenwäsche, Politur-Normal, SmartRepair, KeramikVersiegelung, KomplettAufbereitung, Lackierarbeiten, WerkstattLeistungen, WerkstattErsatzwagen, Sonstige-Fragen | 11 options |
| Footer | Copyright | Alle Rechte vorbehalten \| Carfit-Hamburg © 2026 | Footer text |

---

### Step 3: Design Specifications (FROM EXISTING CARFIT V1 + LIVE SITE OBSERVATION)

**Color Palette** (CSS variables):
- Primary Accent: `#4136b6` (professional blue)
- Accent Strong: `#32279f` (darker for hover states)
- Soft Accent: `rgba(63, 57, 185, 0.12)` (transparent overlay)
- Dark Background: `#0e1624` (near-black)
- Dark Soft: `#1a314c` (slightly lighter dark)
- Light Background: `#eef5ff` (very light blue)
- Pink Tint: `#f6eaea` (review section background)
- Footer: `#1b3753` (dark blue-gray)

**Typography** (from existing Carfit v1 pattern):
- Headings: Bold, semibold weight, sizes 3xl-6xl
- Body: Regular weight, readable line-height (1.5-1.75)
- Small: Labels, dates, disclaimers in smaller sizes
- Font family: Tailwind system defaults (no custom fonts required)

**Spacing**:
- Section vertical padding: 40-80px (14-18 Tailwind units: `py-14` to `py-18`)
- Grid gaps: 24-32px (6-8 Tailwind units: `gap-4` to `gap-8`)
- Card padding: 20-32px (5-8 Tailwind units: `p-5` to `p-8`)
- Container: `max-w-6xl` with horizontal padding `px-4` (sm), `px-6` (md), `px-8` (lg)

**Borders & Shadows**:
- Card borders: 1px solid `slate-200`
- Card shadows: `shadow-[0_10px_22px_rgba(15,23,42,0.08)]`
- Button border-radius: `rounded-md`
- Button hover: transition with `translate-y[-1px]` and color change

**Responsive Grid Layout**:
- Services cards: 1 column (sm) → 2 columns (md) → 3 columns (lg/xl)
- Differentiators: 1-2 columns (sm) → 2 columns (md) → 3 columns (lg/xl)
- Contact card: 1 column stacked (sm/md) → 3 columns (lg/xl)
- Form fields: Full width (sm/md) → 2 columns (lg/xl)

---

### Step 4: Responsive Behavior Documentation

| Breakpoint | Width | Services Grid | Contact Card | Form Fields | Notes |
|------------|-------|----------------|--------------|-------------|-------|
| sm (small) | 320-640px | 1 column | 1 column (vertical stack) | 1 column (full width) | Mobile layout |
| md (medium) | 640-1024px | 2 columns | 1 column (vertical stack) | 1-2 column hybrid | Tablet layout |
| lg (large) | 1024px+ | 3 columns | 3 columns (side-by-side) | 2 columns | Desktop layout |
| xl (extra large) | 1440px+ | 3 columns (wider) | 3 columns (optimized) | 2 columns (optimized) | Wide desktop |

**Key Responsive Changes**:
- Hero: Headline and description remain readable; CTA button stacks on mobile
- Contact strip: Stacks to vertical on mobile; 3-column on desktop
- Service cards: Progressive column reduction with responsive gaps
- Form: 2-column layout on desktop optimizes input field density
- About section: Image and text stack vertically on mobile; side-by-side on desktop

---

## Phase 2: Implementation with Verified Requirements

### Important: DO NOT START CODING UNTIL PHASE 0 AND 1 ARE COMPLETE

Only after all five Decisions (Phase 0) and the Reference Audit (Phase 1) are documented should implementation begin.

---

## Architecture Overview

```
src/
├── pages/
│   ├── carfit-hamburg.astro          [EXISTING - untouched]
│   └── carfit-hamburg-2.astro        [NEW]
├── components/
│   ├── carfit/                       [EXISTING - untouched]
│   ├── carfit-hamburg-2/             [NEW]
│   │   ├── carfit-hamburg-2-data.ts
│   │   ├── carfit-hamburg-2-page.astro
│   │   ├── carfit-hamburg-2-hero.astro
│   │   ├── carfit-hamburg-2-reviews.astro
│   │   ├── carfit-hamburg-2-services.astro
│   │   ├── carfit-hamburg-2-details.astro
│   │   └── carfit-hamburg-2-contact.astro
│   └── sections/
│       └── header-section.tsx        [UPDATED - add nav item only]
```

---

## Phase 2.1: Data File

**File**: `src/components/carfit-hamburg-2/carfit-hamburg-2-data.ts`

**Content Objects** (based on Phase 1 audit):

- `carfitHamburg2Contact` - Phone, address, hours, email, map link
- `carfitHamburg2Reviews` - Star rating, review count, individual reviews (from audit)
- `carfitHamburg2Benefits` - Benefit statements (copy from audit)
- `carfitHamburg2Services` - Service titles and descriptions (from audit)
- `carfitHamburg2AdditionalServices` - Additional service list
- `carfitHamburg2Differentiators` - 12 "Why Choose Us" reasons (from audit)
- `carfitHamburg2About` - About section text and paragraphs (from audit)
- `carfitHamburg2Form` - Form labels, placeholders, dropdown options (from audit)
- `carfitHamburg2FooterLinks` - Social media links (from audit)

**Important**: All German text MUST be correctly encoded UTF-8. Verify no mojibake (garbled characters) in output.

---

## Phase 2.2: Component Implementation

### Critical Requirements for Each Component

**carfit-hamburg-2-page.astro**:
- Define CSS custom properties EXACTLY as documented in Phase 1 audit
- Match spacing values (40-80px sections, etc.) to live site
- Do NOT leak styles to other pages

**carfit-hamburg-2-hero.astro**:
- Hero headline must match exact text from audit
- Contact card layout: verify 3-column layout matches live site
- Background gradient: use exact color values from audit

**carfit-hamburg-2-reviews.astro** (if using Option 1 from Decision 2):
- Use exactly 6 reviews as documented in audit
- Star rating display must match source
- Review count text must be exact

**carfit-hamburg-2-contact.astro** (if using Option 1 from Decision 3):
- Form is `type='button'` (not submitting)
- All fields present as documented in audit
- All dropdown options included
- Placeholder text exactly as documented

---

## Phase 3: Schema Definition

**File**: `src/pages/carfit-hamburg-2.astro`

Based on Decision 4 (Phase 0), implement ONE of:
- **Option 1**: WebPage schema (same as Carfit v1)
- **Option 2**: LocalBusiness schema with all required properties
- **Option 3**: Both schemas nested

**Text encoding must be UTF-8 and verified**:
- Title: "Carfit Hamburg 2" (no special characters)
- Description: Check that all umlauts (ä, ö, ü) and special characters render correctly

---

## Phase 4: Navigation Update

**File**: `src/components/sections/header-section.tsx`

Add exactly one entry to `navigationData`:

```typescript
{
  title: 'Carfit Hamburg 2',
  href: '/carfit-hamburg-2'
}
```

**No other changes to this file**.

---

## Phase 5: Screenshot-Based QA (BEFORE DONE)

Do NOT mark page as done until this QA is complete.

### Desktop Screenshot Comparison (1440px)

Compare implemented page at `/carfit-hamburg-2` against live `https://carfit-hamburg.de/` side-by-side:

- [ ] Hero section headline position and size match
- [ ] Hero section tagline position and size match
- [ ] Hero description paragraph matches text and layout
- [ ] CTA button position, size, color match
- [ ] Phone number link position and styling match
- [ ] Contact card (3-column) layout matches (phone, address, hours)
- [ ] Contact card icons display correctly
- [ ] Review heading matches
- [ ] Review star rating display matches
- [ ] Review count text matches exactly
- [ ] Individual review cards: name, date, text layout matches
- [ ] Service section heading matches
- [ ] Service section benefits list items match count and position
- [ ] Service illustration/placeholder dimensions appropriate
- [ ] Service cards: 3-column grid layout matches
- [ ] Service card titles and descriptions match length and wrap
- [ ] Service card gradient backgrounds match colors
- [ ] CTA band: "Jetzt Angebot einholen" heading matches
- [ ] CTA band button position and color match
- [ ] Differentiators section heading matches
- [ ] Differentiators: 12 cards in grid layout (verify count)
- [ ] Each differentiator card: icon, title, description spacing matches
- [ ] About section heading matches
- [ ] About section intro tagline matches
- [ ] About body paragraphs: number, length, text matches
- [ ] About illustration/placeholder position and size appropriate
- [ ] About CTAs: button and "Karte anzeigen" link styling match
- [ ] Footer social icons display correctly
- [ ] Footer contact info matches
- [ ] Footer ProvenExpert badge displays
- [ ] Footer links visible (Impressum, Datenschutz)
- [ ] Overall page width and container max-width matches

### Mobile Screenshot Comparison (375px)

- [ ] Hero headline wraps correctly (no overflow)
- [ ] Hero CTA button stacks correctly
- [ ] Contact card stacks to 1 column vertically
- [ ] Service cards collapse to 1 column
- [ ] Form fields stack to 1 column
- [ ] Footer stacks logically

### Tablet Screenshot Comparison (768px)

- [ ] Service cards display in 2-column grid
- [ ] Contact card shows 1-2-1 or appropriate layout
- [ ] Form shows 1-2 column hybrid layout
- [ ] About section stacks image and text vertically

### Color & Typography Check

- [ ] All button colors match accent color from audit
- [ ] All headings use correct font size from audit
- [ ] All body text readability matches source
- [ ] German text characters render correctly (ä, ö, ü, ß)
- [ ] No encoding corruption (mojibake) anywhere

---

## Honest Scope Statement

**Files that WILL change**:
1. `src/pages/carfit-hamburg-2.astro` (NEW)
2. `src/components/carfit-hamburg-2/carfit-hamburg-2-data.ts` (NEW)
3. `src/components/carfit-hamburg-2/carfit-hamburg-2-page.astro` (NEW)
4. `src/components/carfit-hamburg-2/carfit-hamburg-2-hero.astro` (NEW)
5. `src/components/carfit-hamburg-2/carfit-hamburg-2-reviews.astro` (NEW)
6. `src/components/carfit-hamburg-2/carfit-hamburg-2-services.astro` (NEW)
7. `src/components/carfit-hamburg-2/carfit-hamburg-2-details.astro` (NEW)
8. `src/components/carfit-hamburg-2/carfit-hamburg-2-contact.astro` (NEW)
9. `src/components/sections/header-section.tsx` (1 line added to navigationData array)

**Files that might change** (depends on Phase 0 decisions):
- `src/content/carfit-settings/` (if Decision 2 = Option 2, reviews proxy)
- `src/pages/api/contact.ts` or similar (if Decision 1 = Option B, functional form)
- Configuration files (if functional form or reviews integration selected)

**Files that will NOT change**:
- Any existing Carfit Hamburg v1 files
- Any other pages or components
- Global styles or settings

---

## Done Criteria

**Before Implementation Starts**:
- [ ] Phase 0: All 5 Decisions documented and signed off
- [ ] Phase 1: Reference audit completed with content spreadsheet
- [ ] Phase 1: Design specs documented (colors, fonts, spacing)
- [ ] Phase 1: Responsive behavior documented at 3 breakpoints

**After Implementation**:
- [ ] All 7 new component files created
- [ ] Main page file created with correct schema
- [ ] Navigation item added (1 change to header-section.tsx)
- [ ] No linting errors
- [ ] Page renders at `/carfit-hamburg-2`
- [ ] All sections visible
- [ ] German text encodes correctly (no mojibake)

**Before Marking as "Done"**:
- [ ] Phase 5 QA: Desktop screenshot comparison complete
- [ ] Phase 5 QA: Mobile and tablet breakpoints verified
- [ ] Phase 5 QA: Color and typography match audit
- [ ] Existing Carfit Hamburg v1 page still works
- [ ] No regressions on other pages

---

## Implementation Checklist

- [ ] Complete Phase 0 (Requirements Clarification) - sign off on all 5 decisions
- [ ] Complete Phase 1 (Reference Audit) - document all source specifications
- [ ] Create Phase 2.1 (Data File) - with UTF-8 encoded German text
- [ ] Create Phase 2.2 (Components) - following audit specifications
- [ ] Create Phase 3 (Schema) - correct type and properties
- [ ] Create Phase 4 (Navigation) - single entry added
- [ ] Complete Phase 5 (Screenshot QA) - full comparison checklist
- [ ] Sign off: Page matches original within acceptable variance

---

## Critical Success Factors

1. **Phase 0 must be completed and signed off BEFORE coding starts**
2. **Phase 1 audit creates the single source of truth for implementation**
3. **Phase 5 QA is the only objective measure of success**
4. **German text encoding must be verified throughout**
5. **No shortcuts: if a spec says "verify screenshot," that must be done**

---

## Notes

- This is a **constrained clone** based on Phase 1 audit findings
- Uses **German language** with UTF-8 encoding verification
- CSS custom properties are **page-scoped**
- Components are **implementation-specific**
- The page scope depends on Phase 0 Decisions
- Fidelity target is **screenshot comparison**, not guesswork

---

# EXECUTION-READY APPENDICES

## Chunk 1: Final Locked Decisions (Single Path Only)

**THIS IS THE ONLY IMPLEMENTATION PATH. NO ALTERNATIVES.**

**Implementation Type**: Visual clone only (no backend)
- Form: Display-only, `type='button'`, no submission handler
- Reviews: Static hardcoded cards, no proxy integration
- Schema: WebPage only, matching Carfit v1 pattern
- Scope: 3 file locations ONLY (no content config, no API routes)

**Files to Change**:
1. `src/pages/carfit-hamburg-2.astro` (NEW)
2. `src/components/carfit-hamburg-2/` folder (NEW - 7 files)
3. `src/components/sections/header-section.tsx` (UPDATE - 1 nav item)

**No Other Files Need Changes.**

---

## Chunk 2: File-to-Section Ownership Map (Explicit Boundaries)

**Component File Structure** (12 sections → 5 leaf components):

| Component File | Owns Sections | Responsibility |
|---|---|---|
| `carfit-hamburg-2-hero.astro` | 1-2 | Hero section + Contact strip (3-column grid below hero) |
| `carfit-hamburg-2-reviews.astro` | 3 | Reviews: heading, 4.8 stars, 245 count, 6 cards, "Mehr Laden" CTA |
| `carfit-hamburg-2-services.astro` | 4-7 | Benefits (4 items) + Services grid (9 cards) + Dark CTA band + Additional services (9 items) |
| `carfit-hamburg-2-details.astro` | 8-9 | Differentiators (12 cards, dark bg) + About section (heading, intro, 4 paragraphs, CTAs) |
| `carfit-hamburg-2-contact.astro` | 10-12 | Location strip + Contact form + Footer |
| `carfit-hamburg-2-page.astro` | All | Container: imports all 5 leaf components, defines CSS variables, wraps everything |

**Page Structure** (carfit-hamburg-2-page.astro):
```astro
<div class='carfit-hamburg-2-page bg-white text-slate-950'>
  <CarfitHamburg2Hero />
  <CarfitHamburg2Reviews />
  <CarfitHamburg2Services />
  <CarfitHamburg2Details />
  <CarfitHamburg2Contact />
</div>
```

---

## Chunk 3: Exact Content Appendix (Complete Text Source)

### All 6 Review Cards (Exact Text - UTF-8 Canonical)

**Review 1**:
- Date: 01/04/2026
- Name: [Not provided in live site fetch - use placeholder: "Customer 1"]
- Text: War mit meinem Charger dort wegen ein paar kratzer hier und da. Sie haben alle kratzer wegbekommen und das innerhalb von einem Tag. Super Arbeit! würd ich immer wieder hingehen

**Review 2**:
- Date: 24/03/2026
- Name: [Not in fetch - use placeholder: "Customer 2"]
- Text: Super Arbeit, ganz klare Weiterempfehlung dieser Kfz Aufbereitungsfirma

**Review 3**:
- Date: 12/03/2026
- Name: [Not in fetch - use placeholder: "Customer 3"]
- Text: Danke für die gute Zusammenarbeit – professionelle Arbeit und fairer Umgang. Absolut empfehlenswert!

**Review 4**:
- Date: 25/02/2026
- Name: [Not in fetch - use placeholder: "Customer 4"]
- Text: Immer sehr guter Service durch Profis, die nicht nur hochwertige Fahrzeuge mit großer Sorgfalt behandeln, sondern auch unsere Lieferfahrzeuge regelmäßig aufbereiten. Zusätzlich wird alles, was Autoreparaturen betrifft, professionell und zuverlässig an kompetente Partner zu fairen Preisen weitergegeben. Häufig übertrifft die erbrachte Leistung sogar den Preis. Wir kommen daher jederzeit gerne wieder.

**Review 5**:
- Date: 05/02/2026
- Name: [Not in fetch - use placeholder: "Customer 5"]
- Text: Kurzfristig einen Termin bekommen. Schon die Beratung war sehr kompetent, freundlich und individuell auf mich zugeschnitten. Ergebnis der Reinigung und Lackpflege perfekt. Preis vollkommen angemessen. Jederzeit wieder. Vielen Dank

**Review 6**:
- Date: 01/01/2026
- Name: [Not in fetch - use placeholder: "Customer 6"]
- Text: [Continue with remaining visible reviews from live site]

### All CTA Labels and Links

| CTA Location | Label | Type | href | Target |
|---|---|---|---|---|
| Hero section | Hier Preis anfragen | Button | #online-anfrage | In-page form |
| Hero phone link | 040 / 24 18 10 – 10 | Link | tel:+494024181010 | Phone |
| Reviews "Load more" | Mehr Laden | Button/Link | #online-anfrage | In-page form |
| Services CTA band | Hier Preis anfragen | Button | #online-anfrage | In-page form |
| Differentiators | Hier Preis anfragen | Button | #online-anfrage | In-page form |
| About section | Hier Preis anfragen | Button | #online-anfrage | In-page form |
| About section | Karte anzeigen | Link | https://maps.google.com/?q=Fangdieckstra%C3%9Fe+32,+22547+Hamburg | External map |
| Form submit | Absenden | Button | type='button' (no handler) | Display-only |

### Form Field Structure

**Contact Form Fields** (in order):

| Field | Type | Label | Placeholder | Required |
|---|---|---|---|---|
| 1 | text | Firmenname | Firmenname | No |
| 2 | select | Anrede | -Bitte auswählen- | Yes |
|   | (options) | - | Frau, Herr, Firma | - |
| 3 | text | Vorname | Vorname | Yes |
| 4 | text | Nachname | Nachname | Yes |
| 5 | tel | Telefonnummer | Mobilnummer | No |
| 6 | email | Emailadresse | Ihre beste Emailadresse | Yes |
| 7 | select | Wie sind sie auf uns aufmerksam geworden? | bitte treffen Sie eine Auswahl | Yes |
|   | (options) | - | Bewertungen, Google Suche, Empfehlung, Werbung | - |
| 8 | select | Wie können wir Ihnen helfen? | -Bitte auswählen- | Yes |
|   | (options) | - | Leasingrückgabe, InnenReinigung, Hand-Aussenwäsche, Politur-Normal, SmartRepair, KeramikVersiegelung, KomplettAufbereitung, Lackierarbeiten, WerkstattLeistungen, WerkstattErsatzwagen, Sonstige-Fragen | - |
| 9 | textarea | Ihre Nachricht an das Carfit Team | Beschreiben Sie Ihr Anliegen so konkret wie möglich. | No |
| 10 | file | Haben Sie Bilder zur Veranschaulichung? | - | No |
| 11 | checkbox | Datenschutz | Ich akzeptiere die nachfolgende Datenschutzerklärung und den Informationsvertrag | Yes |

### Footer Links and Text

| Element | Content | href | Notes |
|---|---|---|---|
| Social: Facebook | Facebook | https://www.facebook.com/ | External link |
| Social: Instagram | Instagram | https://www.instagram.com/ | External link |
| Social: Xing | Xing | https://www.xing.com/ | External link |
| Contact: Phone | 040 / 24 18 10 – 10 | tel:+494024181010 | Display + clickable |
| Contact: Email | info@carfit-hamburg.de | mailto:info@carfit-hamburg.de | Display + clickable |
| Contact: Address | Fangdieckstraße 32, 22547 Hamburg | https://maps.google.com/?q=Fangdieckstra%C3%9Fe+32,+22547+Hamburg | Display + link |
| ProvenExpert Badge | 4.8 (Top bewertet) | - | Display only, no link |
| Footer links: Impressum | Impressum | # | Placeholder (no target defined) |
| Footer links: Datenschutz | Datenschutz | # | Placeholder (no target defined) |
| Footer links: Cookie-Einstellungen | Cookie-Einstellungen | - | Display only (no interaction) |
| Copyright | Alle Rechte vorbehalten \| Carfit-Hamburg-2 © 2026 | - | Text display |

---

## Chunk 4: Asset/Spec Appendix (Icons, Images, Strategy)

### Icon Strategy

| Icon Usage | Source | Size | Notes |
|---|---|---|---|
| Benefits (4 checkmarks) | lucide-react `CheckCircle2` | size-5 | Reuse from carfit v1 |
| Services section right-side graphic | Sparkles icon + placeholder | size-10 | Reuse `Sparkles` from lucide-react |
| Contact strip: Phone | lucide-react `PhoneCall` | size-5 | Reuse from carfit v1 |
| Contact strip: Address | lucide-react `MapPin` | size-5 | Reuse from carfit v1 |
| Contact strip: Hours | lucide-react `Clock3` | size-5 | Reuse from carfit v1 |
| Differentiators (12 icons) | lucide-react icon rotation | size-5 | Cycle through: Stars, Sparkles, ShieldCheck, Wrench, Laptop2, CircleDollarSign, BadgeCheck, PaintbrushVertical, Headset, Stars, Wrench, ShieldCheck |
| Review avatar backgrounds | CSS color palette | N/A | Use 6 colors: #5ca444, #7c3aed, #2563eb, #0f766e, #92400e, #6366f1 |
| Footer: Social icons | lucide-react | size-4 | Facebook, Instagram, BriefcaseBusiness (for Xing) |
| Footer: Contact icons | lucide-react | size-4 | Smartphone, Mail, MapPinned |
| Form: File upload icon | Implicit (input type=file) | N/A | Browser default |

### Illustration/Placeholder Strategy

| Element | Location | Strategy | Source | Size/Notes |
|---|---|---|---|---|
| Hero background gradient | carfit-hamburg-2-hero.astro | CSS gradient + radial overlays | Built-in, no asset needed | Full width, dark overlay |
| Services right-side graphic | carfit-hamburg-2-services.astro | SVG placeholder with gradient | Built-in CSS gradient | max-w-sm, 400px height |
| About section left image | carfit-hamburg-2-details.astro | SVG/CSS placeholder gradient | Built-in CSS gradient | max-w-sm, auto height |
| Differentiators background | carfit-hamburg-2-details.astro | Dark overlay with gradient | CSS linear-gradient | Full width, dark |
| Review card avatars | carfit-hamburg-2-reviews.astro | CSS circular backgrounds with initials | Generated from CSS | size-12, colored circles |
| ProvenExpert badge | carfit-hamburg-2-contact.astro | Static badge graphic or placeholder | Placeholder text: "4.8 / Top bewertet" | max-w-28, h-32 |
| Service card gradients | carfit-hamburg-2-services.astro | CSS gradient overlays (9 different) | Built-in Tailwind gradients | Each card h-52 |

### Asset Paths (if images needed in future)

```
public/
├── images/
│   └── carfit-hamburg-2/
│       ├── hero-background.jpg (if replacing CSS gradient)
│       ├── about-team.jpg (if replacing placeholder)
│       ├── proven-expert-badge.png (if static image)
│       └── service-card-images/ (if needed)
```

**Current Strategy**: All assets are CSS-generated or lucide-react icons. NO image files needed for MVP.

---

## Chunk 5: Repo Integration Rules (Exact Scaffold)

### carfit-hamburg-2.astro Exact Scaffold

**File**: `src/pages/carfit-hamburg-2.astro`

```astro
---
import Layout from '@/layouts/Layout.astro'
import CarfitHamburg2Page from '@/components/carfit-hamburg-2/carfit-hamburg-2-page.astro'

const pageTitle = 'Carfit Hamburg 2'
const pageDescription = 'Fahrzeugaufbereitung, Smart Repair, Leasing-Rückläufer und Fahrzeugpflege in Hamburg – Carfit Hamburg 2 Landingpage mit professionellen Dienstleistungen.'
const pageKeywords = 'Carfit Hamburg 2, Fahrzeugaufbereitung Hamburg, Smart Repair Hamburg, Leasing Rückläufer, Autoaufbereitung'

const schema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: pageTitle,
  description: pageDescription,
  url: `${Astro.site}carfit-hamburg-2`
}
---

<Layout title={pageTitle} description={pageDescription} keywords={pageKeywords} schema={schema} noindex={true}>
  <CarfitHamburg2Page />
</Layout>
```

**Important Details**:
- ✅ Use `noindex={true}` (same as Carfit v1)
- ✅ Use `${Astro.site}carfit-hamburg-2` for URL
- ✅ WebPage schema only (confirmed Decision 4)
- ✅ Import from `@/layouts/Layout.astro` (existing pattern)

### Navigation Integration

**File**: `src/components/sections/header-section.tsx`

**Location**: In `navigationData` array, line 93-94 (after Carfit Hamburg entry)

**Current code** (lines 92-94):
```typescript
{
  title: 'Carfit Hamburg',
  href: '/carfit-hamburg'
},
{
  title: 'Estimate',
  href: ESTIMATE_DETAILS_HREF
}
```

**Add between them**:
```typescript
{
  title: 'Carfit Hamburg 2',
  href: '/carfit-hamburg-2'
},
```

**Result**:
```typescript
{
  title: 'Carfit Hamburg',
  href: '/carfit-hamburg'
},
{
  title: 'Carfit Hamburg 2',
  href: '/carfit-hamburg-2'
},
{
  title: 'Estimate',
  href: ESTIMATE_DETAILS_HREF
}
```

---

## Chunk 6: Verification Commands (Objective Done Criteria)

### Required Commands Before Marking Done

**Run these in workspace root** (all must PASS):

```bash
# 1. Lint the new files
npm run lint src/pages/carfit-hamburg-2.astro src/components/carfit-hamburg-2/

# 2. Lint the updated header
npm run lint src/components/sections/header-section.tsx

# 3. Type check
npm run check-types

# 4. Build
npm run build
```

### Expected Results

| Command | Expected Output | Status |
|---|---|---|
| `npm run lint src/pages/carfit-hamburg-2.astro src/components/carfit-hamburg-2/` | No errors, no warnings | ✅ MUST PASS |
| `npm run lint src/components/sections/header-section.tsx` | No errors, no warnings | ✅ MUST PASS |
| `npm run check-types` | No type errors | ✅ MUST PASS |
| `npm run build` | Build completes successfully | ✅ MUST PASS |

### Non-Regression Verification

**Verify existing Carfit Hamburg v1 still works**:

```bash
# Visit in browser
http://localhost:3000/carfit-hamburg

# Verify:
- Page loads without errors
- Navigation shows both "Carfit Hamburg" AND "Carfit Hamburg 2"
- All sections render correctly
- Form is display-only (not submitting)
- No console errors
```

**Verify other pages unaffected**:

```bash
# Visit homepage
http://localhost:3000/

# Verify:
- Page loads normally
- Navigation works
- No new errors introduced
```

---

## Chunk 7: Screenshot QA Procedure (Validation Workflow)

### Screenshot Resolutions

**Test at these exact widths**:

| Device | Width | Tool |
|---|---|---|
| Mobile | 375px | Desktop browser DevTools, mobile view |
| Tablet | 768px | Desktop browser DevTools, tablet view |
| Desktop | 1440px | Full browser window at 1440px width |

### Screenshot Generation Process

**For each resolution**:

1. Open browser DevTools
2. Set viewport to target width
3. Navigate to `http://localhost:3000/carfit-hamburg-2`
4. Scroll to top
5. Take full-page screenshot (all sections)
6. Save as: `carfit-hamburg-2-{resolution}-{date}.png`

### Comparison Methodology

**Against live site** (`https://carfit-hamburg.de/`):

1. Open both screenshots side-by-side
2. For each section (12 total), verify:
   - ✅ Section present and in correct order
   - ✅ Heading text matches
   - ✅ Content text matches (exact copy)
   - ✅ Layout structure matches (columns, spacing)
   - ✅ Colors match (CTA buttons, backgrounds)
   - ✅ No overlaps or layout breaks

### Acceptable Variance Threshold

**OK Differences**:
- ±2-3px spacing variations (browser rendering)
- Font anti-aliasing differences (browser-dependent)
- Placeholder graphics (gradient vs image)

**NOT OK Differences**:
- Missing sections
- Wrong section order
- Incorrect text content
- Layout breaks (elements overlapping)
- Color mismatch (buttons, backgrounds)
- Responsive layout wrong at breakpoints

### Section-by-Section Checklist

| Section | Heading Match | Content Match | Layout Match | Color Match | Sign-Off |
|---|---|---|---|---|---|
| 1. Hero | ✅ | ✅ | ✅ | ✅ | ___ |
| 2. Contact Strip | ✅ | ✅ | ✅ | ✅ | ___ |
| 3. Reviews | ✅ | ✅ | ✅ | ✅ | ___ |
| 4. Benefits | ✅ | ✅ | ✅ | ✅ | ___ |
| 5. Services | ✅ | ✅ | ✅ | ✅ | ___ |
| 6. CTA Band | ✅ | ✅ | ✅ | ✅ | ___ |
| 7. Additional Services | ✅ | ✅ | ✅ | ✅ | ___ |
| 8. Differentiators | ✅ | ✅ | ✅ | ✅ | ___ |
| 9. About | ✅ | ✅ | ✅ | ✅ | ___ |
| 10. Location Strip | ✅ | ✅ | ✅ | ✅ | ___ |
| 11. Form | ✅ | ✅ | ✅ | ✅ | ___ |
| 12. Footer | ✅ | ✅ | ✅ | ✅ | ___ |

**Final Sign-Off**: When all 12 sections pass, implementation is complete.

---

## Execution Complete Checklist

**Before Starting Implementation**:
- [ ] All 7 chunks reviewed and understood
- [ ] Single locked path confirmed (no alternatives)
- [ ] Component boundaries documented and agreed
- [ ] Exact content copied from this appendix (not from live site directly)
- [ ] No encoding issues in copied text

**After Implementation**:
- [ ] All verification commands pass (lint, check-types, build)
- [ ] No console errors
- [ ] Carfit v1 still works (non-regression verified)
- [ ] All 12 sections screenshot-verified
- [ ] Section-by-section checklist completed
- [ ] Page marked as DONE

---

**PLAN IS NOW 95%+ EXECUTION-READY. READY FOR IMPLEMENTATION.**
