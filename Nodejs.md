# NPM
Install exact packages & versions from `package.json` and `package-log.json` cleanly. 
Just note that npm ci deletes node_modules before starting. But it’s fast!
```
npm ci
```

Install a package locally.
```
// Local install
npm install <package>
npm i <package>

/ Global install
npm install -g <package>
npm i -g <package>
```

Uninstall a package.
```
// Local install
npm uninstall <package>
npm un <package>

// Global uninstall
npm uninstall -g <package>
npm un -g <package>
```

Update a package.
```
npm update <package>
npm u <package>
```

List installed packages.
```
npm install -g npm@latest
npm list
```

Determines which version of `npm` is installed.
```
which npm
```

Install a specific version of `npm`.
```
npm install -g npm@5.10.0
npm version
```

Make npm install less noisy:
```
npm config set loglevel warn
```
or add this to `~/.npmrc`:
```
loglevel=warn
source.
```

# NVM
Use another node version:
```
$ nvm use 8
$ nvm use 10
```
