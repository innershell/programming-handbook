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

## Authentication Issues

Make sure you have a secret store for the credentials.

Arch Linux:

```bash
sudo pacman -S gnome-keyring
systemctl --user enable --now gnome-keyring-daemon.service
code --password-store="gnome-libsecret"
```

Windows WSL2

```bash
# 1. Ensure Git for Windows is installed on your Windows host.

# 2. Configure Git in WSL to use the Windows Git Credential Manager:
git config --global credential.helper "/mnt/c/Program\ Files/Git/mingw64/bin/git-credential-manager.exe"

# 3. Ensure GCM is configured to use Windows as the credential store (usually default):
git config --global credential.credentialStore windows
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

If you want to uncommit and **keep your files exactly as they are** (to edit or re-commit later), use the `--soft` flag.

    git reset --soft HEAD~1

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

# Projects, Issues, and Milestones

## Projects

GitHub **Projects** (the planning tool) can live at different levels depending on what you're trying to organize:

- **Repository-level Projects**: These are contained within a specific repository. They are best for managing tasks, bugs, and features that only apply to that one codebase.
- **User/Account-level Projects**: These live on your personal profile. They are perfect for "big picture" planning that spans across multiple repositories you own.
- **Organization-level Projects**: If you are part of a team, projects can live at the organization level. This allows you to track issues and pull requests from many different repositories owned by that organization in one central board.

## Milestones

GitHub Milestones live strictly inside a **Repository**, just like **Issues**.

## Issues

GitHub Issues live within the a **repository\*\*\*\***. The Project is just a **view** that pulls in issues from one or more repositories to help visualize the scope of a Project.

- Note that _Draft_ issues only live in the Project until it is _converted_ into an Issue.

## Example: Managing a Software Release

The general convention is:

- The **Project** represents the product or initiative (e.g., `ACME`). It is long-lived and acts as the persistent planning board across all releases. You would not name it `ACME v1.0.0`.
- **Milestones** represent specific releases or deadlines (e.g., `v1.0.0`, `v1.1.0`). Issues and pull requests are tagged to a milestone to indicate which release they belong to.
- The **Project** can then have filtered views by milestone to show the scope of each release.

| Concept   | Name            | Lives In   | Purpose                                            |
| --------- | --------------- | ---------- | -------------------------------------------------- |
| Project   | `ACME`          | Repository | Persistent planning board for all product work     |
| Milestone | `v1.0.0`        | Repository | Groups issues/PRs targeting the initial release    |
| Milestone | `v1.1.0`        | Repository | Groups issues/PRs targeting the next minor release |
| Issue     | `Add login`     | Repository | Assigned to `v1.0.0` milestone, tracked in `ACME`  |
| Issue     | `Add dark mode` | Repository | Assigned to `v1.1.0` milestone, tracked in `ACME`  |

**Workflow**:

1. Create a repository-level Project named `ACME`.
2. Create Milestones `v1.0.0` and `v1.1.0` inside the repository.
3. Create Issues for each feature or bug, and assign each to the appropriate milestone.
4. In the `ACME` Project board, add a filter or grouped view by milestone to see what is planned for each release.
5. When all issues in `v1.0.0` are closed, the milestone is complete and you can tag a release.

## Capturing Phases Within a Release

For phases like Development, Testing, and Release within a single version, there are two complementary tools. **Milestones should not be used for phases** — that would conflict with their role as version markers.

### Option A: Project Status Field (recommended)

GitHub Projects (v2) supports custom fields. A **single-select "Phase" field** on the `ACME` board lets you track where each issue stands within a release cycle. This is the most visual approach since the board can be grouped by Phase.

| Phase field value | Meaning                             |
| ----------------- | ----------------------------------- |
| `Development`     | Issue is actively being built       |
| `Testing`         | Issue is in QA / verification       |
| `Release`         | Issue is approved and ready to ship |

Each issue carries both a **Milestone** (which version) and a **Phase** (what stage), independently:

| Issue           | Milestone | Phase         |
| --------------- | --------- | ------------- |
| `Add login`     | `v1.0.0`  | `Development` |
| `Fix signup`    | `v1.0.0`  | `Testing`     |
| `Add dark mode` | `v1.1.0`  | `Development` |

### Option B: Labels (lightweight alternative)

**Labels** are the common convention for teams that want a simpler setup without custom Project fields. Create a label group prefixed consistently so they sort together:

| Label                | Color  | Usage                            |
| -------------------- | ------ | -------------------------------- |
| `phase: development` | blue   | Issue is being implemented       |
| `phase: testing`     | yellow | Issue is under QA review         |
| `phase: release`     | green  | Issue is cleared for the release |

Labels are repository-scoped and show up everywhere (issue lists, PR views, filters), making them visible without opening the Project board. The trade-off is that they are free-form text with no enforced single-select behavior, so an issue could accidentally carry multiple phase labels.

### Comparison

| Feature               | Project Status Field              | Labels                              |
| --------------------- | --------------------------------- | ----------------------------------- |
| Enforced single value | Yes                               | No                                  |
| Visible outside board | No                                | Yes (issue list, PRs)               |
| Setup required        | Add field to Project              | Create labels in repository         |
| Best for              | Teams using Project board heavily | Lightweight / cross-repo visibility |

In practice, many teams use **both**: labels for quick filtering anywhere in the repo, and the Project status field as the authoritative phase tracker on the board.
