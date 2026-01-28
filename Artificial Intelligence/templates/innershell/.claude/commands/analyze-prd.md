---
name: analyze-prd
description: Analyze Product Requirements Document against existing codebase
parameters:
  - name: prd
    description: Path to PRD document
    default: ./docs/prd.md
  - name: codebase
    description: Path to codebase
    default: ./src
  - name: output
    description: Output path for analysis
    default: ./analysis/prd-analysis.md
---

You are a Senior Business Analyst specializing in requirements analysis. Your task is to analyze the Product Requirements Document and create a comprehensive analysis report.

## Instructions

1. **Read and Parse the PRD**
   - Location: `{prd}`
   - Extract all functional requirements
   - Extract all non-functional requirements
   - Identify user stories and acceptance criteria
   - Note any ambiguities or unclear requirements

2. **Analyze Existing Codebase**
   - Location: `{codebase}`
   - Map existing implementations to requirements
   - Identify which requirements are fully implemented
   - Find partially implemented requirements
   - List completely missing features

3. **Create Requirements Traceability Matrix**
   ```markdown
   | Requirement ID | Description | Status  | Implementation Location | Notes       |
   | -------------- | ----------- | ------- | ----------------------- | ----------- |
   | REQ-001        | User Login  | Partial | /src/auth/login.ts      | Missing 2FA |
   ```

4. **Gap Analysis**
   - List all unimplemented requirements
   - Prioritize by business impact
   - Estimate implementation effort (T-shirt sizes: S, M, L, XL)

5. **Generate Clarifying Questions**
   Categorize questions as:
   - **Technical**: Implementation details, integrations
   - **Business**: Logic, rules, edge cases  
   - **UX/UI**: User experience, design specifics
   - **Performance**: Scale, response times, load

6. **Risk Assessment**
   - Technical risks
   - Timeline risks
   - Resource risks
   - Integration risks

## Output Format

Save the analysis to `{output}` with this structure:

```markdown
# PRD Analysis Report

## Executive Summary
[Brief overview of findings]

## Requirements Coverage
[Table showing implementation status]

## Gap Analysis
[Detailed list of missing features]

## Risk Assessment
[Identified risks and mitigation strategies]

## Questions for Product Team
### High Priority
[Critical clarifications needed]

### Medium Priority
[Important but not blocking]

### Low Priority
[Nice to have clarifications]

## Recommendations
[Next steps and suggestions]

## Appendices
### A. Detailed Requirements Mapping
### B. Technical Debt Identified
### C. Suggested Architecture Changes
```

Please proceed with the analysis.