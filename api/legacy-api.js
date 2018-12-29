const _ = require('lodash')
const express = require('express')
const controller = require('./controller')

const router = express.Router()

async function summary () {
  return {
    domains_being_blocked: controller.extraVars.gravityCount,
    dns_queries_today: controller.totalQueryCount,
    ads_blocked_today: controller.totalAdsCount,
    ads_percentage_today: controller.totalAdsPercent
  }
}

async function apiHandler (req, res) {
  try {
    if (_.isEmpty(req.query)) {
      res.send(await controller.summary())
      return
    }
    let result = {}
    if (req.query.summaryRaw != null) {
      _.assign(result, await controller.summary())
    }
    if (req.query.summary != null) {
      let res = await controller.summary()
      _.assign(result, {
        ads_blocked_today: res.ads_blocked_today.toLocaleString(),
        dns_queries_today: res.dns_queries_today.toLocaleString(),
        ads_percentage_today: res.ads_percentage_today.toFixed(1),
        domains_being_blocked: res.domains_being_blocked.toLocaleString()
      })
    }
    if (req.query.overTimeData != null || req.query.overTimeData10mins != null) {
      const _result = await controller.overTimeData()
      _.assign(result, _result)
    }
    if (req.query.topItems != null) {
      _.assign(result, controller.topItems())
    }
    if (req.query.recentItems != null) {
      _.assign(result, controller.recentItems(req.query.recentItems || 20))
    }
    if (req.query.getQueryTypes != null) {
      _.assign(result, controller.queryTypes())
    }
    if (req.query.getForwardDestinations != null) {
      _.assign(result, controller.forwardDestinations())
    }
    if (req.query.getQuerySources != null) {
      _.assign(result, controller.querySources())
    }
    if (req.query.getAllQueries != null) {
      _.assign(result, controller.queries())
    }
    res.send(result)
  } catch (e) {
    console.error(e)
    res.status(500).send(e)
  }
}

router.get('/', apiHandler)

module.exports = router
