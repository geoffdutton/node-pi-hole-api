const express = require('express')
const controller = require('./controller')

const router = express.Router()

async function summary (req, res) {
  res.send(await controller.summary())
}

async function overTimeData (req, res) {
  res.send(await controller.overTimeData())
}

function topItems (req, res) {
  res.send(controller.topItems())
}

function queryTypes (req, res) {
  res.send(controller.queryTypes())
}

async function forwardDestinations (req, res) {
  res.send(await controller.forwardDestinations())
}

function querySources (req, res) {
  res.send(controller.querySources())
}

function queries (req, res) {
  res.send(controller.queries())
}

router.get('/summary', summary)
router.get('/overTimeData', overTimeData)
router.get('/topItems', topItems)
router.get('/queryTypes', queryTypes)
router.get('/forwardDestinations', forwardDestinations)
router.get('/querySources', querySources)
router.get('/queries', queries)

module.exports = router
