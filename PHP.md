# Import
```
require_once '../resources/vendors/meekro/db.class.php';
```

# Data Types
## Number, Float
```
$x = 1;
$x = 1.5;
```

## String
```
$x = 'Hello' . ' ' . 'World';
```

## Boolean
```
$x = true;
$x = false;
```

## Indexed Array
```
$x = ("Volvo","BMW","Mercedes")
echo $[0]; // Volvo.
echo $[1]: // BMW.
echo $[2]: // Mercedes.
```
## Associative Arrays
```
$myArray["user1"] = array("firstName"=>"John", "lastName"=>"Doe");
$myArray = array("firstName"=>"John", "lastName"=>"Doe");
```
## Object
```
$x->color = "Red";
$x->type = "Car";
$x->brand = "BMW";
```

# Null
```
$x = null;
```


# Variables
```
$varName;
```

# Constants
```
define("CONSTANT_NAME", "This is my value.");
```

# Operators
```
$x + $y;
$x - $y;
$x * $y;
$x / $y;
$x % $y;
$x %% $y; // Exponent.
$x = $y;
$x += $y;
$x -= $y;
$x *= $y;
$x /= $y;
$x %= $y;
$x == $y;
$x === $y; // Identical value and type.
$x != $y;
$x <> $y;
$x !== $y; // Not identical value or type.
$x <=> $y; // Spaceship.
++$x;
$x++;
--$x;
$x--;
and
or
xor
&&
||
! // Not
```

# Conditions & Loops
## if-elseif-else
```
if (condition) {
	// Code
} elseif (condition) {
	// Code
} else {
	// Code
}
```

## Ternary Shorthand
```
$result = $initial ?: 'final';
```
## Isset Ternary (Null Colescing)
[Wiki](https://wiki.php.net/rfc/isset_ternary#vote)
```
$result = $initial ?? 'final';
```
## Loops
```
while
do...while
for
foreach
```
# Function
```
function functionName(int $argument = 5) {
	// Code
	return $result;
}

function functionName(&$argument) { // Pass argument by reference
	// Code
	return $result;
}
```

# Superglobal Variables
```
$_POST["name"] // Obtains the HTTP post variables.
$_GET["name"] // Obtains the HTTP get variables.
$_SESSION["login"] // Obtains the session variables.
```
[More Here](https://www.w3schools.com/php/php_superglobals.asp)

# Built-In Methods
```
session_start(); // Starts new or resume existing session.
echo myString; // Output a string.
print(); // Output a formatted string.
header("Location: <path>"); // Redirect to path
json_encode(); // Returns JSON representation of a value.
preg_replace(); // Perform regular expression search and replace.
preg_match(); // Perform a regular expression match.
```

# Sample Code
```
require_once '../resources/vendors/meekro/db.class.php';
DB::$error_handler = 'error'; // runs on mysql query errors
DB::$nonsql_error_handler = 'error'; // runs on library errors (bad syntax, etc)
$result = db::queryFirstRow("SELECT * FROM records where uuid = %s", $record_uuid);
DB::query("INSERT INTO records_archive SELECT * FROM records WHERE uuid = %s", $data->uuid);
DB::delete("records", "uuid=%s", $data->uuid);

DB::insert('records', [
	'uuid' => $data->uuid,
	'tenant_uuid' => "44f2e162-7992-11ea-8bb6-ace4718a5f3d", /** REFACTOR */
	'config_uuid' => $data->config_uuid,
	'config_code' => $data->config_code,
	'object' => $data->object,
	'json' => json_encode($data->json),
	'timestamp' => DB::sqleval("NOW()")
]);
```
