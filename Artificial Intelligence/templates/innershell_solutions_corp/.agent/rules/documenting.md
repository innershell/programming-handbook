---
trigger: always_on
scope: "docs/**/*.md"
---

# Documenting Instructions

- **Templates**: ALWAYS try to use [templates](../../docs/templates) to create or edit documentation, if available.

- **Software Unit Types**: The following are different types of software units that require documentation:

  - **Apps**: Individual apps located in `frontend/src/app/<appname>/`.
  - **Shared Components**: Reusable React components located in `frontend/src/components/`.

- **Software Units**: ALWAYS update documentation in `docs/software_units` immediately after implementation for accuracy.

  - **Code Coverage**: ALWAYS ensure that the software unit documentation accurately reflects the current implementation. If there are discrepancies between the code and the documentation, update the documentation to match the code.
  - **Reproducibility**: ALWAYS write the software unit documentation as if explaining to another developer who will need to replicate the software unit perfectly based on the documentation alone.

## Files To Inspect (Apps)

When documenting an app under `frontend/src/app/<appname>/`, always open and inspect these files (prefer this order):

- `frontend/src/app/<appname>/page.tsx` — the app entry and page-level wiring (ribbon, header, layout).
- `frontend/src/app/<appname>/components/*.{ts,tsx}` — all UI components used by the app (props, events, validation).
- `frontend/src/app/<appname>/hooks/*.{ts,tsx}` — hooks that encapsulate state, persistence, and APIs (exported functions, types, storage keys).
- `frontend/src/app/<appname>/*` — other supporting files (styles, manifest, helpers).

Also inspect shared resources that the app relies on:

- `frontend/src/packages/components/*` — shared React components (headers, toolbars, modals).
- `shared/*` — legacy/shared JS components and utilities.

## Project Context & Templates

- Check `frontend/package.json` and `frontend/README.md` for dev/run commands and scripts.
- Use `docs/templates/template_for_software_units.md` as the canonical template for formatting docs and acceptance criteria.

## Extraction Checklist (what to document)

- Hook / public API: exported functions, state variables, and constants (e.g., storage prefixes).
- Component props: TypeScript signatures, required props, and callback contracts.
- Data model: TypeScript interfaces and JSON payload formats used for export/import.
- Persistence: `localStorage` keys, file formats, and save/restore behaviors.
- Validation rules: client-side checks and user-facing constraints.
- Run & dev steps: how to start the app locally and the expected dev URL.
- Examples: example exported payloads and common workflows (save, export, import, restore).
- Tests & tickets: any tests, or tickets referencing the app for context.

## Process Notes

- Always prefer the code as the source of truth; copy exact prop names, types, and storage keys from the code into the documentation.
- If expected files are missing or the implementation differs from the docs, list the missing files and stop for clarification.
