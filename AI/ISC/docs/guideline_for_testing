# Guideline: Testing

This document outlines how to create and edit tests for verification of design and validation of requirements.

## Manual Testing

Manual testing is done as needed by the developer during code development.

## Automated Testing

The following tools are utilized for automated testing:

- **Jest**: For software unit testing of inputs, outputs, and business logic. When a software unit requires data from the database, make a real connection to the database to ensure that the database changes were done properly. This is cheaper than duplicating all the unit testing again at e2e testing after deployment.
- **Playwright**: For software unit testing of frontend UI and backend API endpoints.
  - For frontend UI, extensively test rules coded into the frontend only. NEVER duplicate tests are already covered by the API endpoint.
  - For API endpoint, test simple normal and abnormal scenarios only. NEVER duplicate business logic tests already covered by the software unit testing.
