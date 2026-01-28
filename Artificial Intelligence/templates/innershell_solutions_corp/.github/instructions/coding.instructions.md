---
applyTo: "frontend/**/*"
---

# Coding Instructions

- **Strict Client-Side Only**: NEVER introduce backend dependencies, databases, or server-side frameworks (like Node.js runtime code) unless explicitly requested. This project uses Next.js, Tailwind CSS, and LocalStorage.

- **Frameworkless**: NEVER use build tools (Webpack/Vite) or heavy frameworks (React/Vue) unless working in a specific app that already uses them.

- **App Documentation**: ALWAYS update the project `README.md` immediately after making code changes for accuracy.

  - **JSDoc Comments**: ALWAYS use JSDoc comments for all functions, classes, and complex code sections to improve code readability and maintainability.
  - **JSX Comments**: ALWAYS use `{/* comment */}` syntax for comments within JSX code blocks where a significant new component is introduced so that it is easier for the reviewer to find these major sections.

- **Software Unit Documentation**: ALWAYS update the documentation in `docs/software_units` immediately after making code changes for accuracy.

- **Use Client**: `"use client";` MUST be used at the top of files that use React hooks or browser-only APIs.

- **Data Types**: ALWAYS use TypeScript data types to ensure type safety.

  - **Dates & Timestamps**:

    - ALWAYS use ISO 8601 format for dates and times (e.g., `2024-01-31T13:45:00Z`) when storing or transmitting date/time data. NEVER use epoch timestamps as they are not human-readable.
    - ALWAYS convert dates to the user's local timezone for display using utility functions provided in `DateUtil`.
    - ALWAYS store dates in UTC format in LocalStorage and convert to local time only for display.

  - **No Explicit `any` Types**: NEVER use the `any` type in TypeScript. ALWAYS use specific types or generics to ensure type safety.

- **Invalid Syntax**: ALWAYS check for and avoid invalid or non-functional code (e.g., unreachable code, unused variables, incorrect imports) after every change. Immediate do one final check before confirming completion.

- **Hydration Issues**: ALWAYS address React hydration warnings using the following strategies in order of preference:

  1. **Address Deterministic Logic**: For example, instead of rendering a relative time like "5 minutes ago" (which changes every second), render a static date string that is the same on both server and client.
  2. Two-Pass Pattern: Use `useEffect` to update state that affects rendering only on the client side. Use a "safe" placeholder (e.g., "Loading...") during the initial render and then swap it for the actual content once mounted. This renders the full layout using placeholders first, then updates to the final content on the client side, preventing layout shifts.
  3. **Dynamic Imports**: Disable SSR for the component by using dynamic imports with `ssr: false` if the entire component relies on client-only data or APIs.
  4. **Suppress Hydration Warning**: Use `suppressHydrationWarning` on specific elements that differ between server and client render. **Use this sparingly**, as it only silences the warning for that specific element and doesn't fix the underlying mismatch.
  5. **Client-Side Data Fetching**: Instead of trying to render the data during the initial pass, fetch it inside a useEffect or via SWR/React Query.

- **Legacy Data Migration**: NEVER include migration logic for legacy data formats when modifying data structures stored in `localStorage` while working with version 1.0.0 features. ALWAYS assume a fresh install. Legacy migration logic will be added in version 1.1.0.
