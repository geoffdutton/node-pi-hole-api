const _ = require('lodash')
const express = require('express')
const controller = require('./controller')
const TESTING = process.env.NODE_ENV === 'test'

const WHITELIST_PARAM_KEYS = [
  'getAllQueries',
  'getCacheInfo',
  'getClientNames',
  'getForwardDestinationNames',
  'getForwardDestinations',
  'getQuerySources',
  'getQueryTypes',
  'overTimeData',
  'overTimeData10mins',
  'overTimeDataClients',
  'overTimeDataQueryTypes',
  'recentBlocked',
  'summary',
  'summaryRaw',
  'topClients',
  'topClientsBlocked',
  'topItems',
  'type',
  'version'
]

if (TESTING) {
  WHITELIST_PARAM_KEYS.push('__testNotImped')
}

const router = express.Router()

async function apiHandler (req, res) {
  try {
    if (_.isEmpty(req.query)) {
      res.send(await controller.summary())
      return
    }
    const query = req.query
    const queryKeys = Object.keys(query)

    let result = {}

    if (query.hasOwnProperty('overTimeData') || query.hasOwnProperty('overTimeData10mins')) {
      const _result = await controller.overTimeData()
      _.assign(result, _result)
    }

    if (query.hasOwnProperty('type') || query.hasOwnProperty('version')) {
      _.assign(result, {
        type: 'FTL',
        version: 3
      })
    }

    const paramKeys = Object.keys(query)
    for (const paramKey of paramKeys) {
      if (WHITELIST_PARAM_KEYS.indexOf(paramKey) === -1) {
        continue
      }

      let _result
      if (typeof controller[paramKey] === 'function') {
        _result = await controller[paramKey](query)
      } else if (typeof controller.ftl[paramKey] === 'function') {
        _result = await controller.ftl[paramKey](query)
      }

      if (_result) {
        if (typeof _result === 'string') {
          result = _result
        } else {
          _.assign(result, _result)
        }
      }
    }

    if (_.isEmpty(result)) {
      const isInvalid = _.intersection(WHITELIST_PARAM_KEYS, queryKeys).length === 0

      const err = new Error(isInvalid ? 'Invalid Method Passed' : `Method not implemented yet`)
      err.code = isInvalid ? 'InvalidMethod' : 'MethodNotImplemented'
      res.status(isInvalid ? 400 : 500)
      throw err
    }

    if (typeof result === 'string') {
      res.type('.txt')
    }
    res.send(result)
  } catch (e) {
    if (!TESTING) {
      console.error(e)
    }

    res.send({ errorCode: e.code, error: e.message, query: req.query })
  }
}

router.get('/', apiHandler)

module.exports = router
