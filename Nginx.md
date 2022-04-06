# Installing
## Ubuntu
    sudo apt install nginx
    nginx -v // Verify successful installation
	
## Redhat
    sudo dnf install nginx

## Arch
    sudo pacman -S nginx
    yay nginx

# Controlling Service

    sudo nginx -t                 // Check syntax of Nginx configuration file
    sudo systemctl start nginx    // Start Nginx as a service
    sudo systemctl stop nginx     // Stop Nginx service
    sudo systemctl reload nginx   // Reload Nginx service (after configuration changes)
    sudo systemctl restart nginx  // Hard restart service
    sudo systemctl enable nginx   // Load Nginx service at at startup
    sudo systemctl disable nginx  // Do not load Nginx service at startup

# Firewall
The operating system's firewall will prevent traffic from accessing your Nginx server.

## Ubuntu (UnComplicated Firewall "ufw")
    sudo ufw app list             // Displays available firewall profiles
    sudo ufw allow 'nginx http'
    sudo ufw allow 'nginx https'
    sudo ufw allow 'nginx full'   // Enables both HTTP and HTTPS

# Run
	http://127.0.0.1

# Proxy Server
Open `nginx.conf`


    server {
      listen 80;
      listen [::]:80;

      server_name example.com;

      location / {
        proxy_pass http://localhost:3000/;
      }
    }

# Configuration Files
`/var/www/html` – Website content as seen by visitors.  
`/etc/nginx` – Location of the main Nginx application files.  
`/etc/nginx/nginx.conf` – The main Nginx configuration file.  
`/etc/nginx/sites-available` – List of all websites configured through Nginx.  
`/etc/nginx/sites-enabled` – List of websites actively being served by Nginx.  
`/var/log/nginx/access.log` – Access logs tracking every request to your server.  
`/var/log/ngins/error.log` – A log of any errors generated in Nginx.  
