# FluentBooking Astro Integration Decision Plan

## Executive Summary
This document records the investigation history, the implementation paths that were tried, what failed, what was proven, and the current architectural decision for FluentBooking inside the Astro frontend.

The requirement is now clearer than it was at the beginning:

- users should be able to define booking references from markdown or content config
- Astro should automatically render the correct booking experience on the frontend
- the booking should continue to use FluentBooking and WordPress as the real backend
- if possible, the booking experience should preserve the native FluentBooking look and behavior rather than a custom recreation

That clarification changed the recommendation, and the recommendation has now been implemented successfully in the repo.

The current best-fit direction is now the current working implementation:

- use a stronger same-origin proxy/subapp architecture to preserve the native FluentBooking UI inside Astro
- keep the integration dynamic by letting markdown/config provide `calendarId + eventId`
- avoid simple iframe-only embedding and lightweight HTML proxying, because those have already proven unreliable here

If exact native FluentBooking UI later becomes optional, an Astro-native UI backed by real FluentBooking data remains a valid fallback. But for the current boss-level preference and current working result, the proxy/subapp architecture is the correct production path.

## Current Requirement Definition
The requirement is not just "show booking somehow."

The actual target behavior is:

- a content editor can add a FluentBooking reference in markdown or landing configuration
- Astro resolves that reference dynamically
- the correct booking experience appears automatically on the page
- the user interacts with real FluentBooking behavior
- bookings continue to be stored and managed in WordPress / FluentBooking

This is very close to the control model already used for Fluent Forms:

- content decides what to render
- Astro decides where and how to render it
- WordPress remains the backend source of truth

The new nuance is that the boss would prefer the native FluentBooking structure if it can still stay dynamic and content-driven.

## Current Working State
The proxy-based FluentBooking integration is now working in the Astro frontend.

The current working behavior is:

- the landing content provides `bookingCalendarId` and `bookingEventId`
- Astro reads those values from markdown/config
- Astro renders the booking section automatically
- the booking section mounts an iframe to an Astro same-origin booking proxy route
- that Astro proxy route fetches the WordPress-rendered FluentBooking booking page
- HTML, asset paths, AJAX endpoints, and related subrequests are rewritten to flow through the Astro origin
- the user sees the native FluentBooking structure on the Astro page
- the booking is currently confirmed working in the frontend

The important shift is that this is no longer a design recommendation only.
It is now the implemented direction in this repository.

## The Key Architectural Clarification
One question caused repeated confusion during the investigation:

Can a proxy architecture still be dynamic from markdown, or does it become hard-coded?

The answer is:

- yes, a proxy architecture can still be fully dynamic
- dynamic content configuration is not exclusive to custom rendering
- markdown can supply `eventId`, `calendarId`, slug, or booking URL
- Astro can transform those values into proxy routes at runtime

So the real decision is not:

- dynamic markdown integration versus proxy

The real decision is:

- lightweight embed/proxy attempts versus a full same-origin proxy/subapp architecture

That distinction matters, because the lightweight versions failed, while the stronger architecture is still valid.

## What Was Investigated

### 1. Existing Partial Repo Integration
The repository already contained partial FluentBooking-related code:

- booking-related API fetches
- booking-related placeholders
- some field and event handling

What it did not provide:

- a complete booking flow
- a reliable rendering architecture
- a production-ready inline booking experience

Conclusion:

- useful as reference material
- not a complete solution

### 2. Direct Native Booking URL Embed
The first simple strategy was to embed the public FluentBooking booking page directly in Astro via iframe.

Why it looked attractive:

- preserved native FluentBooking UI
- minimal frontend work
- closest to "render the shortcode result"

What happened:

- the page worked directly in the browser
- the iframe in Astro was blocked by `Content-Security-Policy` `frame-ancestors`

Conclusion:

- direct external iframe is not reliable in this environment
- it depends on server/security headers outside the Astro app

### 3. Lightweight Astro Proxy of Booking HTML and AJAX
To work around iframe restrictions, a lighter Astro proxy was tried.

That approach attempted to:

- fetch booking HTML through Astro
- rewrite the HTML
- reroute AJAX calls
- present the proxied page from the Astro side

What succeeded:

- the calendar could sometimes render
- assets and AJAX could partially be routed through Astro

What failed:

- click behavior became brittle
- date selection became unreliable
- runtime assumptions inside the plugin frontend were repeatedly broken
- the setup depended on careful HTML rewriting and JS behavior preservation

