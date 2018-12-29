
const net = require('net')
const _ = require('lodash')
const { parseStringNumber } = require('./utils')

const EOM = '---EOM---'

class PiHoleFTL {
  constructor () {
    this.host = '127.0.0.1'
    this.port = 4711

    this.client = null
  }

  async stats () {
    const lines = await this.send('stats')
    console.log('stats', lines)
    const response = {}
    lines.forEach(line => {
      const [key, val] = line.trim().split(' ')
      response[key] = parseStringNumber(val)
    })

    return response
  }

  async overTime () {
    const lines = await this.send('overTime')
    console.log('overTime', lines)
    const response = {
      domains_over_time: {},
      ads_over_time: {}
    }
    lines.forEach(line => {
      const [time, domains, ads] = line.trim().split(' ')
      response.domains_over_time[time] = _.toInteger(domains)
      response.ads_over_time[time] = _.toInteger(ads)
    })

    return response
  }

  _parseRawResponse (response) {
    return response.split(/\r?\n/).filter(l => _.trim(l) && _.trim(l) !== EOM)
  }

  send (command) {
    return new Promise((resolve, reject) => {
      let response = ''
      const client = net.connect(this.port, () => { // 'connect' listener
        console.log('client connected')
        this.client = client
        this.client.write(`>${command}\r\n`)
      })
      client.on('data', data => {
        response += data.toString()

        if (_.endsWith(_.trim(response), EOM)) {
          console.log('\nraw response >>>', response, '>>>\n')
          resolve(this._parseRawResponse(response))
          client.end()
        }
      })
      client.on('end', () => {
        console.log('client disconnected')
        this.client = null
      })
      client.on('error', reject)
    })
  }
}

module.exports = PiHoleFTL
