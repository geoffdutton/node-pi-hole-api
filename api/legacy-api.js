const _ = require('lodash')
const express = require('express')
const controller = require('./controller')

const router = express.Router()

function summary () {
  return {
    domains_being_blocked: controller.extraVars.gravityCount,
    dns_queries_today: controller.totalQueryCount,
    ads_blocked_today: controller.totalAdsCount,
    ads_percentage_today: controller.totalAdsPercent
  }
}

function apiHandler (req, res) {
  if (_.isEmpty(req.query)) {
    res.send(summary())
    return
  }
  let result = {}
  if (req.query.summaryRaw != null) {
    _.assign(result, summary())
  }
  if (req.query.summary != null) {
    let res = summary()
    _.assign(result, {
      ads_blocked_today: res.ads_blocked_today.toLocaleString(),
      dns_queries_today: res.dns_queries_today.toLocaleString(),
      ads_percentage_today: res.ads_percentage_today.toFixed(1),
      domains_being_blocked: res.domains_being_blocked.toLocaleString()
    })
  }
  if (req.query.overTimeData != null) {
    _.assign(result, controller.overTimeData())
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
}

router.get('/', apiHandler)

module.exports = router
