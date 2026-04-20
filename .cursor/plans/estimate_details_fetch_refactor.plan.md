# Estimate Details Fetch Refactor Plan

## Summary
- Refactor the Astro estimate details flow so the page resolves data from the real estimate record instead of treating `estimate_id` as a submission or inquiry ID.
- Use `process_estimate` as the root record and derive tenant, customer name, PDF, and images from the correct current sources.
- Keep the public URL readable by using tenant slug and estimate UUID while preserving internal joins on tenant ID and estimate-linked identifiers.

## Key Changes
- Change the estimate page contract so `estimate_id` means the real estimate record identifier.
- Update the server-side loader in `src/lib/estimate-data.ts` to:
  - resolve tenant by `tenants.slug` for public URLs, with `tenant_id` fallback for backward compatibility
  - fetch `process_estimate` by resolved `tenant.id` plus estimate identifier
  - support both numeric `process_estimate.id` and UUID `process_estimate_uuid` lookup
  - read `form_submission_id` from `process_estimate`
  - resolve displayed customer name from `process_estimate.person_id -> sa_persons`
  - resolve tenant display name from `tenants.name`
  - stop depending on `inquiry_photo_annotations`
- Keep the page entrypoint in `src/pages/estimate-details.astro` mostly unchanged at the UI level and switch it to the new loader result.
- Extend the loader result shape so it returns:
  - `estimate`
  - `person`
  - `tenant`
  - `pdfFile`
  - `imageFiles`
  - `status`
  - `message`
  - optional `submissionId` for diagnostics or internal branching

## Asset Rules
- Images:
  - source only from `form_submission_files`
  - use `process_estimate.form_submission_id` as the bridge
  - show all image files linked to the resolved form submission
  - keep ordering deterministic and stable
- PDF:
  - source only from `estimate_submission_files`
  - do not read PDFs from `form_submission_files`
  - if exactly one PDF exists, show it
  - if multiple PDFs exist, use deterministic fallback:
    - `file_position ASC`
    - then `created_at ASC`
    - then stable ID or filename as final tiebreaker
  - if no PDF row is found from `estimate_submission_files`, show no PDF
- Videos:
  - out of scope for this plan
- Do not add selected-file UI or schema changes in this implementation.
- Remove the incorrect heading number taken from `process_estimate.id`; the title should not display the estimate-table serial ID.

## Implementation Details
- Add a new estimate-root query layer in `src/lib/estimate-data.ts`:
  - resolve tenant from `tenants` first
  - query `process_estimate` using resolved `tenant.id` and incoming `estimate_id`
  - validate that the estimate exists
  - validate that it has a usable `form_submission_id`
  - return `not-found` if the estimate does not exist for that tenant
  - return controlled `error` if the estimate exists but required relational data is malformed
- Replace the current direct lookup:
  - current: `estimate_id -> form_submissions.submission_id`
  - target: `estimate_id -> process_estimate -> form_submission_id -> submission`
- Keep `form_submissions` in the flow, but no longer as the root table.
- Fetch tenant display data from `tenants` using `process_estimate.tenant_id = tenants.id` and show the tenant name instead of the raw tenant ID.
- Resolve displayed user name from `process_estimate.person_id -> sa_persons`.
- Use separate asset sources:
  - `estimate_submission_files` for PDF
  - `form_submission_files` for images
- Remove all fetch logic that reads from `inquiry_photo_annotations`.
- Normalize file filtering with the existing helpers in `src/lib/estimate-files.ts`:
  - MIME type first
  - extension and URL fallback second
  - stable ordering for images and PDFs
- Keep `/api/pdf` behavior unchanged in `src/pages/api/pdf.ts`; it should continue receiving a resolved file URL only.
- Update empty and error messages in `src/pages/estimate-details.astro` where they currently imply the old lookup model.
- Current public URL target:
  - `tenant=<TENANT_SLUG>`
  - `estimate_id=<PROCESS_ESTIMATE_UUID>`
- Keep `tenant_id` as fallback compatibility only.

## Test Plan
- Valid tenant slug plus valid estimate UUID:
  - tenant resolves from `tenants.slug`
  - estimate resolves from `process_estimate_uuid`
  - tenant name shows in UI
- Valid estimate with `process_estimate.person_id`:
  - greeting shows `sa_persons.last_name`
- Valid estimate with images in `form_submission_files`:
  - all images render
  - no dependency on `inquiry_photo_annotations`
- Valid estimate with PDF in `estimate_submission_files`:
  - one PDF renders
  - download link works through `/api/pdf`
- Valid estimate with no PDF row in `estimate_submission_files`:
  - PDF section shows empty state
- Heading:
  - must not show `process_estimate.id`
  - title remains generic unless a later explicit PDF/estimate display number is defined
- Invalid tenant slug or mismatched estimate UUID:
  - `not-found` state
  - no leaked internal error details
- Estimate exists but `form_submission_id` is missing:
  - loader returns controlled `error` state

## Assumptions
- The public URL uses `tenant` for slug and `estimate_id` for real estimate identifier.
- No schema migration is part of this work.
- No selected PDF or selected images backend feature exists yet, so deterministic fallback rules are required.
- Public-facing file handling should continue exposing only resolved file URLs or proxy URLs, not raw internal file IDs.
- `process_estimate.form_submission_id` maps to `form_submissions.submission_id`.
- `estimate_submission_files` is the active file source for PDFs only.
- `form_submission_files` is the active file source for images only.
- `inquiry_photo_annotations` is intentionally removed from this flow.
- `process_estimate.person_id` maps to `sa_persons.person_id` for displayed customer name.
- Remaining open item:
  - if a PDF still fails to appear for a known estimate, the exact live linkage field/value inside `estimate_submission_files` needs to be confirmed from a real row sample for that estimate.
