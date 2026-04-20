# FluentBooking Astro Integration Decision Plan

## Summary
Today’s conversation converged on a phased direction for FluentBooking in Astro.

The current integration approach in this repo is not the direction to continue. It was investigated and found to be only a partial implementation: Astro can currently read some FluentBooking data, but it does not create real FluentBooking bookings from Astro. The user explicitly decided to discard that structure and restart from scratch with a cleaner approach.

The agreed near-term goal is not full form integration. The immediate goal is narrower: show FluentBooking on an Astro page the same way it appears when FluentBooking shortcode output is used on a WordPress page. Fluent Forms integration is deferred to a later phase.

## Conversation Record
What was discussed and concluded today:

- The original goal was to make FluentBooking behave in Astro similarly to how Fluent Forms currently works: render in Astro and submit into WordPress so data appears natively in the plugin admin.
- Investigation showed the repo already has a partial booking path:
  - Fluent Forms submission is proxied through Astro into WordPress.
  - FluentBooking event/availability/field data can be fetched.
  - There is no booking creation flow wired from Astro into FluentBooking.
- That led to the conclusion that the existing booking implementation is incomplete and should not be the foundation for the final solution.
- The user then changed direction and said the current framework/structure should be removed conceptually and the work should restart from scratch.
- We discussed two strategic options for FluentBooking:
  1. Custom Astro-native booking UI that posts to FluentBooking via Astro server routes.
  2. Native FluentBooking UI shown inside Astro.
- Recommendation given: for a long-term fully integrated UX, custom Astro UI is stronger, but for the current phase it is not the best first step.
- The user clarified that the current phase is only about showing FluentBooking now, just like the shortcode/page experience in WordPress. Forms integration will come later.
- Based on that narrower requirement, recommendation given:
  - Use the exact native FluentBooking UI for now.
  - Embed it in Astro via the public/native FluentBooking booking page URL.
  - Do not attempt to manually recreate shortcode output from raw WordPress data in this phase.
- The user accepted that recommendation.

## Confirmed Direction
The current decision path for tomorrow is:

1. Phase 1 uses the native FluentBooking frontend experience, not a custom Astro recreation.
2. Phase 1 delivers FluentBooking inside Astro via its public booking page URL.
3. Phase 1 explicitly avoids mixing Fluent Forms into the booking experience.
4. Phase 2, after native booking display works correctly, can evaluate Fluent Forms integration around or alongside FluentBooking.
5. The previously explored partial booking implementation in the repo should not be treated as the target architecture.

## Key Changes To Make
Implementation should be planned around these changes in behavior and structure:

- Stop using the current partial “dynamic booking data fetch + placeholder booking field rendering” as the intended FluentBooking solution.
- Replace the booking display path with a simpler native embed strategy based on the public FluentBooking booking page URL.
- Treat booking configuration as content/config-driven so an Astro page can specify which FluentBooking page/event to show.
- Keep the implementation isolated from Fluent Forms logic so the booking phase remains simple and correct.
- Preserve the option for a later redesign into a custom Astro-native booking UI once the booking-only phase is proven.

## Decision To Make Tomorrow
The main decision tomorrow should be whether to proceed with the already recommended Phase 1 architecture or reopen the architecture discussion.

Recommended decision:
- Proceed with native FluentBooking embed via booking page URL.

Only reopen the decision if one of these is true:
- The native FluentBooking embed does not match shortcode behavior closely enough.
- The booking page URL is not available/publicly usable in the target WordPress setup.
- The embed creates unacceptable styling, responsiveness, or navigation issues in Astro.

If any of those occur, the fallback direction should be:
- Build a custom Astro wrapper using FluentBooking data/API, but only after documenting why native embedding is insufficient.

## Test Plan
When implementation starts, acceptance should be based on these checks:

- An Astro page can display the native FluentBooking experience using configured booking page information.
- The displayed experience matches the WordPress shortcode/page behavior closely enough for booking-only use.
- The booking UI is usable on desktop and mobile inside the Astro layout.
- Booking submission creates a real booking in FluentBooking/WordPress admin.
- No Fluent Forms dependency is required for this phase.
- Existing unrelated Astro page content continues to render normally around the booking section.

## Assumptions
- “Same as shortcode” for this phase means using FluentBooking’s own frontend behavior, not rebuilding it.
- The public/native FluentBooking booking page URL exists or can be obtained from WordPress configuration.
- Styling differences caused by embedding are acceptable in Phase 1 as long as the booking flow works correctly.
- Fluent Forms integration is intentionally out of scope until after booking-only display is working.
- The current partial booking code in the repo may later be removed or bypassed, but that cleanup is not part of this planning turn.
