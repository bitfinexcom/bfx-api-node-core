'use strict'

const debug = require('debug')('bfx:api:ws:messages:trades')
const _isArray = require('lodash/isArray')
const { Trade, PublicTrade } = require('bfx-api-node-models')
const msgPayload = require('../../util/msg_payload')

module.exports = (state = {}, msg = [], chanData = {}) => {
  const { transform, ev } = state
  let payload = msgPayload(msg)

  if (!_isArray(payload[0])) { // ensure array of trades
    payload = [payload]
  }

  let data = payload

  // auth trades have more data
  if (transform) {
    const model = msg[0] === 0 ? Trade : PublicTrade
    data = model.unserialize(payload)
  }

  ev.emit('data:trades', {
    original: payload,
    requested: data,
    chanData,
  })

  return null
}
