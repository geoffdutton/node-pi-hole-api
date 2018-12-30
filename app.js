
const dotenvConfig = {
  path: process.env.NODE_ENV === 'development' ? 'development.env' : '.env'
}

require('dotenv').config(dotenvConfig)

const express = require('express')
const compression = require('compression')
const logger = require('morgan')
const apiRouter = require('./api/router')
const legacyApi = require('./api/legacy-api')

const app = express()

app.set('port', process.env.PORT || 3000)
app.use(compression())
app.use(logger('dev'))

app.use('/api', apiRouter)
app.use('/admin/api.php', legacyApi)

module.exports = app
