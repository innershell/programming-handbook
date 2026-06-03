# Test Data Guideline

**Project:** [Enter project name]  
**Scope:** Playwright (API & frontend testing) + Xano (backend/database)  
**Last updated:** 2026-06-02

---

## Overview

This project uses a **hybrid test data strategy** that combines pre-seeded data for complex scenarios with dynamically generated data for simpler, self-contained tests. The goal is repeatability, portability across environments, and minimal test setup friction.

---

## Core Principles

- **Seed complex data; generate simple data.** If creating the data state programmatically in Playwright would be brittle, time-consuming, or difficult to reason about, it belongs in seed data instead.
- **JSON is the single source of truth.** Seed data is defined once in JSON and consumed by both Xano's seed loader and Playwright's `/fixtures` folder. The two must never diverge.
- **Fixtures are intention-named.** File names describe the scenario, not the record (e.g., `donor_with_expired_token.json`, not `test_user_3.json`).
- **Fixtures are version-controlled.** JSON fixture files live alongside test code and are committed to source control. Rollbacks keep data and tests in sync.

---

## Workflow

### 1. Author Seed Data in Xano

Create the desired data shape using Xano functions, APIs, or direct database entry. Validate that the data correctly represents the intended test scenario.

### 2. Export JSON per Table

Once the seed data shape is confirmed, export each relevant table as a JSON file. This export is the canonical version of that seed data.

### 3. Maintain a Seed Data Loader in Xano

A dedicated Xano function consumes the exported JSON files and loads them into the database. This loader is idempotent and repeatable — it supports fresh environment setup and CI/CD pipelines.

### 4. Copy JSON to Playwright `/fixtures`

Place a copy of each exported JSON file in the Playwright `/fixtures` directory. Tests reference these files directly rather than re-creating the data at runtime.

### 5. Keep Both Copies in Sync (Required)

**Any change to seed data requires updating both locations:**

- The JSON file used by the Xano seed loader
- The corresponding file in Playwright's `/fixtures` folder

This step is mandatory. Skipping it causes tests to run against stale fixture assumptions, leading to false positives or misleading failures. Treat the JSON export as a required deliverable of any seed data change — not an optional follow-up.

> **Recommended:** Add a CI check or pre-commit reminder that flags when seed-related Xano functions are modified without a corresponding `/fixtures` update.

---

## File Naming Conventions

Fixture files should be named to describe the **scenario** they represent, not the record type alone.

| ✅ Good | ❌ Avoid |
|---|---|
| `donor_with_expired_token.json` | `test_user_3.json` |
| `center_at_capacity.json` | `center_data.json` |
| `appointment_pending_checkin.json` | `appointments.json` |

---

## Seed-Dependent vs. Self-Contained Tests

Document at the test suite or spec file level whether a test depends on seed data.

```ts
// @seed-dependent: requires donor_with_expired_token.json
test('expired token returns 401', async ({ request }) => { ... });

// @self-contained
test('valid login returns 200', async ({ request }) => { ... });
```

This makes it easy for a new tester to know exactly what to load before running a given suite.

---

## Environment Setup (New Testers)

1. Clone the repository.
2. Obtain the seed JSON files from `/fixtures` (already in source control).
3. Run the Xano seed loader function with the JSON files to populate the database.
4. Run Playwright tests normally — fixtures are already in place.

---

## What Belongs in Seed Data vs. Generated Data

| Scenario Type | Approach |
|---|---|
| Complex relational data (multi-table, foreign keys) | Seed |
| Edge cases requiring specific field values (expired dates, thresholds) | Seed |
| Data with business logic dependencies hard to reproduce via API | Seed |
| Simple single-entity creation for happy-path tests | Generate in Playwright |
| Ephemeral data only needed within a single test | Generate in Playwright |
| Data that must be cleaned up after each test | Generate in Playwright |

---

## Maintenance

- Review and update seed data whenever the Xano schema changes.
- Remove fixtures for deprecated test scenarios to prevent confusion.
- The Xano seed loader should be tested independently to confirm it loads cleanly into a blank database.
