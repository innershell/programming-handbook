# Starting
## Initiate Git Repository
Create a folder on local drive where all of your working source files will be placed (e.g., Source). This will initialize the current folder as a Git repository.

	git init


## Configure User Profile
```
git config --global user.name '<Your Name>' & git config --global user.email '<your_email>@gmail.com'
```

This creates a `.gitconfig` file with the following contents:
```
[user]
    name = <Your Name>
    email = <your_email>@gmail.com
```
## Fetch Repo

	git clone https://<username>:<personal-access-token>@github.com/<organization>/<respository-name>.git

## Login Issues
Make sure you have a secret store for the credentials.
```
sudo pacman -S gnome-keyring
systemctl --user enable --now gnome-keyring-daemon.service
code --password-store="gnome-libsecret"
```

### Visual Studio Code Terminal
If general Git solutions for authentication issues don't work, specific VS Code settings might be interfering: 
- Disable **Terminal Authentication**: This forces Git operations in the integrated terminal to use the system's authentication methods rather than VS Code's internal handler.
- Go to `File > Preferences > Settings` (or Code > Settings on some Linux builds).
- Search for `git.terminalAuthentication` and uncheck the box.

Check Default Browser Settings: 
- Sometimes, the authentication process which relies on opening a browser window might fail if the default system browser is misconfigured or a Flatpak installation.
- Ensure a standard browser (like Chrome or Firefox installed via system packages, not Flatpak) is set as the default in your Linux system settings.

Alternatively, you can try signing in via the GitHub CLI using the command gh auth login in the VS Code terminal. Clear Cached Credentials: If an old, invalid password is being used repeatedly, clear any saved credentials from your system's keyring or a credential manager. The method varies depending on your Linux distribution and desktop environment (e.g., Gnome Keyring). 

## Add Files

	git add index.html // Adds a specific file to the staging area.
	git add *.html     // Adds *.html files to the staging area.
	git add .          // Adds the entire current directory to the staging area.

## Remove Files

	git rm –cached index.html

## Review Pending Changes
See tracked files to be committed.

	git status

## Commit
This command opens a Vi editor in terminal mode. You have to uncomment the "Initial commit" text, save, and quit Vi to commit.

	git commit  // Uncomment "Initial commit" and write/quit (wq) file.

This command is a faster way by adding an option with commit comments.

	git commit –m "<your comment>"

# Branches
## Querying
### See Local Branches

	git branch

### See Remove Branches

	git branch -r

### See All Local and Remove Branches

	git branch -a

### Update Available Branches to Local

	git fetch -all

## Managing
### Create New Branch

	git branch <branch-name>

### Switch Branch

	git checkout <branch-name>

### Create and Switch Branch

	git checkout -b <branch-name>

## Rename Local Branch

	git branch -m <new-branch-name>

## Merge with Master

	git merge <branch-name>

## Sync to Master

	git push -u origin master

## Sync to Local

	git pull
