---
applyTo: "docs/software_units/**/*.md"
---

# [unit_type]: [unit_name]

## Description

> Required. Describe what this software unit does in 1-2 sentences.
> For more complex software units, it is encouraged to use more sentences and paragraphs to describe the software unit for better understanding.

## Examples

> Optional. Provide technical examples of usage or implementation of this software unit.

## Business Rules as Acceptance Criteria

> Required. Describe WHAT the rules are and WHY they are important.
>
> - ALWAYS use a top-level numbered list for each business rule so they are easily traceable.
> - Write each business rule as an acceptance criterion in the exact form: "RESULT ... WHEN ... BECAUSE ...".
> - For APIs and web pages, begin each criterion with: `Returns \`<status>\` when ... because ...`(example:`Returns \`200\` when request is valid because the transaction commits`).
> - For non-HTTP software units, begin each criterion with an imperative result verb (example: `Displays ... when ... because ...`).
> - Do NOT use nested numbered lists inside the acceptance criteria section. All lists must be top-level numbered items. Any supporting detail should be a sentence or short paragraph following the same numbered item (not a nested numbered list).
> - Display the acceptance criteria as a compact top-level numbered list with NO blank lines between items. Each numbered item must be a single paragraph (no internal line breaks) in the form: `RESULT ... WHEN ... BECAUSE ...` to make the criteria machine- and human-friendly.

1. Returns `403` when the request is missing required authorization or the caller lacks permission, because access control prevents unauthorized operations.
2. Returns `404` when the referenced resource does not exist, because the operation targets a missing resource.
3. Returns `200` when the operation completes successfully under the documented conditions, because all validations passed and the operation committed.
