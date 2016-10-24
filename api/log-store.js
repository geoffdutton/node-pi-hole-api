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
    this.totalQueryCount = 0
    this.totalAdsCount = 0
    this.domainsOverTime = []
    this.adsOverTime = []
    this.domainsCount = {}
    this.adsCount = {}
    this.queryTypesCount = {}
    this.forwardDest = {}
    this.querySourcCount = {}
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
    this.totalQueryCount++
    this._addOverTimeData(data, this.domainsOverTime)
    const [queryType, domain, source] = data.args
    this.domainsCount[domain] = (this.domainsCount[domain] | 0) + 1
    this.queryTypesCount[queryType] = (this.queryTypesCount[queryType] | 0) + 1
    this.querySourcCount[source] = (this.querySourcCount[source] | 0) + 1
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
    this.totalAdsCount++
    this._addOverTimeData(data, this.adsOverTime)
    const domain = data.args[0]
    this.adsCount[domain] = (this.adsCount[domain] | 0) + 1
  }

  _handleForwarded (data) {
    const dest = data.args[1]
    this.forwardDest[dest] = (this.forwardDest[dest] | 0) + 1
  }

  _addOverTimeData (data, arr) {
    const datetime = data.date.format('YYMMDDHH')
    const last = _.last(arr)
    if (last && last.datetime === datetime) {
      last.count++
    } else {
      arr.push({
        datetime,
        hour: data.date.hour(),
        count: 1
      })
    }
  }

  summary () {
    let adsPercent = 0
    if (this.queryCount) {
      adsPercent = this.adsCount / this.queryCount * 100
    }
    return {
      domains_being_blocked: this.extraVars.gravityCount,
      dns_queries_today: this.totalQueryCount,
      ads_blocked_today: this.totalAdsCount,
      ads_percentage_today: adsPercent
    }
  }

  _getOverTimeData (arr) {
    return _(arr).takeRight(24).reduce((result, {hour, count}) => {
      result[hour] = count
      return result
    }, {})
  }

  overTimeData () {
    return {
      domains_over_time: this._getOverTimeData(this.domainsOverTime),
      ads_over_time: this._getOverTimeData(this.adsOverTime)
    }
  }

  _getTopItems (counts) {
    return _(counts).toPairs().orderBy('1', 'desc').take(10).fromPairs()
  }

  topItems () {
    return {
      top_queries: this._getTopItems(this.domainsCount),
      top_ads: this._getTopItems(this.adsCount)
    }
  }

  recentItems (count) {
    const queries = _(this.logs)
        .filter({type: 'query'})
        .takeRight(count)
        .map((data) => ({
          date: data.date.format('YYYY-MM-DD'),
          time: data.date.format('h:m:s a'),
          domain: data.args[1],
          ip: data.args[2]
        }))
        .value()
    return {
      recent_queries: queries
    }
  }

  queryTypes () {
    return _.mapKeys(this.queryTypesCount, (val, key) => `query[${key}]`)
  }

  forwardDestinations () {
    return this.forwardDest
  }

  querySources () {
    return {
      top_sources: this._getTopItems(this.querySourcCount)
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
