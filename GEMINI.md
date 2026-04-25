# GEMINI.md - Docuflash-Frontend

## Tech Stack Overview
- **Next.js:** 16.2.4 (Note: Breaking changes from training data).
- **React:** 19.2.4 (React 19 APIs).
- **Tailwind CSS:** v4 (Note: Configuration and syntax changes).
- **TypeScript:** v5.

## 🚨 Critical Directives (MANDATORY)
- **Consult Local Docs First:** This version of Next.js has breaking changes. Before implementing or modifying routing, data fetching, or core components, you MUST read the local documentation in `node_modules/next/dist/docs/`.
- **Heed Deprecation Notices:** Do not use APIs or patterns marked as deprecated in the local docs.

## Subagent-Driven Development Protocol
This project follows a subagent-driven development workflow to optimize token usage and ensure high-quality, focused changes.

### Subagent Delegation Strategy
- **`codebase_investigator`**:
    - **Usage:** Architectural mapping, system-wide analysis, cross-cutting feature planning, and understanding deep dependencies.
    - **When:** At the start of a feature or complex bug fix.
- **`generalist`**:
    - **Usage:** Multi-file refactoring, bulk processing (e.g., adding license headers), and high-volume data processing.
    - **When:** Once a clear strategy is defined but involves many repetitive or boilerplate changes.

### Standard Workflow
1. **Research & Strategy:** Map the task. Create a detailed plan (using Plan Mode for complex tasks).
2. **Delegation:** Invoke the appropriate subagent (`codebase_investigator` or `generalist`) to handle the bulk or specialized work.
3. **Synthesis & Verification:** Integrate subagent outputs, verify changes, and run project-specific validation (lint, build, tests).

## Coding Standards
- **TypeScript:** Enforce strict typing. No `any`.
- **Server Components:** Default to React Server Components (RSC). Use `"use client"` only for client-side interactivity or hooks (e.g., `useState`, `useEffect`).
- **Styling:** Use Tailwind CSS v4 exclusively. Follow v4 specific patterns for configuration and utility usage.
- **Validation:** Always run `npm run lint` and `npm run build` (if applicable) before final submission.
