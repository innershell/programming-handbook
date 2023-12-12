# Reading InnerHTML Contents of an Object
The way it works is by invoking the 'text' function.
```
cy.get('#text-new-patient-error-message').invoke('text').then(error => {
  cy.wrap(error).should('include', 'This patient already exists in your organization.')
})
```

# Things to Do with Cypress Objects
```
.type('<some text>') // Type in some text.
.click() // Click the the object.
.should('exist') // Check that the object is on the page.
.find('p') // Find an element within the found object.
```

# Exception Handling

https://www.lambdatest.com/learning-hub/exception-handling-in-cypress
```
cy.on('uncaught:exception', (err, runnable) => {
    expect(err.message).to.include('409 Conflict') // Expect the error to include 409.
    cy.log(err.message) // Do some work.
    done() // Call a function.
    return false // Do not log the error to the command log.
})
```
