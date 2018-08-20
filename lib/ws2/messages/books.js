'use strict'

const debug = require('debug')('bfx:api:ws:messages:books')
const { OrderBook } = require('bfx-api-node-models')

module.exports = (args = {}) => {
  const { state = {}, channel = {}, payload = [] } = args
  const { transform, ev } = state
  const { symbol, prec, len } = channel
  let data = payload

  if (transform) {
    data = new OrderBook((Array.isArray(data[0]) ? data : [data]), raw)
  }

  debug('recv book data on channel %s:%s:%d', symbol, prec, len)

  ev.emit('data:book', {
    original: payload,
    requested: data,
    chanFilter: {
      symbol,
      prec,
      len,
    },
  })

  return null
}
