# Quick Start Resources
- Infinite Red's React Native Boilerplate Template - [infinitered/ignite](https://github.com/infinitered/ignite) (Github)
- [React Native Core Components and APIs](https://reactnative.dev/docs/components-and-apis)

# Development Environment
- [Expo Go](https://expo.dev/go) ([Docs](https://docs.expo.dev/))
- [Snack](https://snack.expo.dev/) - Play with React Native in the browser.

## npm vs npx
- `npm` installs packages both globally and locally for your project. Local installs are placed in `./node_modules/.bin/` directory and added to the `package.json` dependency specifications.
- `npx` executes (runs) a package without installing locally. This allows you to test different package versions. Can also run directly from GitHub (pretty cool).
## Expo Go
```
which npx
npm install -g npx
npx create-expo-app AwesomeProject
cd AwesomeProject
npx expo start
```

# Component
Create a folder `Components` in your app `src` folder.

## Method 1
```
import { Stuff } from "react";
function ComponentName() {
  const varName = "";
  return();
}
export default ComponentName;
```

## Method 2
```
import { Stuff } from "react";
const ComponentName = () = {
  return();
}
export default ComponentName;
```

## Method 3
This one shows defining a child component to be used in the parent component.
```
import React from 'react';
import {Text, View} from 'react-native';

const Cat = () => {
  return (
    <View>
      <Text>I am also a cat!</Text>
    </View>
  );
};

const Cafe = () => {
  return (
    <View>
      <Text>Welcome!</Text>
      <Cat />
      <Cat />
      <Cat />
    </View>
  );
};

export default Cafe;
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
States are used as the component's personal data storage. It uses Hooks, which is a kind of function that lets you "hook into" React features.
- You need to use states so that the variables declared in a component are accessible in the JSX.
- States are mutable, it's the purpose to tell React that a component contains data that can change at any time.
- [Other kinds of Hooks in the React documentation](https://react.dev/reference/react)

```
import { useState } from "react";
const [selectedIndex, setSelectedIndex] = useState(-1);
```
Explanation: Creates a new `selectedIndex` variable with default value `-1` and defines the `setSelectedIndex()` function to set the value of the variable.

# Component Inputs
## Props
Pass inputs to a React component using Props. Props are immutable.

```
# Define the Prop in the component.
import { Props } from "react";

interface Props {
  items: string[];
  heading: string;
}

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
```

# Platform
Detect which platform is running and use it to implement [platform-specific code](https://reactnative.dev/docs/platform-specific-code#platform-module). Here is a sample code detecting `ios` or `android` platform.
```
import {Platform, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  height: Platform.OS === 'ios' ? 200 : 100,
});
```

```
import {Platform, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...Platform.select({
      ios: {
        backgroundColor: 'red',
      },
      android: {
        backgroundColor: 'green',
      },
      default: {
        // other platforms, web for example
        backgroundColor: 'blue',
      },
    }),
  },
});
```
