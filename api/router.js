const express = require('express')
const controller = require('./controller')

const router = express.Router()

function getSummary (req, res) {
  res.send(controller.getSummary())
}

function overTimeData (req, res) {
  res.send(controller.getOverTimeData())
}

router.get('/', getSummary)
router.get('/summary', getSummary)
router.get('/overTimeData', overTimeData)

module.exports = router
