# pi-hole-api

[Pi-hole](https://github.com/pi-hole/pi-hole) API server written with Node.JS

# Install

- Install NodeJS v6
  - https://github.com/sdesalas/node-pi-zero

- `git clone git@github.com:xlc/pi-hole-api.git`
- `cd pi-hole-api`
- `npm install --production`
    - or use `yarn` becuase it is much faster
- `npm start`
- A local server will be started on port 3000
  - `curl http://localhost:3000/admin/api.php?summary` to get summary

# Integrate with existing pi-hole admin panel

Follow [this guide](https://github.com/pi-hole/pi-hole/wiki/Nginx-configuration-instead-of-the-default-lighttpd-and-php-cgi-option) to setup nginx server
and use this nginx config in order to proxy requests to `/admin/api.php` to our node server

```
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  root /var/www/html;
  index index.html index.htm index.php;
  server_name _;
  autoindex off;
  location / {
    expires max;
    return 204 'pixel';
  }
  location /admin {
    root   /var/www/html;
    index index.php;
    auth_basic "Restricted"; #For Basic Auth
    auth_basic_user_file /etc/nginx/.htpasswd;  #For Basic Auth
  }
    location /api {
    proxy_pass http://localhost:3000;
  }

  location = /admin/api.php {
    proxy_pass http://localhost:3000;
  }

  location ~ \.php$ {
    include snippets/fastcgi-php.conf;
    fastcgi_pass unix:/var/run/php5-fpm.sock;
  }
}
```

# Why

The existing php API server is super inefficient that is unusable on my Raspberry Pi Model A.
Therefore I want a faster working replacement of the API server.
