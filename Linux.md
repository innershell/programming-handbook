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
