'use strict'

const debug = require('debug')('bfx:api:ws:messages:candles')
const { Candle } = require('bfx-api-node-models')

module.exports = (args = {}) => {
  const { state = {}, payload = [], channel = {} } = args
  const { transform, ev } = state
  const { key } = channel
  let data = payload

  if (transform) {
    data = Candle.unserialize(payload)
  }

  debug('recv candle data on channel %s', key)

  ev.emit('data:candles', {
    original: payload,
    requested: data,
    chanFilter: {
      key,
    },
  })

  return null
}