Conclusion:

- the lightweight proxy/embed approach is too fragile
- it is not a production-grade solution for this plugin

### 4. WordPress-Rendered `fb-embed` Endpoint
A better native-rendering test was then tried:

- create a custom WordPress endpoint
- let WordPress itself render the FluentBooking shortcode
- embed that endpoint from Astro

What was proven:

- the endpoint worked directly in WordPress
- FluentBooking rendered correctly there
- date selection and booking functions worked correctly there

What still failed:

- Astro iframe embedding was blocked by the final CSP header
- another header layer still injected restrictive `frame-ancestors`

Conclusion:

- this confirmed that WordPress rendering itself is fine
- but direct iframe embedding remains dependent on infrastructure header control

### 5. Astro-Native Booking Renderer With Real Submission
Because the embed path kept failing, a custom Astro renderer was tested.

That path proved:

- Astro can fetch FluentBooking-backed data
- Astro can submit real bookings into FluentBooking
- bookings can be written into WordPress successfully

This proved the backend integration model is feasible.

Why it was not accepted as the final answer:

- it did not preserve the native FluentBooking presentation closely enough
- the current requirement now leans toward preserving native UI if possible

Conclusion:

- this remains a valid fallback architecture
- but it is no longer the first recommendation if native UI is still desired

### 6. Strong Same-Origin Proxy Implementation In Astro
After the architecture was clarified, the stronger proxy path was implemented in Astro.

That implementation includes:

- a markdown-driven booking contract using `calendarId + eventId`
- an Astro booking section that renders automatically from content config
- a same-origin proxy route for the main booking page
- a catch-all same-origin proxy route for booking assets, AJAX calls, and related subrequests
- proxy rewriting for WordPress-rendered FluentBooking HTML and text assets

What was verified:

- the booking section renders on the Astro landing page
- the booking appears with the native FluentBooking structure
- the proxy route emits rewritten localhost/app-origin URLs instead of direct external framing
- booking-related subrequests such as FluentBooking availability calls work through the Astro proxy
- the user confirmed that the booking is showing in place and working correctly in the frontend

Conclusion:

- the strong same-origin proxy approach is now the working primary solution
- the earlier proxy uncertainty has been resolved in favor of this implementation

## What Was Actually Rejected
It is important to state this precisely.

We did not prove that all proxy approaches are bad.

What we did prove is:

- direct iframe to external booking page is unreliable here
- lightweight HTML/AJAX proxying is brittle here
- shortcode text inside Astro is not a real solution

What was not fully implemented here:

- a full same-origin proxy/subapp architecture like the one already used elsewhere in the organization

That stronger architecture is materially different from the lighter attempts.

It can include:

- same-origin routing
- path/query preservation
- asset proxying
- AJAX/API proxying
- cookie and auth rewriting when needed
- app-origin delivery of the booking experience

That is not the same thing as a simple iframe or a page rewrite experiment.

## Why Proxy Is Back On The Table
Proxy is back on the table because the actual business requirement changed from:

- "make booking work inline somehow"

to:

- "keep the native FluentBooking structure if possible, while still allowing dynamic content-driven configuration from markdown"

Given that requirement, the stronger proxy/subapp model is the correct fit.

Why:

- it preserves native FluentBooking UI and behavior better
- it can still be driven dynamically by markdown/config
- it keeps WordPress as the backend source of truth
- it matches an already known company pattern from another booking app setup

## Dynamic Markdown-Controlled Proxy Is Possible
This is now a formal requirement and should be considered fully compatible with the proxy direction.

Recommended content model:

- markdown/config stores one of:
  - `eventId`
  - `calendarId`
  - booking slug
  - booking URL

Recommended Astro behavior:

- read the booking reference from content
- transform it into the internal proxy route
- render the proxy-backed booking experience automatically on the page

This means editors still get the simplicity they need:

- add ID/reference in content
- frontend renders the corresponding booking experience automatically

So the proxy architecture does not remove flexibility.
It only changes the infrastructure behind the rendering.

## Why The Lightweight Embed Path Is Still Not Recommended
Even though native UI is desired, the earlier lightweight embed/proxy path should still be considered rejected.

Reasons:

- it depends on third-party framing permissions
- it breaks when CSP headers are not aligned
- it is not robust against plugin page-context assumptions
- it is too easy for interaction bugs to reappear
- it is difficult to maintain with confidence

