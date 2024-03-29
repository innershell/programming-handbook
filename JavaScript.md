# HTML Code Injections

## <script>
Use the `<script>` tag in the header to encapsulate or reference to the external JS file. 

### HTML Inline
```
<head> 
  <script> 
    function fingerScan(x) { 
      if (x == 1) { 
        $("#finger1").show(); 
      } 
    } 
  </script> 
</head> 
```

### External JavaScript File
```
<head> 
  <script src="resources/js/sop-controller.js"></script> 
  <script src="resources/js/donor-bus-logic.js"></script> 
</head>
```

# Functions
## Dynamic Functions 
`this["function_name_as_a_string"](parameters);`

## Arrow Functions 
`const variable_name = (parameters) => { your_code_here };`

## Anonymous Functions 
`const variable_name = function(parameters) { your_code_here }`

# Console
## Logging Hacks
https://www.sitepoint.com/beyond-console-log-level-up-your-debugging-skills/ 

# Comments
https://en.wikipedia.org/wiki/JSDoc

```
/**
 * Returns x raised to the n-th power.
 *
 * @param {number} x The number to raise.
 * @param {number} n The power, must be a natural number.
 * @return {number} x raised to the n-th power.
 */
function pow(x, n) {
  ...
}
```

# HTTP Requests
```
const baseURL = 'https://example.com/rest/api/2/search?';
const options = '&maxResults=20';
const username = 'api';
const token = '550e8400-e29b-41d4-a716-446655440000';

// Add basic authentication header data.
let headers = new Headers();
headers.set('Authorization', 'Basic ' + btoa(username + ":" + token));

// Fetch data from API.
async function getIssues() {
  let response = await fetch(baseURL + jql + options, {
  method: 'get',
  headers: headers
}); 

let data = await response.json();
console.log(data); 
```

# JSON
## Finding Keys
```
let JSON = { fname : "John", lname : "doe", age: 23 }
for (let key in JSON) console.log('key', key);
```

Output:
```
> "fname"
> "lname"
> "age"
```

# REGEX

## Instantiate
```
const re = /foo/;
const val = 'Hello';
let result = val.search(re);
```

## String Functions
```
const matches = 'aBC'.match(/[A-Z]/g);
// Output: Array [B, C]
```
```
const index = 'aBC'.search(/[A-Z]/);
// Output: 1
```
```
const next = 'aBC'.replace(/a/, 'A');
// Output: ABC
```
```
const result = /^dim/.test("dimValue");
// Output: true
``` 
