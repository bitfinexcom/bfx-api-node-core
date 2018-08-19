'use strict'

const debug = require('debug')('bfx:api:ws:messages:candles')
const _isArray = require('lodash/isArray')
const { Candle } = require('bfx-api-node-models')
const msgPayload = require('../../util/msg_payload')

module.exports = (state = {}, msg = [], chanData = {}) => {
  const { transform, ev } = state
  let payload = msgPayload(msg)

  if (!_isArray(payload[0])) { // ensure array
    payload = [payload]
  }

  let data = payload

  if (transform) {
    data = Candle.unserialize(payload)
  }

  ev.emit('data:candles', {
    original: payload,
    requested: data,
    chanData,
  })

  return null
}
