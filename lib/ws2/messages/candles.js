'use strict'

const debug = require('debug')('bfx:api:ws:messages:candles')
const { Candle } = require('bfx-api-node-models')
const _isArray = require('lodash/isArray')

/**
 * @memberof module:bfx-api-node-core
 * @private
 *
 * @param {object} args - args
 * @returns {module:bfx-api-node-core.SocketState|null} nextState
 */
const onWSCandlesMessage = (args = {}) => {
  const { state = {}, payload = [], channel = {}, msg } = args
  const { transform, emit } = state
  const { key } = channel
  let data = payload

  if (!_isArray(msg[1])) { // hb/no payload on message
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
      key
    }
  })

  return null
}

module.exports = onWSCandlesMessage
