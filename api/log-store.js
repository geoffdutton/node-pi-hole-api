const _ = require('lodash')
const split = require('split')
const logReader = require('./log-reader')

class LogStore {
  constructor (input, setupVars, extraVars) {
    this.input = input
    this.setupVars = setupVars
    this.extraVars = extraVars
    this.logs = []
    this.maxLogLength = 2000
    this.queryCount = 0
    this.adsCount = 0
    this._start()
  }

  _start () {
    this.input
      .pipe(split())
      .pipe(logReader())
      .on('data', (data) => {
        this.logs.push(data)
        if (this.logs.length > this.maxLogLength) {
          this.logs.shift()
        }
        const fn = this['_handle' + _.capitalize(data.type)]
        if (fn) {
          fn.call(this, data)
        }
      })
      .on('error', (error) => {
        console.error('LogReader: Error', error)
      })
  }

  _handleUnknown (data) {
    console.info('Unknown log entry: ', data.line)
  }

  _handleQuery (data) {
    this.queryCount++
  }

  _handleGravity (data) {
    if (
      data.args[0] === 'pi.hole' ||
      data.args[0] === this.extraVars.hostname ||
      data.args[1] === 'pi.hole' ||
      data.args[1] === this.extraVars.hostname
      ) {
      return
    }
    this.adsCount++
  }

  summary () {
    let adsPercent = 0
    if (this.queryCount) {
      adsPercent = this.adsCount / this.queryCount * 100
    }
    return {
      domains_being_blocked: this.extraVars.gravityCount,
      dns_queries_today: this.queryCount,
      ads_blocked_today: this.adsCount,
      ads_percentage_today: adsPercent
    }
  }
}

module.exports = LogStore

if (require.main === module) {
  const spawn = require('child_process').spawn
  const ssh = spawn('ssh', ['-t', 'pi@pi.local', 'sudo tail -f -n +0 /var/log/pihole.log'])
  const setupVars = {
    piholeInterface: 'eth0',
    IPv4_address: '192.168.1.10/24',
    IPv6_address: 'fe80::6ff8:2c35:da5f:4fc6',
    piholeDNS1: '8.8.8.8',
    piholeDNS2: '8.8.4.4'
  }
  const extraVars = {
    gravityCount: 123,
    hostname: 'pi'
  }

  void new LogStore(ssh.stdout, setupVars, extraVars)
}
