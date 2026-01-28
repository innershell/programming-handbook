---
trigger: always_on
scope: "**"
---

This document outlines the recommended development strategy for creating applications using Large Language Models (LLMs) in a VSCode environment. It emphasizes a structured, phased approach to ensure clarity, modularity, and maintainability while adhering to standard syntax and best practices.

You'll want to work step by step through the phases below, ensuring each is complete before moving to the next. Always reference the relevant project documentation for syntax and examples.

1. Read the **Project Overview**: Follow the [Instructions for Understanding the Project](instructions/planning.instructions.md) and [README.md](README.md) to gather context about the project structure, existing code, and documentation.

2. Read the **Ticket**: `tickets/` directory (see [Instructions for Working with Tickets](instructions/tickets.instructions.md)). If a ticket is given as context for changes, understand the requirements, designs, constraints, and acceptance criteria outlined in the ticket.

3. Create or Edit **Tables**: `backend/db/tables/` directory (see [Guideline for System Tables](../docs/guidelines/guideline_for_database.md)). It is recommended to create tables without foreign key references, constraints, or indexes initially. These can be added later once all required tables have been created.

4. Write **Queries**: When writing queries for database operations, see [Guideline for System Tables](../docs/guidelines/guideline_for_database.md) for database technology, schema owner, naming conventions, and best practices.

5. Create or Edit **Functions**: `backend/functions/` directory (see [Guideline for Functions](../docs/guidelines/guideline_for_functions.md)). When definining inputs and outputs for functions, refer to the guideline for naming conventions, data types, and error handling.

6. Create or Edit **API Endpoints**: When defining inputs for API endpoints, [Guideline for API Endpoints](../docs/guidelines/guideline_for_api_endpoints.md) for naming conventions, data types, and error handling.

7. Create or Edit **Tickets**: `tickets/` directory (see [Guideline for Tickets](../docs/guidelines/guideline_for_tickets.md)). When creating tickets, ensure to include all necessary information required by the [Template for Tickets](../docs/templates/template_for_tickets.md) and follow the [Instructions for Working with Tickets](instructions/tickets.instructions.md).

8. Create or Edit **Markdown Documentation**: `docs/software_units/` directory (see [Instructions for Updating Documentation](instructions/documenting.instructions.md)). After making code changes to a software unit, immediately update the relevant documentation to reflect the changes. This includes updating system design, features, and business rules as necessary.

9. Create or Edit **Project Folders**: `/` directory (see [Guideline for Project Structure](../docs/guidelines/guideline_for_project_structure.md)). When creating new project folders, refer to the guideline for naming conventions, folder hierarchy, and best practices.

10. Create or Edit **Tests**: `testing/` directory (see [Guideline for Testing](../docs/guidelines/guideline_for_testing.md)). When writing tests, follow the guideline for test structure, naming conventions, and best practices. Ensure to cover all relevant scenarios, including edge cases.

# Frontend Development

No recommendations at this time.

# Backend Development

No recommendations at this time.

# Broken/Missing References

Always notify the user when a particular referenced document was not found in the project. If a referenced document is missing, politely inform the user that you could not find the document and inform the user that you will not be able to proceed without it. This will also be helpful for the user to know if they renamed the document or moved it to a different folder, but forgot to update its references throughout the project.
