# Quick Start Resources
- Infinite Red's React Native Boilerplate Template - [infinitered/ignite](https://github.com/infinitered/ignite) (Github)
- [React Native Core Components and APIs](https://reactnative.dev/docs/components-and-apis)

# Development Environment

## Expo
[Expo](https://expo.dev) - Set of tools and a framework that sits on top of React Native that hides a lot of complexity from us. This also means that you cannot work with the native APIs of Android/iOS and will be limited by what Expo gives you for native features. Expo does give you a lot of native features without having to learn Java/Kotlin or Swift.
- [Expo Documentation](https://docs.expo.dev/)
- [Expo Go](https://expo.dev/go) - Mobile app to run the application.
- [Snack](https://snack.expo.dev/) - Code React Native with a browser based IDE (no need to install tools).

```
npx create-expo-app --template
cd <project folder>
npx expo start
npm run web
npm run android
npm run ios
```

Run these commands to upgrade Expo SDK
```
# Install latest
npm install expo@latest

# Install a specific SDK version
npm install expo@51

# Upgrade dependencies to match installed SDK version
npx expo install --fix
```

If the Expo SDK version changes, it may not be compatible with Expo Go anymore. Cleanup and upgrade your project as follows:
```
# Reinstall dependencies.
npm cache verify
npm cache clean --force
rm -rf node_modules/
rm package-lock.json
npm install
npx expo start -c
```

## Vite
[Vite](https://vitejs.dev/guide/) - Packaged build server to get you up and running quickly.

```
npm create vite@latest\
cd <project folder>
npm install // or npm i
npm run dev // from inside the folder
```

## Visual Studio Code Extensions
- React Native Tools by Microsoft
- React/Native/Redux snippets
- Prettier - Code formatter by Esben Peterson // Turn on "Format on Save" for VSCode
- Material Icon Theme by Philip Kief (for VSCode file icons)
- indent-rainbow by oderwat

## Debugging
### With Google Chrome Browser
- Enable [React Native Remote Debugging](https://reactnative.dev/docs/debugging) on Android Virtual Device.

### With Visual Studio Code
- Enable [React Native Remote Debugging](https://reactnative.dev/docs/debugging) on Android Virtual Device.
- Install React Native Tools


# React native Component
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

## Method 4
Use "ES7+ React/Redux/React-Native snippets" VSCode extension.
```
rafce
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
States are used as the component's personal data storage. It uses [Hooks](https://github.com/react-native-community/hooks), which is a kind of function that lets you "hook into" React features.
- You need to use states so that the variables declared in a component are accessible in the JSX.
- States are mutable, it's the purpose to tell React that a component contains data that can change at any time.
- [Other kinds of Hooks in the React documentation](https://react.dev/reference/react)

```
// Install the module.
npm i @react-native-community/hooks

// Import the module like this. Example of importing useDimensions shown.
import { useDimensions } fro '@react-native-community/hooks'; 
```
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

function ComponentName(props: Props) {
  return (
    // Now you can reference {props.items} or {props.heading} props anywhere in your JSX.
  );
}
```
Here's a better way  by desconstructing the props in the function's input parameter.
```
# Define the Prop in the component.
import { Props } from "react";

interface Props {
  items: string[];
  children: string;
  heading: string;
  color?: 'primary' | 'secondary' | 'warning'; // Optional property with limited values.
  onClick: () => void; // Pass in a function.
}

function ComponentName({ items, heading, color = 'primary' }: Props) {
  return (
    <button color={color} onClick={onClick}>{children}</button>
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
  heading?: string; // Optional property;
}

function ComponentName( props: Props ) {
  return(
    <h1>{props.heading}</h1>
  );
}
```

## Children
Children allows inputs to be passed as an innerHTML instead of a property.

For example:
```
<ComponentName>Hi <span>there</span>.</ComponentName>
```

```
interface Props {
  children: ReactNode; // or 'string' if need just a simple string
}

const ComponentName = ({ children }: Props) => {
  return (
    <div>{children}</div>
  )
};
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

# React Native Components
## Image
For images that will be packaged with the bunder.
```
<image source={require("./assets/icon.png")} />
```

## Lists
### FlatList
- `DATA` is defined as an array of objets with 3 keys-values.
- Item separator can be added.
- Index is shown.
```
<FlatList
  scrollEnabled={false} // Workaround needed for nested VirtualLists inside a ScrollView warning.
  style={{ width: "100%" }}
  data={ DATA }
  renderItem={({ item, index }) => (
    <Row index={index} colA={item[0]} colB={item[1]} colC={item[2]} />
  )}
  ItemSeparatorComponent={() => {
    return <View style={{ width: 10 }} />;
  }}
/>
```
### Map
```
{DATA.map((item, index) => {
  return (
    <Row
      key={index}
      index={index}
      colA={item[0]}
      colB={item[1]}
      colC={item[2]}
    />
  );
})}
```

For remote images.
```
<image
  source={{
    width: 200,
    height: 300,
    uri: "https://picsum.photos/200/300"
  }}
/>
```

# StyleSheet
[Documentation](https://reactnative.dev/docs/stylesheet)

## Inline Style
```
<View style={{
  backgroundColor: "dodgerblue",
  flex: 1
}}></View>
```

## StyleSheet Object
```
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

const App = () => (
  <View style={container}> // First method to reference
    <Text style={text}>React Native</Text>
  </View>


  <View style={page.container}> // Second method to reference
    <Text style={page.text}>React Native</Text>
  </View>
);

const page = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 30,
    color: '#000',
  },
});
```

## Flex
### Alignment
```
<View style={{
  flex: 1, // 100%
  flexDirection: "row", // Horizontal
  justifyContent: "center", // Position of contents on the primary axis, based on flexDirection value.
  alignItems: "center", // Position of items (each line) on the secondary axis, based on flexDirection value.
  alignContent: "center", Position of contents on the secondary axis, based on flexDirection value.
  alignSelf: "flex-start", // Position of the current object within the container.
}} />
```

### Wrapping
```
<View style={{
  flexWrap: "wrap"
}} />
```

### Size
```
<View style={{
  flexBasis: 100, // Width or height.
  flexGrow: 1, // Take as much room as possible.
  flexShrink: 1, // Shrink object if need more room on the line without wrapping.
}} />
```
