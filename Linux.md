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
| **Remove Depencencies** | `apt autoremove` | `pacman -Qtdq \| sudo pacman -Rns -` | `dnf autoremove` |
| **Remove Package Cache** | | `pacman -Scc` | |

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

## journalctl
To print log entries from `systemd`

## df
A report on the system’s disk space usage. Use `-m` option to report in MB.

    df -m

## du
How much space a file or a directory takes.

    du

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
