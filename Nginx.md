# Installing
## Ubuntu
### Installation
`sudo apt install nginx`

### Configuration
`/etc/nginx/sites-available`

## Fedora
[Wiki](https://fedoraproject.org/wiki/Nginx)

`sudo dnf install nginx`

## Arch
    sudo pacman -S nginx
    yay nginx
    
# Configuration
## File Locations
`/var/www/html` – Website content as seen by visitors.  
`/etc/nginx` – Location of the main Nginx application files.  
`/etc/nginx/nginx.conf` – The main Nginx configuration file.  
`/etc/nginx/sites-available` – List of all websites configured through Nginx.  
`/etc/nginx/sites-enabled` – List of websites actively being served by Nginx.  
`/var/log/nginx/access.log` – Access logs tracking every request to your server.  
`/var/log/ngins/error.log` – A log of any errors generated in Nginx. 

## Configuration Sample
```
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  root /var/www/my_files;
  index index.html index.htm index.nginx-debian.html;
  server_name _;

  # First attempt to serve request as file, then
  # as directory, then fall back to displaying a 404.
  location / {
    try_files $uri $uri/ =404;
  }
  
  # Setting up a reverse proxy.
  location ^~ /rest/api/2/ {
    proxy_pass https://somewhere-else.com;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```
See: [Full Example Configuration](https://www.nginx.com/resources/wiki/start/topics/examples/full/)

## Verify Configuration
`nginx -t`

# Controlling Service

    sudo nginx -t                         // Check syntax of Nginx configuration file
    sudo systemctl start nginx.service    // Start Nginx as a service
    sudo systemctl stop nginx.service     // Stop Nginx service
    sudo systemctl reload nginx.service   // Reload Nginx service (after configuration changes)
    sudo systemctl restart nginx.service  // Hard restart service
    sudo systemctl enable nginx.service   // Load Nginx service at at startup
    sudo systemctl disable nginx.service  // Do not load Nginx service at startup

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

 
