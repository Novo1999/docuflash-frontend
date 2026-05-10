# File Preview Before Download Plan

## Goal

Let recipients preview supported shared files in-browser before downloading. The feature should reduce accidental downloads, preserve trust, and keep download analytics tied only to explicit download actions.

## V1 Scope

Preview is supported for:

- PDF
- DOCX
- TXT

Download-only files:

- XLS / XLSX
- ZIP
- OTHER / unknown file types

Unsupported files should not show a disabled preview button. They should show the normal download flow only.

## Confirmed Product Decisions

- Protected files must be unlocked with the password before preview is available.
- Preview does not count as a download.
- Preview appears inline on the shared-file page, between the main file card and the file details card.
- Preview loads only after the recipient clicks `Preview File`.
- Preview and download stay separate flows, even after a protected file is unlocked.
- PDF preview uses `react-pdf`, not an iframe or object embed.
- PDF preview renders 5 pages initially, then loads 5 more pages per click.
- DOCX preview is a readable preview, not a pixel-perfect Word renderer.
- DOCX HTML is sanitized on the backend before reaching the frontend.
- Mobile keeps the same preview feature, with graceful failure states if rendering fails.
- Recipient-facing preview failures use generic copy: `Preview is unavailable for this file. You can still download it.`

## Backend Contract Needed

This frontend repo should scaffold against a backend contract that separates unlock, preview, and download semantics.

### Verify Protected File

`POST /api/files/:token/verify`

Request:

```json
{
  "password": "recipient password"
}
```

Response:

```json
{
  "accessToken": "short-lived-token"
}
```

Notes:

- This should not return a direct file URL.
- The access token should be short-lived.
- The token authorizes preview and download for that protected share link.

### Preview File

`POST /api/files/:token/preview`

Request for public file:

```json
{}
```

Request for protected file:

```json
{
  "accessToken": "short-lived-token"
}
```

Response for PDF:

```json
{
  "kind": "pdf",
  "url": "temporary-preview-url"
}
```

Response for TXT:

```json
{
  "kind": "text",
  "text": "plain text preview content"
}
```

Response for DOCX:

```json
{
  "kind": "html",
  "html": "<p>Sanitized readable preview HTML</p>"
}
```

Notes:

- Calling this endpoint must not increment `downloadCount`.
- DOCX conversion and sanitization belong on the backend.
- Errors should return structured internal codes, but the frontend should show generic recipient-safe copy.

### Download File

`POST /api/files/:token/download`

Request for public file:

```json
{}
```

Request for protected file:

```json
{
  "accessToken": "short-lived-token"
}
```

Response:

```json
{
  "fileUrl": "temporary-download-url"
}
```

Notes:

- This is the only endpoint that should increment `downloadCount`.
- The frontend should trigger the browser download only from this response.

## Frontend Plan

### Types

Add preview response types to `types/file.ts`:

- `FilePreviewResponse`
- `PdfPreviewResponse`
- `TextPreviewResponse`
- `HtmlPreviewResponse`
- `FileAccessTokenResponse`

Add a helper such as `isPreviewableFileType(fileType)` for `PDF`, `DOCX`, and `TXT`.

### API Helpers

Update `app/lib/api/files.ts`:

- Change `verifyFilePassword` to return `{ accessToken: string }`.
- Add `getFilePreview(token, accessToken?)`.
- Update download helper to support `POST /download` with optional `accessToken`.

Compatibility note:

- If the current backend still uses `GET /download` and returns `fileUrl` from `verify`, the frontend scaffolding will require the backend contract above before the full feature works end to end.

### Shared File UI

Update `components/file/SharedFile.tsx`:

- Pass `fileType` into the client-side action area.
- Keep file metadata rendering server-side.
- Place preview UI inline before the file details card.

Recommended structure:

- Keep a client component responsible for unlock, preview, and download actions.
- Render the preview card inside that client component after `Preview File` succeeds.

### File Actions

Update `components/file/FileActions.tsx`:

- Replace `fileUrl` unlock state with `accessToken`.
- Show password unlock form for protected files until verified.
- For previewable file types, show both `Preview File` and `Download File` after unlock or immediately for public files.
- For unsupported file types, show only `Download File`.
- Keep preview and download loading states separate.
- Keep preview and download error messages separate where useful, while using generic preview failure copy.

### Preview Component

Add a component such as `components/file/FilePreview.tsx`.

Responsibilities:

- Render PDF previews using `react-pdf`.
- Render TXT content in a scrollable `pre` container.
- Render sanitized DOCX HTML in a constrained container.
- Show loading, empty, and failure states.
- For PDF, render 5 pages initially and expose `Load more pages`.

PDF behavior:

- Configure the `pdfjs` worker correctly for Next.js.
- Disable native browser PDF controls by avoiding iframe/object embed.
- Keep rendering responsive inside the shared page container.

TXT behavior:

- Preserve whitespace.
- Limit height with scrolling for long files.

DOCX behavior:

- Render backend-sanitized HTML with `dangerouslySetInnerHTML`.
- Keep the container visually constrained and non-interactive where possible.

## UX States

Public previewable file:

- `Preview File`
- `Download File`
- Preview appears inline after click.

Protected previewable file:

- Password input
- `Unlock`
- After unlock: `Preview File` and `Download File`
- Preview appears inline after click.

Public unsupported file:

- `Download File`

Protected unsupported file:

- Password input
- `Unlock`
- After unlock: `Download File`

Preview failure:

- Show: `Preview is unavailable for this file. You can still download it.`
- Keep `Download File` available.

## Dependencies

Add:

- `react-pdf`

Likely transitive dependency:

- `pdfjs-dist`

Before installing, verify the latest `react-pdf` Next.js setup and worker configuration.

## Validation Plan

Manual checks:

- Public PDF can preview without incrementing downloads.
- Protected PDF cannot preview before unlock.
- Protected PDF can preview after unlock.
- Download still works after preview.
- Preview and download have independent loading states.
- TXT preview preserves whitespace.
- DOCX preview renders sanitized readable content.
- Unsupported files show no preview button.
- Mobile layout stays usable.
- Generic preview failure copy appears when preview request fails.

Automated checks:

- Typecheck API response handling.
- Lint all changed files.
- Add focused tests if the project introduces a test runner later.

## Risks And Mitigations

- Risk: Backend still returns direct `fileUrl` from password verification.
  Mitigation: Update backend to return `accessToken` before enabling protected preview.

- Risk: Native PDF controls expose download outside analytics.
  Mitigation: Use `react-pdf` rendering instead of iframe/object.

- Risk: DOCX converted HTML can contain unsafe markup.
  Mitigation: Sanitize on the backend and render inside a constrained frontend container.

- Risk: PDF rendering is expensive on large/mobile files.
  Mitigation: Render 5 pages initially and load 5 more at a time.

- Risk: Preview endpoint accidentally increments download count.
  Mitigation: Keep preview and download endpoints separate and test analytics behavior.

## Recommended Implementation Order

1. Add frontend types and API helper scaffolding.
2. Add `FilePreview` rendering component.
3. Refactor `FileActions` around `accessToken`, preview, and download flows.
4. Wire `fileType` and inline preview placement through the shared-file page.
5. Install and configure `react-pdf`.
6. Run lint and type checks.
7. Verify against backend once the preview contract exists.
