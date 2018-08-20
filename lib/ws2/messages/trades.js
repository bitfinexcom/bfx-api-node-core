'use strict'

const debug = require('debug')('bfx:api:ws:messages:trades')
const { Trade, PublicTrade } = require('bfx-api-node-models')

module.exports = (args = {}) => {
  const { state = {}, msg = [], channel = {}, payload = [] } = args
  const { transform, ev } = state
  const { symbol, pair } = channel
  let data = payload

  if (transform) {
    const model = msg[0] === 0 ? Trade : PublicTrade
    data = model.unserialize(payload)
  }

  debug('recv trade data on channel %s:%s', symbol, pair)

  ev.emit('data:trades', {
    original: payload,
    requested: data,
    chanFilter: {
      symbol,
      pair,
    },
  })

  return null
}
