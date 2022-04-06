# Package Manager

| Description | Ubuntu | Arch | Fedora |
|-|-|-|-|
| **Package Manager** | apt | pacman or yay | dnf |
| **Update Package List** | apt update | pacman -Syu | dnf update |
| **Find Package** | apt search pkg_name | pacman -S pkg_name<br>yay pkg_name | dnf search pkg_name |
| **Install** | apt install pkg_name | pacman -Ss pkg_name<br>yay pkg_name | dnf install pkg_name |
| **Uninstall** | apt remove pkg_name | pacman -R pkg_name<br>yay -R pkg_name | dnf remove pkg_name |


# Network Tools (net-tools)

    sudo apt install net-tools
  
## netstat
Report on network connections. For example, good way to find programs listening for TCP connections on the system (e.g., Apache, Nginx).

    netstat -tlp

- `-t` TCP protocols
- `-l` Active listeners
- `-p` Program names


## ifconfig
Configure network adapters and interfaces.

    sudo ifconfig eth0 down
    sudo ifconfig eth0 hw ether xx:xx:xx:xx:xx:xx
    sudo ifconfig eth0 up
