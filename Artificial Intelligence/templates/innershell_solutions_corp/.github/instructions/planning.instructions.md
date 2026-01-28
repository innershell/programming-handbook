---
applyTo: "**"
---

# Planning Instructions

- **Explore Dynamically**: WHEN NECESSARY, parse the `frontend/` directory to understand the entire codebase.

- **Check for Reuse**: BEFORE creating new UI elements, ALWAYS search `frontend/src/components/` for reusable web React components to use (e.g., `<AppBackground>`,`<AppHeader>`, `<RibbonToolbar>`).

- **Check Lines of Code**: ALWAYS count the lines of code (LOC) in the `*.tsx` file being modified to ensure it does not exceed 500 LOC. If it exceeds 500 LOC, prompt the user with a warning and ask for confirmation to break down the file before proceeding. Justification:

  - _Maintainability_: Smaller files are easier to understand what the component does, find specific logic, or make changes without unintended side effects. Code reviews are also easier.
  - _Testing_: Smaller files are easier to test because the component likely has fewer responsibilities and dependencies. It makes it easier to write focused, meaningful tests.
  - _Reusability_: Smaller files are easier to reuse functionality in other parts of the app or in other apps.
  - _Performance_: Smaller files are faster to parse, compile, and render. Larger components often re-render unnecessarily because they're managing too many states or have complex render logic.

- **Check for Themed**: BEFORE using standard tags (e.g., `<p>`, `<button>`), look for Themed components that retheme standard React components (e.g., `<ThemedButton>`, `<ThemedInput>`, `<ThemedSelect>`, `<ThemedTextArea>`, `<ThemedModal>`).

- **Verify Documentation**: Before starting work on an app or page, consult the relevant documentation:

  - App docs: `docs/software_units/app_<appname>.md`
  - ALWAYS use the code as the final source of truth if there is conflict between the documentation and the implementation.

- **Review Active Work**: Check `tickets/working/` to understand conflicting changes or immediate goals.

- **Plan Changes**: If a ticket is provided, ALWAYS outline the planned changes in **LLM Plan** section for review before implementation.

- **Missing Documents**: ALWAYS notify the user when a particular referenced document was not found in the project. If a referenced document is missing, politely inform the user that you could not find the document and inform the user that you will not be able to proceed without it. This will also be helpful for the user to know if they renamed the document or moved it to a different folder, but forgot to update its references throughout the project.
