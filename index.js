const dotenvConfig = {
  path: process.env.NODE_ENV === 'development' ? 'development.env' : '.env'
}

require('dotenv').config(dotenvConfig)

const express = require('express')
const compression = require('compression')
const logger = require('morgan')

const app = express()

app.set('port', process.env.PORT || 3000)
app.use(compression())
app.use(logger('dev'))

app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'))
})

module.exports = app
