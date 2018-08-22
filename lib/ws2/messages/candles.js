'use strict'

const debug = require('debug')('bfx:api:ws:messages:candles')
const _isArray = require('lodash/isArray')
const { Candle } = require('bfx-api-node-models')

module.exports = (args = {}) => {
  const { state = {}, payload = [], channel = {}, msg } = args
  const { transform, emit } = state
  const { key } = channel
  let data = payload

  if (!_isArray(data)) { // hb/no payload on message
    return null
  } else if (!_isArray(data[0])) { // ensure array of items
    data = [data]
  }

  if (transform) {
    data = Candle.unserialize(data)
  }

  debug('recv candle data on channel %s', key)

  emit('data:candles', {
    msg,
    original: payload,
    requested: data,
    chanFilter: {
      key,
    },
  })

  return null
}
