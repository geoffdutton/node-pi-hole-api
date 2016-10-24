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

router.get('/', summary)
router.get('/summary', summary)
router.get('/overTimeData', overTimeData)
router.get('/topItems', topItems)
router.get('/recentItems', recentItems)
router.get('/queryTypes', queryTypes)
router.get('/forwardDestinations', forwardDestinations)
router.get('/querySources', querySources)

module.exports = router
