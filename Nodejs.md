# NVM
Node Version Manager (NVM) can be used to install the Node.js runtime. It is also be used to install and use specific versions of Node.js for your environment.

Install `nvm`:
```
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

List available versions to install:
```
nvm list-remote
```

List versions install on the system:
```
nvm ls
```

Install node various versions:
```
nvm install node // Latest version
nvm install --lts // Latest stable version
nvm install 18.10.0 // Specific version
```

Set the default version
```
nvm use 19.0.0
```


# NPM
## npm vs npx
- `npm` installs packages both globally and locally for your project. Local installs are placed in `./node_modules/.bin/` directory and added to the `package.json` dependency specifications.
- `npx` executes (runs) a package without installing locally. This allows you to test different package versions. Can also run directly from GitHub (pretty cool).

## CLI
Install exact packages & versions from `package.json` and `package-log.json` cleanly. 
Just note that `npm ci` deletes `node_modules` before starting. But it’s fast!
```
npm ci
```

Install node packages:
```
// Local install
npm install <package>
npm i <package>

/ Global install
npm install -g <package>
npm i -g <package>
```

Uninstall a package:
```
// Local install
npm uninstall <package>
npm un <package>

// Global uninstall
npm uninstall -g <package>
npm un -g <package>
```

Update a package:
```
npm update <package>
npm u <package>
```

List installed packages:
```
npm list
```

Check version of `npm` is installed.
```
npm version
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


