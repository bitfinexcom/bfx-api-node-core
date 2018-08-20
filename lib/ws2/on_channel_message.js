'use strict'

const debug = require('debug')('bfx:api:ws2:on_channel_message')
const _isArray = require('lodash/isArray')
const msgPayload = require('../util/msg_payload')

const handlers = {
  'auth': require('./messages/auth'),
  'book': require('./messages/books'),
  'candles': require('./messages/candles'),
  'ticker': require('./messages/tickers'),
  'trades': require('./messages/trades'),
}

module.exports = (state = {}, msg) => {
  const { ev, channels = {} } = state
  const [ chanId ] = msg
  const channel = channels[chanId]

  if (!channel) {
    debug('recv msg from unknown channel %d: %j', chanId, msg)
    return null
  }

  const type = channel.channel
  const func = handlers[type]
  let payload = msgPayload(msg)

  if (!func) { // fallback handler
    ev.emit(type, msg)
    return null
  }

  return func({
    payload,
    channel,
    state,
    msg,
  })
}
