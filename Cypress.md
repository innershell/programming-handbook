# Installation
```
npm install cypress --save-dev
```

# Open Cypress
```
npx cypress open
```

# Commands Table of Contents
https://docs.cypress.io/api/table-of-contents

# Assertions (expect/should)
## should()
`should` is part of Cypress's chainable syntax and is typically used for simpler, more straightforward assertions. In other words, the assertion is native to Cypress.
1. Chainable: It can be chained directly to Cypress commands.
2. Implicit subject: It uses the subject yielded by the previous command.
3. **Retries automatically**: Cypress will retry the assertion until it passes or times out.

```
cy.get('#my-element').should('be.visible')
  .and('contain', 'Hello World');
```

## expect()
`expect` is part of the Chai assertion library and is often used for more complex assertions or when you need to work with variables.
1. Not chainable: It's used as a standalone function.
2. Explicit subject: You need to pass the subject explicitly.
3. **Does not retry**: The assertion is evaluated immediately.

```
cy.get('#my-element').then(($el) => {
  expect($el).to.be.visible;
  expect($el.text()).to.include('Hello World');
});
```

## When to Use Each
Use `should` when:
* You're working directly with Cypress commands
* You want automatic retries
* You need simple, chainable assertions

Use `expect` when:
* You're working with variables or complex objects
* You need to perform multiple assertions on the same subject
* You want to use more advanced Chai assertions

## References
*  Summary Table - https://docs.cypress.io/app/references/assertions
*  Full Listing - https://www.chaijs.com/api/bdd/

## Examples
```
should('equal', 'abc');
should('not.equal', 'abc');
should('include', 'abc');
should('be.true');
should('be.undefined');
should('exist');
should('be.empty');
should('be.greaterThan, 0);
should('be.within', 0, 1);
should('have.property', 'id');
should('have.string', 'abc');
should('have.text', 'abc');
should('contain.text', 'abc'); // Ideal for <p> or <span> tags.
should('be.oneOf', [404, 502]);
```

# Actions
Use these [actions](https://docs.cypress.io/api/table-of-contents#Actions) to interact with your application.
```
.click()
.type()
.check()
.select()
.dblclick()
```

# Best Practices
https://docs.cypress.io/app/core-concepts/best-practices
1. Every test should start from the same state and be [run independently](https://docs.cypress.io/app/core-concepts/best-practices#Having-Tests-Rely-On-The-State-Of-Previous-Tests) from one another. That is, when testing a page, each test will start from the base URL. You shouldn't be "chaining" tests and having to rely on the state of the previous tests.
2. [ Programmatically login](https://docs.cypress.io/app/core-concepts/best-practices#Organizing-Tests-Logging-In-Controlling-State) to your application, take control of your application state, and go directly to the page being tested.
3. Give your test element a [test attribute](https://docs.cypress.io/app/core-concepts/best-practices#Selecting-Elements) that is only used for testing.

# Cheatsheet
## Reading InnerHTML Contents of an Object
The way it works is by invoking the 'text' function.
```
cy.get('#text-new-patient-error-message').invoke('text').then(error => {
  cy.wrap(error).should('include', 'This patient already exists in your organization.')
})
```

## Things to Do with Cypress Objects
```
.type('<some text>')   // Type in some text.
.click()               // Click the the object.
.should('exist')       // Check that the object is in the DOM.
.should('be.visible')  // Check that the object is visible on the page.
.find('p')             // Find an element within the found object.
```

## Exception Handling
https://www.lambdatest.com/learning-hub/exception-handling-in-cypress
```
cy.on('uncaught:exception', (err, runnable) => {
    expect(err.message).to.include('409 Conflict') // Expect the error to include 409.
    cy.log(err.message) // Do some work.
    done() // Call a function.
    return false // Do not log the error to the command log.
})
```

## Button Click
[Cypress.io - Blog - Button Click Issues](https://www.cypress.io/blog/2019/01/22/when-can-the-test-click)

# Code Samples
Command: [intercept()](https://docs.cypress.io/api/commands/intercept)
## Inspect Network Requests
```
it("Testing a Request Interception", () => {
  // Setup the intercept to confirm that the request status code is 200.
  cy.intercept("GET", "/", (req) => {
    req.continue((res) => {
      expect(res.statusCode).to.eq(200);
    });
  });

  // Visit the root URL to trigger the intercept.
  cy.visit("/"); 
});
```

## Handling HTTP Status Codes
```
cy.request({
  method: "GET",
  url: "patient/documents",
  failOnStatusCode: false,
}).then((response) => {
  expect(response.status).to.not.be.within(200, 209); // Error 404 Not Found
});
```

## Fetching Text Without Invocation
```
cy.get('[ut-data="page-title"]').should("contain.text", "My Page Title");
```

## Fetching Text by Invoking the Its Function
```
cy.get('[ut-data="page-title"]')
  .invoke("text")
  .then((tenant) => {
    cy.wrap(tenant).should("include", "Page Not Found");
  });
```

This also works
```
cy.get('[ut-data="page-title"]').should("contain.text", "Page Not Found");
cy.get('[ut-data="page-title"]').should("have.text", "Page Not Found");
```

## Iterating
`.children()` gets the children of the object in context.
`.each()` loops through each children queried.

```
cy.get('div.parent').children().each(($child, index, $list) => {
  // Perform actions on each child element
  cy.wrap($child).click(); // Example action: clicking each child element
});
```
[Cypress documentation.](https://docs.cypress.io/api/commands/each)
