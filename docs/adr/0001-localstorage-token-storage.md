# Store auth tokens in localStorage

The auth doc recommends "in-memory access token + refresh token in a secure store," but we store both the access and refresh tokens in `localStorage` (`docuflash_auth_session`, via a jotai `atomWithStorage`).

This matches the existing anonymous `clientId` pattern (`app/utils/upload.ts`), survives reloads with no rehydration round-trip, and lets the synchronous `apiClient` read the token directly to attach `Authorization: Bearer`. The backend was designed for bearer headers, not cookies.

## Considered options

- **In-memory access + localStorage refresh** — safer against XSS for the access token, but the token is lost on every reload until a refresh call rehydrates it, and `apiClient` would need an async token source. Rejected for the added complexity.
- **httpOnly cookies via Next route handlers** — XSS-safe, but the backend returns tokens in the response body / URL fragment and isn't built for cookie auth; would require new Next API routes and a server-side fetch wrapper. Rejected as disproportionate.

## Consequences

Tokens are readable by any script on the origin (XSS exposure). Acceptable for an additive, anonymous-first file-sharing app where auth only unlocks extra features and is never required.
