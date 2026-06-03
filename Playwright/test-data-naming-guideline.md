# Test Data Naming Guideline

## Core Pattern

```
{entity}-{scenario}@{domain}
{entity}-{scenario}
```

Where:
- **entity** = what the record represents (`donor`, `admin`, `center`, `tenant`)
- **scenario** = the meaningful state or role, not a number (`active`, `suspended`, `new`, `vip`)
- **domain** = a reserved, obviously-fake domain (never a real one)

---

## Domain

Use one consistent fake domain across all test records:

```
@test.perkswyse.internal
```

Never use `@gmail.com`, `@email.com`, or `@example.com`. The `.internal` TLD is unroutable and makes it immediately obvious these are test records if they ever leak into a real environment.

---

## Naming Examples

| Purpose | Email | Name |
|---|---|---|
| Standard active donor | `donor-active@test.perkswyse.internal` | `Donor Active` |
| Donor with expired token | `donor-expired-token@test.perkswyse.internal` | `Donor Expired Token` |
| Donor at appointment limit | `donor-at-limit@test.perkswyse.internal` | `Donor At Limit` |
| First-time donor (no history) | `donor-new@test.perkswyse.internal` | `Donor New` |
| Suspended donor | `donor-suspended@test.perkswyse.internal` | `Donor Suspended` |
| Admin user | `admin-superuser@test.perkswyse.internal` | `Admin Superuser` |
| Read-only admin | `admin-readonly@test.perkswyse.internal` | `Admin Readonly` |
| Center / tenant A | *(no email)* | `Center Alpha` |
| Center / tenant B | *(no email)* | `Center Beta` |

---

## When You Genuinely Need Multiples

Use letters over numbers — they imply "distinct but equivalent" rather than "first and second":

```
donor-active-a@test.perkswyse.internal
donor-active-b@test.perkswyse.internal
```

Numbers are fine when **order or quantity is the actual point** of the scenario:

```
donor-referral-1@test.perkswyse.internal   ← the referrer
donor-referral-2@test.perkswyse.internal   ← the referred
```

---

## Names for Non-Email Entities

For centers, tenants, or anything without an email, use **word-based identifiers** over letters or numbers:

```
Center Alpha / Center Beta / Center Gamma
Tenant Northside / Tenant Southside
```

This makes test output logs and error messages human-readable at a glance — `"Center Alpha rejected appointment"` is immediately meaningful; `"Tenant B returned 403"` is not.

---

## The Rule of Thumb

> If a number is the only thing differentiating two records, the fixture probably needs a better scenario name instead.

`donor-1` and `donor-2` tells you nothing. `donor-active` and `donor-suspended` tells you exactly what each test is covering.