So the choice is not:

- simple embed versus Astro-native UI

The real choice is:

- full same-origin proxy/subapp for native UI
- or Astro-native custom UI for maximum control

## Decision Matrix

### Option A: Full Same-Origin Proxy / Booking Subapp
Best when:

- native FluentBooking UI matters
- native plugin behavior matters
- markdown-driven dynamic rendering still matters
- the team accepts higher infrastructure complexity

Benefits:

- closest to native WordPress/FluentBooking behavior
- content-driven IDs can still work
- strongest fit for boss requirement if native UI matters

Costs:

- higher implementation complexity
- route, asset, cookie, and request proxying must be done carefully
- more infrastructure work than a custom Astro renderer

### Option B: Astro-Native UI Backed By Real FluentBooking APIs
Best when:

- inline rendering matters more than native plugin appearance
- UI control and maintainability matter most
- the team wants to avoid proxy complexity

Benefits:

- fully under Astro control
- simpler long-term ownership
- no CSP/frame-ancestor dependency

Costs:

- not native FluentBooking UI
- more custom UI work
- plugin frontend must be reinterpreted rather than preserved

## Current Recommended Direction
Based on the clarified requirement and the successful implementation, the current recommendation is:

- continue with the stronger same-origin proxy/subapp architecture already implemented in this repo
- keep booking selection dynamic through markdown/config references
- do not continue investing in simple iframe embedding or lightweight page proxying as the main path

This is the cleanest way to satisfy all of the following at once:

- native FluentBooking structure
- dynamic markdown-controlled configuration
- Astro page integration
- WordPress-backed booking truth

It is also now the path that has produced the working frontend result.

## Concrete Implementation Principles For The Proxy Path
If execution continues on the proxy path, the system should be designed around these principles:

### 1. Content-Driven Inputs
Allow content to specify booking references such as:

- `eventId`
- `calendarId`
- booking slug
- booking URL

### 2. Astro Resolution Layer
Astro should:

- read booking references from markdown/config
- normalize them into a canonical proxy route
- render the booking area based on that derived route

### 3. Same-Origin Delivery
The browser should experience the booking flow as app-origin delivery, not as a raw external frame dependency.

This likely means:

- same-origin route mounting
- proxying path and query parameters
- proxying HTML/assets/XHR/fetch requests as needed

### 4. Runtime Preservation
The proxy system must preserve:

- booking app paths
- query strings
- required assets
- AJAX/API endpoints
- cookies or session state if relevant

### 5. Functional Validation
The proxy version should not be treated as complete until it is verified end-to-end for:

- calendar render
- month navigation
- date selection
- slot selection
- booking submission
- confirmation state

## Recommended Next Steps

### Phase 1: Hardening
- test more booking flows across multiple events/calendars
- validate booking confirmation behavior consistently
- verify month navigation, slot selection, and submission flows across browsers

### Phase 2: Content Contract Cleanup
- keep `calendarId + eventId` as the primary markdown contract
- document that contract for future editors and developers
- optionally add validation or clearer authoring guidance around booking config

### Phase 3: Cleanup
- remove or isolate abandoned experimental paths if they are no longer needed
- decide whether to retain the Astro-native fallback files as reference or move them out of the main integration path
- decide whether the older lightweight proxy experiment files should remain for debugging or be retired

### Phase 4: Follow-Up Integration
- evaluate whether Fluent Form and standalone FluentBooking should stay separate or be composed more tightly later
- implement any additional booking UX refinements only after the proxy path remains stable

### Phase 5: Fallback Strategy
- keep the Astro-native API-backed renderer as fallback if the proxy path becomes disproportionate in cost or instability in future maintenance

## Final Position
The decision is now:

- not simple iframe
- not lightweight HTML proxy
- not shortcode text inside Astro
- not immediate preference for custom UI

The current preferred production direction is:

- a dynamic, markdown-driven, same-origin proxy/subapp architecture that preserves native FluentBooking UI inside Astro
- this direction is now implemented and confirmed working in the frontend

And the fallback, if that becomes too costly or fragile, is:

- an Astro-native booking renderer backed by real FluentBooking data and real FluentBooking booking submission

This position reflects everything proven so far, aligns with the boss requirement more accurately than the previous plan, and now records the actual working implementation state rather than only a proposed direction.
