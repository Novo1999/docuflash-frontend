# Docuflash Frontend

Next.js frontend for instant, anonymous-first file sharing. Auth is additive — it stamps ownership onto uploads but is never required.

## Language

**Anonymous identity** (`clientId`):
A long-lived, unauthenticated browser identity minted client-side and used to attribute anonymous uploads. Managed only through `getClientId()`.
_Avoid_: anonymous user, guest id

**Owner** (`ownerId`):
The authenticated user a file or folder belongs to. `null` for anonymous uploads. Set by the backend from the bearer token; the frontend never sends it explicitly.
_Avoid_: author, uploader, account id

**Session**:
The token bundle from login/register/refresh — `accessToken`, `refreshToken`, `expiresAt`. Persisted in `localStorage` and exposed to React via the `sessionAtom`.
_Avoid_: token, auth, credentials

**Access token**:
The short-lived Supabase JWT sent as `Authorization: Bearer` on API calls. Auto-attached by `apiClient` when a session exists.
_Avoid_: jwt, bearer, auth token

**Establish session**:
The act of accepting a `Session` (from login, register, or the OAuth callback), persisting it, and loading the user profile. See `establishSessionAtom`.
_Avoid_: set session, hydrate

**Auth modal**:
The single login/register dialog hosted once by `AuthProvider` and opened from anywhere via `openAuthModal()`.
_Avoid_: login popup, sign-in dialog
