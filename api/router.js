const express = require('express')
const controller = require('./controller')

const router = express.Router()

function getSummary (req, res) {
  res.send(controller.getSummary())
}

router.get('/', getSummary)
router.get('/summary', getSummary)

module.exports = router
