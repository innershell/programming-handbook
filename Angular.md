# IDE Setup
## Environment Dependencies
This are my current dependency versions.  
- node v16.14.0
- npm v8.3.1
- ng v12.2.16
- ionic v6.18.1
 
## Installation
Install Node runtime. If the repo packages are not what you want, manually install node from [NodeSource](https://github.com/nodesource/distributions/blob/master/README.md#debinstall).  
```
sudo apt install nodejs
```

Install NPM  
```
sudo apt install npm
```

Install Angular CLI  
```
sudo npm install –g @angular/cli
```

Install Ionic CLI  
```
sudo npm install -g @ionic/cli
```

## Create, Build, and Run

Create a basic app.  
```
ionic start
```

Build the app with either Angular CLI or Ionic CLI  
```
ng build
ionic build
```

Build the app with a different base href (e.g., deploying as subfolder)
```
ng build --configuration production --base-href /sub-directory-name/
```

Deploy the app with eeither Angular CLI or Ionic CLI. Default port is 4200 if not specified.  
```
ng serve --host 0.0.0.0 --port 4200
ionic serve --host 0.0.00
```

# Project Files
## src/angular.json
Overall Angular project configuration file such as assets, styles, scripts, and other contents to load from CDN.

## src/package.json
All the dependencies for production are under "dependencies"
- @angular/animations
- @angular/router
- RxJS for observables

All the dependencies for development are under "devDependencies" 
- typescript
- tslint
- karma - testing tool

All the scripts used by the project
- Start
- Build
- Test
- Lint

## src/tsconfig.json
Configuration for Typescript

## src/app/main.ts
This is the entry point into Angular.

## src/app/app.module.ts
Imports all the modules needed by this project.

# Components
	• For creating reusable UI/UX items.
	• Each component will have 4 different files:
		○ CSS for the component.
		○ HTML "template" for the component.
		○ Spec.ts file for testing the component.
		○ Typescript file for main class with the component methods and properties (e.g., template, stylesheet).
		
	• Every component item can have only a single root item.
	• Every item in the component must be wrapped within the root element.

# Angular Services
Separates business logic from the components.

# Angular Decorators
Use to tell what kind of TypeScript class is being intended.
@Component
@NgModule
@Injectible - A reusable class

# Angular Syntax
## Binding
`[]` - **Property Binding** - One-way binding from the data source to the view target.
```
[style]="expression"
<div [color]="app.color"></div>
<div [ngClass]="setClass()"></div>
```
- Cannot be used to construct static + dynamic values.
- To do this, need to define a variable instead and construct the sentence before binding to the DOM property.

`()` - **Event Binding** - One-way binding from the view target to the data source.
```
(click)="statement"
```

`[()]` - **Two-Way Binding** - Banana in a box.
```
[(ngModel)]="expression"
```

`{}` - **Text Interpolation** - Binds the property value to the view component.
```
{{ person.name }}
```
- Use dot notation as applicable.
- Calculations can be done within the template expression and other cool stuff such as calling a function.
- Interpolated v alues are always truthy. Be careful with using interpolation for Booleans. Use property name binding instead.

## Pipes
A global tool for transforming and formatting data. Angular provides default built-in pipes, but you can create your own custom pipes.
```
<p>My birthday is {{ birthday | date }}</p>
```

## Styling Angular Components
https://medium.com/swlh/6-ways-to-dynamically-style-angular-components-b43e037852fa
