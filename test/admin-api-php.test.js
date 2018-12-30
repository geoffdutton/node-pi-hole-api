
const request = require('supertest')
const ftlResponses = require('./ftl-responses')
const app = require('../app')
const FTL = require('../api/pihole-ftl')

const base = '/admin/api.php'

describe(base, () => {
  beforeEach(() => {
    FTL.prototype.send = jest.fn((cmd, parser) => {
      let res

      if (ftlResponses.byCommand[cmd]) {
        const _res = ftlResponses.byCommand[cmd]
        res = parser ? parser(_res) : FTL.parseRawResponse(_res)
      } else {
        res = FTL.parseRawResponse(ftlResponses.stats)
      }

      return Promise.resolve(res)
    })
  })

  test('needs to include at least one approved query key', async () => {
    const response = await request(app).get(base + '?somethingNotAllowed')
    expect(response.body).toMatchSnapshot()
    expect(response.body.errorCode).toBe('InvalidMethod')
    expect(response.statusCode).toBe(400)
  })

  test('throws not implemented', async () => {
    const response = await request(app).get(base + '?__testNotImped')
    expect(response.body).toMatchSnapshot()
    expect(response.body.errorCode).toBe('MethodNotImplemented')
    expect(response.statusCode).toBe(500)
  })

  test('no query & ?summary', async () => {
    let response = await request(app).get(base)
    expect(response.statusCode).toBe(200)
    const body = response.body

    response = await request(app).get(base + '?summary')
    expect(response.statusCode).toBe(200)
    expect(body).toEqual(response.body)
    expect(response.body).toMatchSnapshot()
  })

  test('?summaryRaw', async () => {
    const response = await request(app).get(base + '?summaryRaw')
    expect(response.body).toMatchSnapshot()
    expect(response.statusCode).toBe(200)
  })

  test('?getClientNames', async () => {
    const response = await request(app).get(base + '?getClientNames')
    expect(response.body).toMatchSnapshot()
    expect(response.body.clients.length).toBe(5)
    expect(response.statusCode).toBe(200)
  })

  test('?overTimeData & ?overTimeData10mins', async () => {
    let response = await request(app).get(base + '?overTimeData')
    expect(response.statusCode).toBe(200)
    const body = response.body

    response = await request(app).get(base + '?overTimeData10mins')
    expect(response.statusCode).toBe(200)
    expect(body).toEqual(response.body)
    expect(response.body).toMatchSnapshot()
  })

  test('?type & ?version', async () => {
    let response = await request(app).get(base + '?type')
    expect(response.statusCode).toBe(200)
    const body = response.body

    response = await request(app).get(base + '?version')
    expect(response.statusCode).toBe(200)
    expect(body).toEqual(response.body)
    expect(response.body).toMatchSnapshot()
  })

  test('?topItems', async () => {
    const response = await request(app).get(base + '?topItems')
    expect(FTL.prototype.send).toHaveBeenCalledWith('top-ads')
    expect(FTL.prototype.send).toHaveBeenCalledWith('top-domains')
    expect(response.body.top_queries['play.hulu.com']).toBe(568)
    expect(response.body.top_ads['cws-hulu.conviva.com']).toBe(5676)
    expect(response.statusCode).toBe(200)
  })

  test('?topItems audit', async () => {
    const response = await request(app).get(base + '?topItems=audit')
    expect(FTL.prototype.send).toHaveBeenCalledWith('top-ads for audit')
    expect(FTL.prototype.send).toHaveBeenCalledWith('top-domains for audit')
    expect(response.body.top_queries['play.hulu.com']).toBe(568)
    expect(response.body.top_ads['cws-hulu.conviva.com']).toBe(5676)
    expect(response.statusCode).toBe(200)
  })

  test('?topItems 99', async () => {
    const response = await request(app).get(base + '?topItems=99')
    expect(FTL.prototype.send).toHaveBeenCalledWith('top-ads (99)')
    expect(FTL.prototype.send).toHaveBeenCalledWith('top-domains (99)')
    expect(response.body.top_queries['play.hulu.com']).toBe(568)
    expect(response.body.top_ads['cws-hulu.conviva.com']).toBe(5676)
    expect(response.statusCode).toBe(200)
  })

  test('?topClients & wih int', async () => {
    const cmds = ['topClients', 'getQuerySources']
    for (const cmd of cmds) {
      let response = await request(app).get(base + '?' + cmd)
      expect(response.body).toMatchSnapshot()
      expect(FTL.prototype.send).toHaveBeenCalledWith('top-clients')
      expect(response.body.top_sources['104.54.196.251|104-54-196-251.lightspeed.austtx.sbcglobal.net']).toBe(28830)
      const body = response.body

      response = await request(app).get(base + `?${cmd}=33`)
      expect(response.body).toMatchSnapshot()
      expect(body).toEqual(response.body)
      expect(FTL.prototype.send).toHaveBeenCalledWith('top-clients (33)')
    }
  })

  test('?topClientsBlocked & with int', async () => {
    let response = await request(app).get(base + '?topClientsBlocked')
    expect(response.body).toMatchSnapshot()
    expect(FTL.prototype.send).toHaveBeenCalledWith('top-clients blocked')
    expect(response.body.top_sources_blocked['104.54.196.251|104-54-196-251.lightspeed.austtx.sbcglobal.net']).toBe(16479)

    const body = response.body
    response = await request(app).get(base + '?topClientsBlocked=77')
    expect(FTL.prototype.send).toHaveBeenCalledWith('top-clients blocked (77)')
    expect(body).toEqual(response.body)
  })

  test('?getForwardDestinations & with unsorted', async () => {
    let response = await request(app).get(base + '?getForwardDestinations')
    expect(response.body).toMatchSnapshot()
    expect(FTL.prototype.send).toHaveBeenCalledWith('forward-dest')
    expect(response.body.forward_destinations['blocklist|blocklist']).toBe(56.12)

    const body = response.body
    response = await request(app).get(base + '?getForwardDestinations=unsorted')
    expect(FTL.prototype.send).toHaveBeenCalledWith('forward-dest unsorted')
    expect(body).toEqual(response.body)
  })

  test('?getForwardDestinationNames', async () => {
    let response = await request(app).get(base + '?getForwardDestinationNames')
    expect(response.body).toMatchSnapshot()
    expect(FTL.prototype.send).toHaveBeenCalledWith('forward-names')
    expect(response.body.forward_destinations['blocklist|blocklist']).toBe(56.12)
  })

  test('?getQueryTypes', async () => {
    const response = await request(app).get(base + '?getQueryTypes')
    expect(FTL.prototype.send).toHaveBeenCalledWith('querytypes')
    expect(response.body.querytypes['A (IPv4)']).toBe(48.45)
    expect(response.statusCode).toBe(200)
  })

  test('?getCacheInfo', async () => {
    const response = await request(app).get(base + '?getCacheInfo')
    expect(FTL.prototype.send).toHaveBeenCalledWith('cacheinfo')
    expect(response.body.cacheinfo['cache-live-freed']).toBe(0)
    expect(response.statusCode).toBe(200)
  })

  test('?overTimeDataQueryTypes', async () => {
    const response = await request(app).get(base + '?overTimeDataQueryTypes')
    expect(FTL.prototype.send).toHaveBeenCalledWith('QueryTypesoverTime')
    expect(response.body.over_time['1546056300']).toEqual([0, 0])
    expect(response.statusCode).toBe(200)
  })

  test('?overTimeDataClients', async () => {
    const response = await request(app).get(base + '?overTimeDataClients')
    expect(FTL.prototype.send).toHaveBeenCalledWith('ClientsoverTime')
    expect(response.body.over_time['1546056300']).toEqual([215, 3, 0, 0, 0, 0])
    expect(response.statusCode).toBe(200)
  })

  test('?recentBlocked', async () => {
    const response = await request(app).get(base + '?recentBlocked')
    expect(FTL.prototype.send).toHaveBeenCalledWith('recentBlocked', expect.any(Function))
    expect(response.headers['content-type']).toBe('text/plain; charset=utf-8')
    expect(response.statusCode).toBe(200)
    expect(response.text).toBe('vortex.hulu.com')
  })

  test('?getAllQueries', async () => {
    const response = await request(app).get(base + '?getAllQueries')
    expect(FTL.prototype.send).toHaveBeenCalledWith('getallqueries')
    expect(response.statusCode).toBe(200)
    expect(response.body.data[0]).toEqual([
      1546139804,
      'AAAA',
      'browsetech.slack.com',
      '104-54-196-251.lightspeed.austtx.sbcglobal.net',
      2,
      0,
      1,
      19
    ])
  })
})
