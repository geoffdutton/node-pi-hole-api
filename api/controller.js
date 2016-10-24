const childProcess = require('child_process')
const ini = require('ini')
const os = require('os')
const fs = require('fs')

const LogStore = require('./log-store')

const tail = childProcess.spawn('tail', ['-f', '-n', '+1', process.env.PI_HOLE_LOG_PATH])
const setupVars = ini.parse(fs.readFileSync(process.env.PI_HOLE_SETUP_VARS_PATH, 'utf-8'))
const extraVars = {
  hostname: os.hostname(),
  gravityCount: parseInt(childProcess.spawnSync('wc', ['-l', process.env.PI_HOLE_GRAVITY_PATH]).stdout)
}

if (setupVars.IPv6_address) {
  extraVars.gravityCount /= 2
}

const store = new LogStore(tail.stdout, setupVars, extraVars)

module.exports = store
