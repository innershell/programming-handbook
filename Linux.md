# File Structure

```
/                      Root 
|---bin                Commands needed during bootup that might be needed by normal users. 
|---boot               Files used by the bootstrap loader, LILO.  Kernel images are often kept here. 
|---dev                Device files for devices such as disk drives, serial ports, etc. 
|---etc                Configuration files specific to the machine. 
|    |----skel         When a home directory is created it is initialized with files from this directory 
|    |---sysconfig     Files that configure the linux system for networking, keyboard, time, and more. 
|---home               Contains the user's home directories 
|    |---ftp           Users include many services as listed here 
|    |---httpd 
|    |---samba 
|    |---user1
|    |    |--- .var             
|    |    |    |-- app        Data for apps installed via Flatpak.
|    |---user2 
|---lib                Shared libraries needed by the programs on the root filesystem 
|    |---modules       Loadable kernel modules, especially those needed to boot the system after disasters. 
|---media              Mount points for removable media such as CD ROMS. 
|---mnt                Mount points for temporary mounts by the system administrator. 
|---opt                Optional application software packages, which is not handled by the package manager. 
|---proc               This filesystem is not on a disk.  Exists in the kernels imagination (virtual).  This directory 
|    |                 Holds information about kernel parameters and system configuration. 
|    |---1             A directory with info about process number 1.  Each process has a directory below proc.   
|---root               The home directory for the root user 
|---run                Run-time variable data: Information about the running system since last boot. 
|---sbin               Like bin but commands are not intended for normal users (e.g., superuser).  Commands run by LINUX. 
|---srv                Site-specific data served by this system such as web servers, FTP servers, version control systems. 
|---sys                Information about devices, drivers, and some kernel features. 
|---tmp                Temporary files.  Programs running after bootup should use /var/tmp. 
|---usr                Contains all commands, libraries, man pages, games and static files for normal operation. 
|    |---bin                  Almost all user commands.  Some commands are in /bin or /usr/local/bin. 
|    |---include              Header files for the C programming language.  Should be below /user/lib for consistency. 
|    |---lib                  Unchanging data files for programs and subsystems 
|    |---local                The place for locally installed software and other files. 
|    |---sbin                 System admin commands not needed on the root filesystem. E.g., most server programs. 
|    |---share                Architecture-independent (shared data) 
|    |    |---applications    Where all the application shortcuts are stored.
|    |---src                  Source code. E.g., the kernel source code with its header files. 
|    |---X11R6                The X windows system files.  There is a directory similar to usr below this directory. 
|---var                       Contains files that change for mail, news, printers log files, man pages, temp files 
|    |---cache                Application cache data. 
|    |---lib                  Files that change while the system is running normally 
|    |---local                Variable data for programs installed in /usr/local. 
|    |---lock                 Lock files.  Used by a program to indicate it is using a particular device or file 
|    |---log                  Log files from programs such as login and syslog which logs all logins, logouts, and other system messages. 
|    |---mail                 Mailbox files. 
|    |---opt                  Variable data from add-on packages that are stored in /opt. 
|    |---run                  Files that contain information about the system that is valid until the system is next booted 
|    |---spool                Directories for mail, printer spools, news and other spooled work. 
|    |---tmp                  Temporary files that are large or need to exist for longer than they should in /tmp. 
|    |---www 
|    |    |---html 
```
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
| **Remove Yay Cache** | | `yay -Sc` ||

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
# yay
yay -Sc

# journalctl
journalctl --disk-usage
jouralctl --vacuum-time=1days
jouralctl --vacuum-time=1weeks
jouralctl --vacuum-time=1months
journalctl --vacuum-size=200M

# npm, pnpm
npm cache clean --force
pnpm store prune
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

## ncdu
Terminal based visualizer of du

```
sudo pacman -S ncdu
ncdu /
```

## upower
Report USB devices battery.

```
upower
```
