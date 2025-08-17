# Starting
## Initiate Git Repository
Create a folder on local drive where all of your working source files will be placed (e.g., Source). This will initialize the current folder as a Git repository.

	git init


## Configure User Profile
```
git config --global user.name 'Melvin Tan' & git config --global user.email 'innershell@gmail.com'
```

This creates a `.gitconfig` file with the following contents:
```
[user]
    name = Melvin Tan
    email = innershell@gmail.com
```
## Fetch Repo

	git clone https://<username>:<personal-access-token>@github.com/innershell/respository-name.git

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
