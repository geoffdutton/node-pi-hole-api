# node-pi-hole-api
[![Build Status](https://travis-ci.org/geoffdutton/node-pi-hole-api.svg?branch=develop)](https://travis-ci.org/geoffdutton/node-pi-hole-api)
[![Coverage Status](https://coveralls.io/repos/github/geoffdutton/node-pi-hole-api/badge.svg?branch=develop)](https://coveralls.io/github/geoffdutton/node-pi-hole-api?branch=develop)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

[![Dependencies](https://david-dm.org/geoffdutton/node-pi-hole-api.svg)](https://david-dm.org/geoffdutton/node-pi-hole-api)

[Pi-hole](https://github.com/pi-hole/pi-hole) An updated API server written with Node.JS

## Install

- Install Node 8+
  - https://github.com/creationix/nvm

- `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash`
- `nvm install 8`
- `npm install --production`
    - or use `yarn` becuase it is much faster
- `npm start`
- A local server will be started on port 3000
  - `curl http://localhost:3000/admin/api.php?summary` to get summary

## Integrate with existing pi-hole admin panel

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

## Why

I wanted to take a crack at porting the pi-hole PHP server side code to Node JS.
Major credit goes to: [xlc/pi-hole-api](https://github.com/xlc/pi-hole-api). This is an updated version of that.

## Development Tips

If you have the `pihole-FTL` service running on your Raspberry-PI, you can forward that port via SSH:
```bash
ssh -L 4711:localhost:4711 user@ssh-host
```

