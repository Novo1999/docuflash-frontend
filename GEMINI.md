# GEMINI.md - Docuflash-Frontend

## Project Overview
**Docuflash-Frontend** is a modern, high-performance web application designed for instant file sharing. It allows users to upload documents (PDF, DOCX, XLSX, ZIP) and generate shareable links in seconds without requiring registration.

### Key Features
- **Instant Upload:** Powered by UploadThing for reliable file handling.
- **Access Control:** Supports public and password-protected sharing.
- **Auto-Expiration:** Integrated expiration logic for shared files.
- **Modern UI:** Built with HeroUI and Tailwind CSS v4 for a polished, responsive experience.
- **Privacy First:** No account needed for files under 5 MB.

## Tech Stack
- **Framework:** [Next.js 16.2.4](https://nextjs.org/) (App Router)
- **Library:** [React 19.2.4](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (Experimental/v4 syntax)
- **UI Components:** [HeroUI](https://heroui.com/) (formerly NextUI)
- **File Handling:** [UploadThing](https://uploadthing.com/)
- **Validation:** [Zod](https://zod.dev/) & React Hook Form
- **Language:** TypeScript 5.x

## 🚨 Critical Directives
- **Next.js 16/React 19:** This project uses cutting-edge versions of Next.js and React. Always check `node_modules/next/dist/docs/` for breaking changes or API updates not yet in standard training data.
- **Tailwind CSS v4:** Adhere to v4 specific configuration and utility patterns. Do not use legacy v3 configurations.
- **Server Components:** Default to React Server Components (RSC). Use `"use client"` strictly for interactive components or hooks.
- **Strict Typing:** No `any`. Use the central types in `types/` and Zod schemas in `app/zod/`.

## Project Structure
- `app/`: Next.js App Router, constants, and core logic.
- `components/`:
    - `landing/`: Core landing page sections (Navbar, Footer, UploadSection).
    - `file/`: File-specific components (FileUpload).
    - `shared/`: Reusable UI components.
- `lib/api/`: API client and service definitions.
- `public/`: Static assets.
- `types/`: Global TypeScript definitions.
- `utils/`: Shared utility functions.

## Development Workflow
1. **Research:** Use `codebase_investigator` for architectural insights.
2. **Strategy:** Plan changes in Plan Mode for complex features.
3. **Execution:** Use `generalist` for batch tasks or repetitive refactoring.
4. **Validation:** Always run `npm run lint` and `npm run build` to ensure integrity.

---
*Note: This file is the primary guide for Gemini CLI. Follow these standards strictly.*
