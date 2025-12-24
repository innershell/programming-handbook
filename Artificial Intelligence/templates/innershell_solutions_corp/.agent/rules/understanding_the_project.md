---
trigger: always_on
---

# Context Gathering Workflow

- **Explore Dynamically**: Do not rely on hardcoded lists. ALWAYS list the `apps/` directory to see the current suite of applications.
- **Check for Reuse**: BEFORE creating new UI elements, ALWAYS search `shared/components/` for reusable web components (e.g., `<ribbon-toolbar>`, `<privacy-banner>`).
- **Verify Documentation**: Read the `README.md` for logic, but ALWAYS verify the actual implementation by checking `app.js` or `index.html`. Code is the final source of truth.
- **Review Active Work**: Check `tickets/open/` or `tickets/working/` to understand conflicting changes or immediate goals.

# Deep Dive

- When analyzing an app, ALWAYS map the following:
  - **Data Model**: How is data structured in `localStorage`?
  - **Entry Points**: Where does the application initialization logic live?
