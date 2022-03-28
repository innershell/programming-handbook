# Angular
## Environment Dependencies
This are my current dependency versions.  
- node v16.14.0
- npm v8.3.1
- ng v12.2.16
- ionic v6.18.1
 
## Installation
Install Node runtime. If the repo packages are not what you want, manually install node from [NodeSource](https://github.com/nodesource/distributions/blob/master/README.md#debinstall).  
`sudo apt install nodejs`

Install NPM  
`sudo apt install npm`

Install Angular CLI  
`sudo npm install –g @angular/cli`

Install Ionic CLI  
`sudo npm install -g @ionic/cli`

## Create, Build, and Run

Create a basic app.  
`ionic start`

Build the app with either Angular CLI or Ionic CLI  
`ng build` or `ionic build`

Deploy the app with eeither Angular CLI or Ionic CLI. Default port is 4200 if not specified.  
`ng serve --host 0.0.0.0 --port 4200` or `ionic serve --host 0.0.00`
