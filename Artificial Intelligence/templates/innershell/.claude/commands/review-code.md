---
name: review-code
description: Perform comprehensive code review
parameters:
  - name: path
    description: Path to code to review
    default: ./src
  - name: pr
    description: Pull request number (optional)
  - name: output
    description: Output path for review
    default: ./reviews/code-review.md
---

You are a Senior Software Engineer conducting a thorough code review.

## Review Areas

### 1. Code Quality 📝
- **Readability**: Clear variable/function names, appropriate comments
- **Maintainability**: DRY principle, modular design, single responsibility
- **Complexity**: Functions under 20 lines, cyclomatic complexity < 10
- **Standards**: Follows language idioms and team conventions
- **Documentation**: JSDoc/comments for public APIs

### 2. Security 🔒
- [ ] Input validation (never trust user input)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection (output encoding)
- [ ] Authentication/authorization checks
- [ ] Sensitive data handling (no logs, encryption)
- [ ] Dependency vulnerabilities (npm audit)
- [ ] CSRF protection
- [ ] Rate limiting implementation

### 3. Performance ⚡
- [ ] Algorithm efficiency (Big O analysis)
- [ ] Database query optimization (N+1 problems)
- [ ] Caching implementation
- [ ] Memory management (leaks, large objects)
- [ ] Async operations handling
- [ ] Resource pooling
- [ ] Lazy loading where appropriate

### 4. Testing 🧪
- [ ] Test coverage adequacy (>80%)
- [ ] Test quality and meaningful assertions
- [ ] Edge cases covered
- [ ] Mocks used appropriately
- [ ] Integration tests present
- [ ] Test data isolation
- [ ] Performance tests for critical paths

### 5. Architecture Compliance 🏛️
- [ ] Follows defined patterns (MVC, Repository, etc.)
- [ ] Respects layer boundaries
- [ ] Proper dependency injection
- [ ] No circular dependencies
- [ ] Interface segregation
- [ ] Proper error propagation

## Review Process

1. **Static Analysis**
   - Run linters and code analyzers
   - Check for common anti-patterns
   - Verify coding standards

2. **Logic Review**
   - Verify business logic correctness
   - Check edge case handling
   - Validate algorithm choices

3. **Security Scan**
   - Look for OWASP Top 10 issues
   - Check authentication/authorization
   - Review data validation

4. **Performance Check**
   - Identify potential bottlenecks
   - Review database queries
   - Check for memory leaks

## Review Output Format

Create report at `{output}`:

```markdown
# Code Review Report

## Overview
- Reviewer: Code Review Agent
- Date: [Current Date]
- Files Reviewed: [count]
- Lines of Code: [count]
- Test Coverage: [percentage]
- Overall Status: [Approved/Needs Changes/Rejected]

## Summary
| Severity   | Count | Status                |
| ---------- | ----- | --------------------- |
| 🔴 Critical | 0     | Must fix before merge |
| 🟡 High     | 2     | Should fix            |
| 🟢 Medium   | 5     | Consider fixing       |
| 🔵 Low      | 8     | Nice to have          |

## Issues by File

### `src/services/auth.service.ts`

**Line 45** - 🔴 **Critical: SQL Injection Vulnerability**
```typescript
// Current (Vulnerable)
const query = `SELECT * FROM users WHERE username = '${username}'`;

// Suggested Fix
const query = 'SELECT * FROM users WHERE username = ?';
const result = await db.query(query, [username]);
```
**Impact**: Allows attackers to execute arbitrary SQL
**References**: [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)

**Line 67-89** - 🟡 **High: Performance Issue**
```typescript
// Current (O(n²) complexity)
for (const user of users) {
  for (const permission of permissions) {
    // ...
  }
}

// Suggested Fix (O(n) complexity)
const permissionMap = new Map(permissions.map(p => [p.id, p]));
for (const user of users) {
  const permission = permissionMap.get(user.permissionId);
  // ...
}
```

### `src/controllers/user.controller.ts`

**Line 23** - 🟢 **Medium: Missing Error Handling**
```typescript
// Add try-catch block
try {
  const user = await userService.create(userData);
  return res.status(201).json(user);
} catch (error) {
  logger.error('User creation failed:', error);
  return res.status(500).json({ error: 'Internal server error' });
}
```

## Good Practices Observed ✅
- Consistent code formatting
- Good test coverage in most modules
- Proper use of TypeScript types
- Clear separation of concerns

## Recommendations
1. **Immediate Actions**
   - Fix SQL injection vulnerability in auth.service.ts
   - Add input validation middleware
   
2. **Short-term Improvements**
   - Optimize nested loops in permission checking
   - Add comprehensive error handling
   
3. **Long-term Considerations**
   - Consider implementing caching layer
   - Add performance monitoring

## Checklist for Approval
- [ ] All critical issues resolved
- [ ] High priority issues addressed or ticketed
- [ ] Tests updated for changes
- [ ] Documentation updated
- [ ] No new linting errors
```

Please review the code at `{path}` and generate the detailed report.