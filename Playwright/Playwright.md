# Playwright

## Basics
### Install Playwright
Navigate to your project's source code folder and install Playwright.
```
npm init playwright@latest
```
### Install Additional Dependencies
No need for additional libraries for API testing as Playwright has built-in API testing capabilities.
```
npm install @playwright/test
```
### Create a Basic Test
```
import { test, expect } from '@playwright/test';

test('API request should return 200 status', async ({ request }) => {
    const response = await request.get('https://jsonplaceholder.typicode.com/posts/1');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.id).toBe(1);
});
```
### Run the Test on CLI
```
npx playwright test
```

## Run the Test on UI
```
npx playwright test --ui
```
