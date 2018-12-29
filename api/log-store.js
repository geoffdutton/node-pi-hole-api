const _ = require('lodash')
const split = require('split')
const logReader = require('./log-reader')
const PiHoleFTL = require('./pihole-ftl')

class LogStore {
  constructor (input, extraVars) {
    this.input = input
    this.extraVars = extraVars
    this.ftl = new PiHoleFTL()
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
    this.logs.push({
      date: data.date,
      queryType,
      domain,
      source,
      status: 'Querying'
    })
    if (this.logs.length > this.maxLogLength) {
      this.logs.shift()
    }
  }

  _handleGravity (data) {
    if (
      data.args[0] === 'pi.hole' ||
      data.args[0] === this.extraVars.hostname ||
      data.args[1] === 'pi.hole' ||
      data.args[1] === this.extraVars.hostname
    ) {
      const log = _.findLast(this.logs, { domain: data.args[0], status: 'Querying' })
      if (log) {
        log.status = 'OK'
      }
      return
    }
    this.totalAdsCount++
    this._addOverTimeData(data, this.adsOverTime)
    const domain = data.args[0]
    this.adsCount[domain] = (this.adsCount[domain] | 0) + 1
    const log = _.findLast(this.logs, { domain: domain, status: 'Querying' })
    if (log) {
      log.status = 'Pi-holed'
    }
  }

  _handleForwarded (data) {
    const [domain, dest] = data.args
    this.forwardDest[dest] = (this.forwardDest[dest] | 0) + 1
    const log = _.findLast(this.logs, { domain: domain })
    if (log) {
      log.status = 'OK'
    }
  }

  _handleCached (data) {
    const domain = data.args[0]
    const log = _.findLast(this.logs, { domain: domain })
    if (log) {
      log.status = 'OK'
    }
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

  get totalAdsPercent () {
    let adsPercent = 0
    if (this.totalQueryCount) {
      adsPercent = this.totalAdsCount / this.totalQueryCount * 100
    }
    return adsPercent
  }

  async summary () {
    const data = await this.ftl.stats()
    return data
  }

  _getOverTimeData (arr) {
    return _(arr).takeRight(24).reduce((result, { hour, count }) => {
      result[hour] = count
      return result
    }, {})
  }

  async overTimeData () {
    return this.ftl.overTime()
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
      .takeRight(count)
      .map((data) => ({
        date: data.date.format('YYYY-MM-DD'),
        time: data.date.format('h:m:s a'),
        domain: data.domain,
        ip: data.source
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

  queries () {
    return {
      data: this.logs.map(({ date, queryType, domain, source, status }) => [
        date.format('YYYY-MM-DDTHH:mm:ss'), queryType, domain, source, status
      ])
    }
  }
}

module.exports = LogStore

if (require.main === module) {
  const spawn = require('child_process').spawn
  const ssh = spawn('ssh', ['-t', 'pi@pi.local', 'sudo tail -f -n +0 /var/log/pihole.log'])
  const extraVars = {
    gravityCount: 123,
    hostname: 'pi'
  }

  void new LogStore(ssh.stdout, extraVars)
}
