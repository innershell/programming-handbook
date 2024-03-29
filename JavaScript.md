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
