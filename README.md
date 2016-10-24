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


# Why

The existing php API server is super inefficient that is unusable on my Raspberry Pi Model A.
Therefore I want a faster working replacement of the API server.
