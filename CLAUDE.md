# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Next.js dev server with Turbopack
- `npm run build` — production build (run before committing to catch type/route errors)
- `npm run lint` — ESLint via `eslint-config-next` (core-web-vitals + typescript)
- `npm run start` — start the production build

There is no test runner configured. The README's "Development Workflow" treats `npm run lint` + `npm run build` as the pre-commit validation step.

`NEXT_PUBLIC_BASE_URL` must point at the backend (e.g. `https://docuflash-api.vercel.app/`). It is consumed by both `app/constants/api.ts` (REST calls) and `app/utils/generateReactHelpers.ts` (UploadThing client). Without it, `apiClient` throws `ApiError('NEXT_PUBLIC_BASE_URL is not configured')`.

## Stack & version constraints

- Next.js **16.2.4** App Router + React **19.2.4** — newer than typical training data. Check `node_modules/next/dist/docs/` if an API behaves unexpectedly.
- Tailwind CSS **v4** (via `@tailwindcss/postcss`). Do not introduce v3 config (no `tailwind.config.js`); use v4 utility/`@theme` patterns.
- HeroUI (`@heroui/react`, formerly NextUI) for components, `react-aria-components` for custom interactive primitives, `next-themes` for theming.
- `next.config.ts` enables `cacheComponents: true` — this opts into Next's component-level caching, so `'use cache'` and `cacheTag(...)` (see `app/cache/cache.ts`) are first-class.
- Path alias: `@/*` → repo root (see `tsconfig.json`). Import as `@/app/...`, `@/components/...`, `@/types/...`.
- `tsconfig.json` has `strict: true`. Do not introduce `any`; reuse `types/file.ts`, `types/folder.ts`, and the Zod schema in `app/zod/uploadSchema.ts`.

## Architecture

### Frontend-only — backend is a separate service

This repo is the Next.js frontend. All persistence (files, folders, share tokens, password verification, expiry) lives behind `NEXT_PUBLIC_BASE_URL`. The frontend never owns the data model — it calls the backend through a thin client.

### API layer (`app/lib/api/`)

- `client.ts` — `apiClient<T>(endpoint, options)` wraps `fetch`, JSON-encodes the body, and returns `ApiResponse<T> = { success, msg, data, status }`. `ApiError` carries a `statusCode`. `buildApiUrl` normalizes slashes.
- `files.ts` — file CRUD + `verifyFilePassword`, `getFilePreview`, `getFileDownloadUrl`, plus `deleteUploadedStorageFile` which talks directly to `/api/uploadthing` (the UploadThing cleanup endpoint, not `apiClient`).
- `folder.ts` — folder CRUD + `unlockFolderByShareToken`.
- Both files share a local `requireApiData` helper that throws `ApiError` on `!success`. New endpoints should follow the same pattern rather than reading `response.data` directly.

### Caching & server actions

- `app/cache/cache.ts` uses the `'use cache'` directive with `cacheTag('folder' + token)` for folder reads.
- `app/actions/actions.ts` is a `'use server'` action that deletes a file and calls `updateTag('folder' + folderToken)` to invalidate the cached folder. When mutating folder contents, update the matching tag.

### Upload pipeline (the central flow)

Triggered from `components/landing/UploadForm.tsx`, the orchestration sits in `app/hooks/useFileUploadSubmit.ts` and follows this exact ordering — preserve it when editing:

1. Resolve `fileType` per file via `resolveFileType` (`MIME_TO_FILE_TYPE` then extension fallback). Reject early if any file is unsupported.
2. `startUpload(...)` (from `useUploadThing('fileUploader', ...)` in `app/utils/generateReactHelpers.ts`) pushes raw bytes to UploadThing and returns `{ key, name, size }[]`.
3. For each uploaded file, `POST /api/files` via `uploadFile(...)` to register metadata (storageKey, accessType, expireAt, optional password, clientId, deviceInfo). On any failure, the catch block runs `deleteFileByShareToken` for every file already registered AND `deleteUploadedStorageFile` for every storage key — both in parallel via `Promise.allSettled`. New steps added to this pipeline must extend that cleanup, otherwise orphaned UploadThing blobs or DB rows will accumulate.
4. If more than one file was uploaded, `createFolder(...)` bundles the resulting file IDs into a folder (default name `DEFAULT_UPLOAD_FOLDER_NAME = 'New Folder'`), and the share link returned is the folder link, not individual file links.
5. Recent uploads are persisted to `sessionStorage` via `addRecentUpload` / `addRecentFolder` (`app/utils/sessionStorage.ts`). The store dispatches a `'recent-uploads-updated'` window event — consumers (e.g. `RecentUploads`) subscribe to that to refresh.

`clientId` is a long-lived anonymous identity managed by `getClientId()` in `app/utils/upload.ts`: cookie first, then `localStorage`, otherwise minted via `crypto.randomUUID()`. Always go through `getClientId`; don't read the storage keys directly.

Share URLs are built with `getShareLink` / `getFolderShareLink`, which use `SHARE_BASE_URL` — `localhost:3000` in dev, the Vercel URL in production (`app/constants/upload.ts`). The backend hostname (`NEXT_PUBLIC_BASE_URL`) and the share hostname are intentionally different.

### Share routes

- `app/share/[shareToken]/page.tsx` — server component, fetches the file via `getFileByShareToken`, **deletes it server-side if `expireAt` has passed**, otherwise renders `<SharedFile>`. Password-protected files use `verifyFilePassword` from the client side to exchange a password for an `accessToken`, which then unlocks `getFilePreview` / `getFileDownloadUrl`.
- `app/folder/[shareToken]/page.tsx` — server component using the cached `getFolderByShareToken`. The `'use client'` `SharedFolderPage` handles password unlock locally via `unlockFolderByShareToken` and stores the unlocked password in state to pass to nested file actions.

### Constraints surfaced from constants

`app/constants/upload.ts` is the source of truth for limits:

- `MAX_UPLOAD_FILES = 5`, `MAX_UPLOAD_FILE_SIZE_MB = 16`
- Accepted types: PDF, DOCX, XLSX/XLS, ZIP, TXT (both MIME and extension lists). When adding a type, update `ACCEPTED_UPLOAD_MIME_TYPES`, `ACCEPTED_UPLOAD_EXTENSIONS`, `MIME_TO_FILE_TYPE`, `EXTENSION_TO_FILE_TYPE`, and the `FileType` enum in `types/file.ts` together — `resolveFileType` only works if all four agree.
- `PREVIEWABLE_FILE_TYPES = [PDF, DOCX, TXT]` (`types/file.ts`) gates whether a preview component is rendered. XLSX/ZIP fall through to `PreviewUnavailable`.

### Component conventions

- Default to RSC. Add `'use client'` only for interactive pieces (form, dropzone, preview UI, atoms). The share/folder route pages are server components that mount a client subtree.
- `components/file/FileUpload*` is a compound-component pattern built around `FileUploadContext`. `FileUploadRoot` owns state and exposes it via context to `FileUploadDropzone` / `FileUploadList`; subcomponents call `useFileUpload()` to read it. Don't reach around the context.
- Form state uses `react-hook-form` + Zod resolver (`app/zod/uploadSchema.ts`). The `superRefine` in that schema enforces the protected-without-password rule — mirror it server-side in `uploadFile` / `createFolder` rather than re-implementing in components.
- Global atom state uses `jotai` (see `components/folder/atoms/folderAtom.ts`).
