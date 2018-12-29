
const net = require('net')
const _ = require('lodash')
const { parseStringNumber, isInt } = require('./utils')

const EOM = '---EOM---'

class PiHoleFTL {
  constructor () {
    this.host = '127.0.0.1'
    this.port = 4711

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

  _parseRawResponse (response) {
    return response.split(/\r?\n/)
      .filter(l => _.trim(l) && _.trim(l) !== EOM)
      .map(l => l.trim().split(' '))
  }

  async getClientNames () {
    const lines = await this.send('client-names')
    const response = {
      clients: [],
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
  async clientsOverTime () {
    const lines = await this.send('ClientsoverTime')
    const response = {}
    lines.forEach(line => {
      const timestmap = line.shift()
      response[timestmap] = line.map(c => parseFloat(c))
    })

    return { over_time: response }
  }

  async getForwardDestinations (val) {
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

    return { data: await this.send(command) }
  }

  send (command) {
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
          resolve(this._parseRawResponse(response))
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

module.exports = PiHoleFTL
