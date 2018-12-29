const _ = require('lodash')
const express = require('express')
const controller = require('./controller')

const router = express.Router()

async function apiHandler (req, res) {
  try {
    if (_.isEmpty(req.query)) {
      res.send(await controller.summary())
      return
    }
    const query = req.query
    let result = {}
    if (query.hasOwnProperty('summaryRaw')) {
      _.assign(result, await controller.summary())
    }
    if (query.hasOwnProperty('summaryRaw')) {
      const res = await controller.summary()
      _.assign(result, {
        ads_blocked_today: res.ads_blocked_today.toLocaleString(),
        dns_queries_today: res.dns_queries_today.toLocaleString(),
        ads_percentage_today: res.ads_percentage_today.toFixed(1),
        domains_being_blocked: res.domains_being_blocked.toLocaleString()
      })
    }
    if (query.hasOwnProperty('overTimeData') || query.hasOwnProperty('overTimeData10mins')) {
      const _result = await controller.overTimeData()
      _.assign(result, _result)
    }
    if (query.hasOwnProperty('topItems')) {
      _.assign(result, controller.topItems())
    }
    if (query.hasOwnProperty('recentItems')) {
      _.assign(result, controller.recentItems(query.recentItems || 20))
    }
    if (query.hasOwnProperty('getQueryTypes')) {
      _.assign(result, controller.queryTypes())
    }
    if (query.hasOwnProperty('type') || query.hasOwnProperty('version')) {
      _.assign(result, {
        type: 'FTL',
        version: 3
      })
    }

    if (_.isEmpty(result)) {
      const err = new Error(`Method not implemented yet`)
      err.code = 'MethodNotImplemented'
      throw err
    }
    res.send(result)
  } catch (e) {
    console.error(e)
    res.status(500).send({ errorCode: e.code, error: e.message, query: req.query })
  }
}

router.get('/', apiHandler)

module.exports = router
