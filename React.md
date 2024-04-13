# Component
Create a folder `Components` in your app `src` folder.
```
# Method 1
import { Stuff } from "react";
function ComponentName() {
  const varName = "";
  return();
}
export default ComponentName;
```

```
# Method 2
import { Stuff } from "react";
const ComponentName = () = {
  return();
}
export default ComponentName;
```

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
You need to use states so that the variables declared in a component is accessible in the JSX. States are mutable, it's the purpose to tell React that a component contains data that can change at any time.
```
import { useState } from "react";
const [selectedIndex, setSelectedIndex] = useState(-1);
```

# Component Inputs
## Prop
Pass inputs to a React component using Props. Props are immutable.

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

## Interface
A Typescript interface to define the interface (or shape) to an object.
```
interface Props {
  items: string[];
  heading: string;
}

function ComponentName( props: Props ) {
  return(
    <h1>{props.heading}</h1>
  );
}
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
}
```

# Notify
Notify the parent that an event had occurred.
```
# Define the component
interface Props {
  items: string[];
  heading: string;
  onSelectItem: (item: string) => void;

function ComponentName({ items, heading, onSelectItem }): Props) {
<div onCLick={ handleClick } onSelectItem(item) />
}
```

```
# Use it on the app.
<ComponentName items={items} heading={heading} onSelectItem={console.log("selected")} />
