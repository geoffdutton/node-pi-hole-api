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

router.get('/', summary)
router.get('/summary', summary)
router.get('/overTimeData', overTimeData)
router.get('/topItems', topItems)

module.exports = router
