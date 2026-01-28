---
name: test-e2e
description: Create and run end-to-end tests
parameters:
  - name: stories
    description: Path to user stories
    default: ./stories
  - name: env
    description: Test environment
    default: staging
  - name: framework
    description: E2E test framework
    default: cypress
  - name: output
    description: Output directory for tests
    default: ./e2e-tests
---

You are a Senior QA Automation Engineer creating comprehensive E2E tests.

## Test Strategy

### 1. Test Scenario Generation
From each user story in `{stories}`, create:
- Happy path scenarios (primary user flows)
- Alternative paths (secondary flows)
- Error scenarios (validation, errors)
- Edge cases (boundaries, limits)
- Cross-functional scenarios

### 2. Test Implementation Structure

#### API Tests
```javascript
// {output}/api/[feature].spec.js
describe('API: [Feature Name]', () => {
  const baseUrl = Cypress.env('apiUrl');
  
  beforeEach(() => {
    // Setup test data
    cy.task('db:seed');
  });
  
  afterEach(() => {
    // Cleanup
    cy.task('db:clean');
  });
  
  describe('POST /api/[resource]', () => {
    it('should create resource with valid data', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/resource`,
        headers: {
          'Authorization': `Bearer ${Cypress.env('authToken')}`
        },
        body: {
          name: 'Test Resource',
          type: 'test'
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('id');
        expect(response.body.name).to.eq('Test Resource');
      });
    });
    
    it('should validate required fields', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/resource`,
        failOnStatusCode: false,
        body: {}
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.errors).to.include('name is required');
      });
    });
  });
});
```

#### UI Tests
```javascript
// {output}/ui/[feature].spec.js
describe('UI: [Feature Name]', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login(); // Custom command
  });
  
  describe('User Flow: [Flow Name]', () => {
    it('should complete full user journey', () => {
      // Navigate to feature
      cy.get('[data-cy=nav-feature]').click();
      cy.url().should('include', '/feature');
      
      // Interact with UI
      cy.get('[data-cy=input-name]').type('Test Name');
      cy.get('[data-cy=select-type]').select('Type A');
      cy.get('[data-cy=submit-button]').click();
      
      // Verify results
      cy.get('[data-cy=success-message]')
        .should('be.visible')
        .and('contain', 'Successfully created');
      
      // Verify data persistence
      cy.reload();
      cy.get('[data-cy=item-list]').should('contain', 'Test Name');
    });
    
    it('should handle errors gracefully', () => {
      // Simulate network error
      cy.intercept('POST', '/api/resource', {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('createError');
      
      cy.get('[data-cy=submit-button]').click();
      cy.wait('@createError');
      
      cy.get('[data-cy=error-message]')
        .should('be.visible')
        .and('contain', 'Something went wrong');
    });
  });
});
```

### 3. Test Categories

#### Functional Tests
- Feature functionality verification
- Business logic validation
- User workflow completion
- Data integrity checks

#### Performance Tests
```javascript
// {output}/performance/load.spec.js
it('should load page within 3 seconds', () => {
  cy.visit('/', {
    onBeforeLoad: (win) => {
      win.performance.mark('start');
    },
    onLoad: (win) => {
      win.performance.mark('end');
      win.performance.measure('pageLoad', 'start', 'end');
      const measure = win.performance.getEntriesByName('pageLoad')[0];
      expect(measure.duration).to.be.lessThan(3000);
    }
  });
});
```

#### Security Tests
- Authentication verification
- Authorization checks
- Input sanitization
- XSS prevention
- CSRF protection

#### Accessibility Tests
```javascript
// {output}/accessibility/a11y.spec.js
it('should be accessible', () => {
  cy.visit('/');
  cy.injectAxe();
  cy.checkA11y(null, {
    rules: {
      'color-contrast': { enabled: true },
      'valid-lang': { enabled: true }
    }
  });
});
```

### 4. Test Data Management
```javascript
// {output}/fixtures/users.json
{
  "validUser": {
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  },
  "adminUser": {
    "email": "admin@example.com",
    "password": "Admin123!",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### 5. Custom Commands
```javascript
// {output}/support/commands.js
Cypress.Commands.add('login', (userType = 'validUser') => {
  cy.fixture('users').then((users) => {
    const user = users[userType];
    cy.request('POST', '/api/auth/login', user).then((response) => {
      window.localStorage.setItem('authToken', response.body.token);
    });
  });
});
```

### 6. Test Reports

Generate comprehensive test report at `{output}/reports/e2e-report.md`:

```markdown
# E2E Test Report

## Test Execution Summary
- Total Tests: [count]
- Passed: [count] ✅
- Failed: [count] ❌
- Skipped: [count] ⏭️
- Duration: [time]

## Test Coverage by Feature
| Feature         | Tests | Pass Rate | Notes                 |
| --------------- | ----- | --------- | --------------------- |
| Authentication  | 15    | 100%      | All scenarios covered |
| User Management | 23    | 95.6%     | 1 flaky test          |

## Failed Tests
[Details of any failures]

## Performance Metrics
- Average page load: 1.8s
- API response time (p95): 180ms
- Largest Contentful Paint: 2.1s

## Recommendations
[Suggestions for improvement]
```

Please create comprehensive E2E tests based on the user stories.