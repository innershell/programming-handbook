# Installation
```
npm install cypress --save-dev
```

# Open Cypress
```
npx cypress open
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

## Fetching Text by Invoking the Its Function
```
cy.get('[ut-data="page-title"]')
  .invoke("text")
  .then((tenant) => {
    cy.wrap(tenant).should("include", "Page Not Found");
  });
```
