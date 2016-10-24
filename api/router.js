const _ = require('lodash')
const express = require('express')
const controller = require('./controller')

const router = express.Router()

function summary (req, res) {
  res.send(controller.summary())
}

function overTimeData (req, res) {
  res.send(controller.overTimeData())
}

function topItems (req, res) {
  res.send(controller.topItems())
}

function recentItems (req, res) {
  res.send(controller.recentItems(req.query.count || 20))
}

function queryTypes (req, res) {
  res.send(controller.queryTypes())
}

function forwardDestinations (req, res) {
  res.send(controller.forwardDestinations())
}

function querySources (req, res) {
  res.send(controller.querySources())
}

function queries (req, res) {
  res.send(controller.queries())
}

function apiHandler (req, res) {
  if (_.isEmpty(req.query)) {
    return summary(req, res)
  }
  let result = {}
  if (req.query.summaryRaw != null) {
    _.assign(result, controller.summary())
  }
  if (req.query.summary != null) {
    let summary = controller.summary()
    _.assign(result, {
      ads_blocked_today: summary.ads_blocked_today.toLocaleString(),
      dns_queries_today: summary.dns_queries_today.toLocaleString(),
      ads_percentage_today: summary.ads_percentage_today.toFixed(1),
      domains_being_blocked: summary.domains_being_blocked.toLocaleString()
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

router.get('/summary', summary)
router.get('/overTimeData', overTimeData)
router.get('/topItems', topItems)
router.get('/recentItems', recentItems)
router.get('/queryTypes', queryTypes)
router.get('/forwardDestinations', forwardDestinations)
router.get('/querySources', querySources)
router.get('/queries', queries)

router.get('/', apiHandler)

module.exports = router
