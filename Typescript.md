# Interfaces
Interfaces are a feature of TypeScript that allows us to define the structure or shape of an object and specify the properties and methods that an object has or should have. Their primary function is type checking and aiding developers in catching type-related errors during development.
```
interface Person {
  name: string;
  age: number;
  sex: "male" | "female";
}

const personOne: Person = {
  name: "Conner",
  age: 24,
  sex: "male",
}

console.log(personOne.name); // Conner
console.log(personOne.hobbies); // undefined
```

# Generics
Allow us to define placeholder types which are then replaced when the code is executed with the actual types passed in. Generics are like a template that can be reused across the same piece of code multiple times but with the value being independent of each invocation of the function. 

In this example, we define a function to retrieve the first value of a given array, but we don’t want to define the array type in the function as a fixed type like a number or string. So, instead, we define a generic (T), which is used to type the argument being passed in as well as the return value. This generic value will be replaced at runtime with a more accurate type which you can see when we call the function and pass in the values <number> and <string>.

```
// We define a generic value called T with <T>
function getFirstElement<T>(arr: T[]): T {
  return arr[0];
}

const numberArray: number[] = [1, 2, 3, 4, 5];
const stringArray: string[] = ['apple', 'banana', 'orange'];

// Note the generic values being passed in <number> & <string>
const firstNumber = getFirstElement<number>(numberArray);
const firstString = getFirstElement<string>(stringArray);
```

# Modules
The JavaScript specification declares that any JavaScript files without an `import` declaration, `export`, or top-level `await` should be considered a script and not a module.

# Types
```
const param: any;
const param: string;
const param: number;
const param: boolean;
const param: string[];
function greet(name: string): string { return "string"; }; // Funtion takes and resturns a string.
```

# Union Types
Allows either type.
```
function printId(id: number | string) {
  console.log("Your ID is: " + id);
}
```

# Anonymous Functions
```
const names = ["Alice", "Bob", "Eve"];
 
// Contextual typing for function - parameter s inferred to have type string
names.forEach(function (s) {
  console.log(s.toUpperCase());
});
 
// Contextual typing also applies to arrow functions
names.forEach((s) => {
  console.log(s.toUpperCase());
});
```
