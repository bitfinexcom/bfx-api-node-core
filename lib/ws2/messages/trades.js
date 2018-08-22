'use strict'

const debug = require('debug')('bfx:api:ws:messages:trades')
const _isArray = require('lodash/isArray')
const { Trade, PublicTrade } = require('bfx-api-node-models')

module.exports = (args = {}) => {
  const { state = {}, msg = [], channel = {}, payload = [] } = args
  const { transform, emit } = state
  const { symbol, pair } = channel
  let data = payload

  if (!_isArray(data)) { // hb/no payload on message
    return null
  } else if (!_isArray(data[0])) { // ensure array of items
    data = [data]
  }

  if (transform) {
    const model = msg[0] === 0 ? Trade : PublicTrade
    data = model.unserialize(data)
  }

  debug('recv trade data on channel %s:%s', symbol, pair)

  emit('data:trades', {
    msg,
    original: payload,
    requested: data,
    chanFilter: {
      symbol,
      pair,
    },
  })

  return null
}
