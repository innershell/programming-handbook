---
trigger: always_on
scope: "tickets/**"
---

- ALWAYS create or update tickets using markdown files.
- ALWAYS use the [Ticket Template](`tickets/template_for_tickets.md`) for creating or updating a ticket.
- ALWAYS adhere to the predefined sections: **Description**, **Requirements**, **Designs & Constraints**, and **Acceptance Criteria**.
- NEVER add new section headings that are not predefined in the Ticket Template. If an unknown section is found in the ticket, leave it alone.
- ALWAYS write "Requirements" to describe **what** the user needs.
- ALWAYS write "Designs & Constraints" to describe **how** the needs are met and **why** specific decisions were made.
- ALWAYS populate "Acceptance Criteria" with specific, verifiable conditions required to close the ticket.
