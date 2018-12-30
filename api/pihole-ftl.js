
const net = require('net')
const _ = require('lodash')
const { parseStringNumber, isInt, isFloat } = require('./utils')

const EOM = '---EOM---'

class PiHoleFTL {
  constructor () {
    this.host = '127.0.0.1'
    this.port = process.env.NODE_ENV === 'test' ? 99999 : 4711

    this.client = null
  }

  async stats () {
    const lines = await this.send('stats')
    const response = {}
    lines.forEach(line => {
      const [key, val] = line
      response[key] = parseStringNumber(val)
    })

    return response
  }

  async overTime () {
    const lines = await this.send('overTime')
    const response = {
      domains_over_time: {},
      ads_over_time: {}
    }
    lines.forEach(line => {
      const [time, domains, ads] = line
      response.domains_over_time[time] = _.toInteger(domains)
      response.ads_over_time[time] = _.toInteger(ads)
    })

    return response
  }

  async getClientNames () {
    const lines = await this.send('client-names')
    const response = {
      clients: []
    }
    lines.forEach(line => {
      const [ name, ip ] = line
      response.clients.push({
        name,
        ip
      })
    })

    return response
  }

  // 'ClientsoverTime'
  async overTimeDataClients () {
    const lines = await this.send('ClientsoverTime')
    const response = {}
    lines.forEach(line => {
      const timestmap = line.shift()
      response[timestmap] = line.map(c => parseFloat(c))
    })

    return { over_time: response }
  }

  // QueryTypesoverTime
  async overTimeDataQueryTypes () {
    const lines = await this.send('QueryTypesoverTime')
    const response = {}
    lines.forEach(line => {
      const timestmap = line.shift()
      response[timestmap] = line.map(c => parseFloat(c))
    })

    return { over_time: response }
  }

  async getQueryTypes () {
    const lines = await this.send('querytypes')
    const response = {}
    lines.forEach(line => {
      const lineParts = line.join(' ').split(': ')
      response[lineParts[0]] = parseFloat(lineParts[1])
    })

    return { querytypes: response }
  }

  async getCacheInfo () {
    const lines = await this.send('cacheinfo')
    const response = {}
    lines.forEach(line => {
      const lineParts = line.join(' ').split(': ')
      response[lineParts[0]] = parseFloat(lineParts[1])
    })

    return { cacheinfo: response }
  }

  async recentBlocked () {
    const lines = await this.send('recentBlocked', rawLines => {
      return _.trim(rawLines.split(/\r?\n/)[0])
    })
    return String(lines)
  }

  async getForwardDestinations (query) {
    const val = query.getForwardDestinations
    const lines = await this.send(val === 'unsorted' ? 'forward-dest unsorted' : 'forward-dest')
    const response = {}
    lines.forEach(line => {
      if (line.length > 3 && line[3].length > 0) {
        response[`${line[3]}|${line[2]}`] = parseFloat(line[1])
      } else {
        response[`${line[2]}`] = parseFloat(line[1])
      }
    })

    return { forward_destinations: response }
  }

  async getForwardDestinationNames () {
    const lines = await this.send('forward-names')
    const response = {}
    lines.forEach(line => {
      if (line.length > 3 && line[3].length > 0) {
        response[`${line[3]}|${line[2]}`] = parseFloat(line[1])
      } else {
        response[`${line[2]}`] = parseFloat(line[1])
      }
    })

    return { forward_destinations: response }
  }

  async topItems (query) {
    const topItems = query.topItems
    const topQueries = {}

    let command = 'top-domains'

    if (topItems === 'audit') {
      command = 'top-domains for audit'
    } else if (isInt(topItems)) {
      command = `top-domains (${topItems})`
    }

    let lines = await this.send(command)
    lines.forEach(line => {
      topQueries[line[2]] = _.toInteger(line[1])
    })

    command = 'top-ads'

    if (topItems === 'audit') {
      command = 'top-ads for audit'
    } else if (isInt(topItems)) {
      command = `top-ads (${topItems})`
    }

    lines = await this.send(command)
    const topAds = {}
    lines.forEach(line => {
      if (line.length > 3) {
        topAds[`${line[2]} ($${line[3]})`] = _.toInteger(line[1])
      } else {
        topAds[line[2]] = _.toInteger(line[1])
      }
    })

    return { top_ads: topAds, top_queries: topQueries }
  }

  async topClients (query) {
    let cmd = 'top-clients'
    const passedInt = query.topClients || query.getQuerySources
    if (isInt(passedInt)) {
      cmd += ` (${parseInt(passedInt)})`
    }
    const lines = await this.send(cmd)
    const response = {}
    lines.forEach(line => {
      if (line.length > 3) {
        response[`${line[2]}|${line[3]}`] = _.toInteger(line[1])
      } else {
        response[line[2]] = _.toInteger(line[1])
      }
    })

    return { top_sources: response }
  }

  async topClientsBlocked (query) {
    let cmd = 'top-clients blocked'
    const passedInt = query.topClientsBlocked
    if (isInt(passedInt)) {
      cmd += ` (${parseInt(passedInt)})`
    }
    const lines = await this.send(cmd)
    const response = {}
    lines.forEach(line => {
      if (line.length > 3) {
        response[`${line[2]}|${line[3]}`] = _.toInteger(line[1])
      } else {
        response[line[2]] = _.toInteger(line[1])
      }
    })

    return { top_sources_blocked: response }
  }

  /**
   *
   * @param {object} query
   * @returns {Promise<{data}>}
   */
  async getAllQueries (query) {
    const baseVal = query.getAllQueries
    let command = 'getallqueries'

    if (isInt(baseVal)) {
      command += ` (${baseVal})`
    }

    let data = await this.send(command)
    data = data.map(d => {
      return d.map(_d => {
        if (isFloat(_d)) {
          return parseFloat(_d)
        }

        if (isInt(_d)) {
          return _.toInteger(_d)
        }

        return _d
      })
    })

    return { data }
  }

  send (command, responseParser) {
    return new Promise((resolve, reject) => {
      let response = ''
      const client = net.connect(this.port, () => { // 'connect' listener
        this.client = client
        this.client.write(`>${command}\r\n`)
      })
      client.on('data', data => {
        response += data.toString()

        if (_.endsWith(_.trim(response), EOM)) {
          // console.log('\nraw response >>>', response, '>>>\n')
          if (responseParser) {
            resolve(responseParser(response))
          } else {
            resolve(PiHoleFTL.parseRawResponse(response))
          }

          client.end()
        }
      })
      client.on('end', () => {
        this.client = null
      })
      client.on('error', reject)
    })
  }
}

PiHoleFTL.parseRawResponse = response => response
  .split(/\r?\n/)
  .filter(l => _.trim(l) && _.trim(l) !== EOM)
  .map(l => l.trim().split(' '))

module.exports = PiHoleFTL
