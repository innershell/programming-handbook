# Fragments
Each React component can return only a single element. Instead of wrapping your return elements in a `<div />` tag, use fragments.
```
import { Fragments } from "react";
<Fragment>
  <h1 />
  <h2 />
</Fragment>
```

```
# Shorthand
<>
  <h1 />
  <h2 />
</>
```


# State Management
You need to use states so that the variables declared in a component is accessible in the JSX.
```
import { useState } from "react";
const [selectedIndex, setSelectedIndex] = useState(-1);
```

# Props
Provide input parameters to a React component using Props.

```
# Define the Prop in the component.
import { Props } from "react";
function ComponentName({ items, heading }: Props) {
  return (
    // Now you can reference {items} or {heading} props anywhere in your JSX.
  );
}
```
```
# Pass input to your component as props.
<div>
  <ComponentName items=["red","green","blue"] heading="something">
</div>
```

# Event Handling
```
<div onClick={ () => console.log("Clicked") }
<div onClick={ (event) => console.log("event) }
```

```
import { MouseEvent } from "react";
function ComponentName() {
const handleClick = (event: MouseEvent) => console.log(event);
return (
  <div onClick={ handleClick }
);
```

