# File Structure
## Installed Apps
`/usr/local/` for your user profile
`/opt/` for shared users

# Installing Apps
1. Download your app (*.tar.gz) from a reputable website.
2. Unpack the .tar.gz file you downloaded to an appropriate location (see **File Structure** above).
3. Execute the *.sh file.

# Package Manager
A cheat sheet of the package manager name and usage options for each platform.

| Description | Ubuntu | [Arch](https://wiki.archlinux.org/title/pacman) | Fedora |
|-|-|-|-|
| **Package Manager** | `apt` | `pacman` <br> `yay` | `dnf` |
| **Package Details** | | `pacman -si` | |
| **Update Packages** | `apt update && apt upgrade` | `pacman -Syu` | `dnf update` |
| **Find Package** | `apt search pkg` | `pacman -S pkg` <br> `yay pkg` | `dnf search pkg` |
| **Install** | `apt install pkg` | `pacman -Ss pkg` <br> `yay pkg` | `dnf install pkg` |
| **Uninstall** | `apt remove pkg` | `pacman -Rsu pkg` <br> `yay -R pkg` | `dnf remove pkg` |
| **Package Cache Size** | | `du -sh /var/cache/pacman/pkg` |  |
| **Package No Longer in Repos** | | `pacman -Qm` | |
| **Remove Depencencies** | `apt autoremove` | `pacman -Qtdq \| sudo pacman -Rns -` | `dnf autoremove` |
| **Remove Package Cache** | | `pacman -Scc` | |

# Temporary Files

These are the folders holding temp files that can consume disk.

```
~/.cache
/tmp
/var/tmp
/var/log
/var/cache/pacman/pkg
```

## Cleanup

```bash
# journalctl
journalctl --disk-usage
jouralctl --vacuum-time=1days
jouralctl --vacuum-time=1weeks
jouralctl --vacuum-time=1months
journalctl --vacuum-size=200M

```

# Useful Commands
Command to locate a file. To search for a file that contains two or more words, use an asterisk (*).

## history
Review the commands you’ve entered before.

    history

## locate
Find files by name by ignoring case.

    locate -i school*note

## find
To find files in the current directory.

    find . -name notes.txt

To look for directories.

    / -type d -name notes. txt

## head
View the first 1o lines of a text file.

    head

## tail
View the last 10 lines of a text file.

    tail
  
## diff
Compares the contents of two files line by line. After analyzing the files, it will output the lines that do not match.

    diff

## ps
Find running processes.

     ps -ef | grep nginx

## tar
Create a tar.gz file

    tar -czvf file.tar.gz directory

## scp
Secure copy files to a remote server.

    scp file.tar.gz user@server_name:/folder_path/

# Network Tools (net-tools)

    sudo apt install net-tools
  
## netstat
Report on network connections. For example, good way to find programs listening for TCP connections on the system (e.g., Apache, Nginx).

    netstat -tlp

- `-t` TCP protocols
- `-n` Numbers (e.g., for ports)
- `-l` Active listeners
- `-p` Program names


## ifconfig
Configure network adapters and interfaces.

    sudo ifconfig eth0 down
    sudo ifconfig eth0 hw ether xx:xx:xx:xx:xx:xx
    sudo ifconfig eth0 up

# System Diagnostic Tools

## journalctl
To print log entries from `systemd`

```
journalctl
```

## dmesg
Print the kernel messages.

```
dmesg
```

## lspci
List of all PCI components.

```
lscpi
```

## lshw
List of all hardware components.

```
lshw -C video
```

## df
A report on the system’s disk space usage. Use `-m` option to report in MB.

```
df -m
```

## du
How much space a file or a directory takes.

```
du
```

## upower
Report USB devices battery.

```
upower
```
