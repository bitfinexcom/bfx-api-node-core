'use strict'

const debug = require('debug')('bfx:api:ws:messages:books')
const { OrderBook } = require('bfx-api-node-models')
const _isArray = require('lodash/isArray')

/**
 * @memberof module:bfx-api-node-core
 * @private
 *
 * @param {object} args - args
 * @returns {module:bfx-api-node-core.SocketState|null} nextState
 */
const onWSBookMessage = (args = {}) => {
  const { state = {}, channel = {}, payload = [], msg } = args
  const { transform, emit } = state
  const { symbol, pair, prec, len, freq } = channel
  const [, type] = msg
  const raw = prec === 'R0'
  let data = payload

  const chanFilter = {}
  if (symbol) chanFilter.symbol = symbol
  if (pair) chanFilter.pair = pair
  if (prec) chanFilter.prec = prec
  if (freq) chanFilter.freq = freq
  if (len) chanFilter.len = len

  debug('%j', msg)

  if (type === 'cs') { // forward checksum along
    emit('data:book:cs', {
      msg,
      original: msg[2],
      requested: msg[2],
      chanFilter
    })

    return null
  }

  if (!_isArray(msg[1])) { // hb/no payload on message
    return null
  } else if (!_isArray(data[0])) { // ensure array of items
    data = [data]
  }

  if (transform) {
    data = new OrderBook((Array.isArray(data[0]) ? data : [data]), raw)
  }

  debug(
    'recv book data on channel %s:%s:%s:%d %s',
    symbol, prec, freq, len, pair || ''
  )

  emit('data:book', {
    msg,
    original: payload,
    requested: data,
    chanFilter
  })

  return null
}

module.exports = onWSBookMessage
