'use strict'

const debug = require('debug')('bfx:api:ws:on_channel_message')
const msgPayload = require('../util/msg_payload')

const handlers = {
  'auth': require('./messages/auth'),
  'book': require('./messages/books'),
  'candles': require('./messages/candles'),
  'ticker': require('./messages/tickers'),
  'trades': require('./messages/trades')
}

module.exports = (state = {}, msg) => {
  const { emit, channels = {} } = state
  const [ chanId, hb ] = msg
  const channel = channels[chanId]

  if (hb === 'hb') {
    return null
  }

  if (!channel) {
    debug('recv msg from unknown channel %d: %j', chanId, msg)
    return null
  }

  const type = channel.channel
  const func = handlers[type]
  let payload = msgPayload(msg)

  debug('recv msg on %d [%s]: %j', chanId, type, msg)

  if (!func) { // fallback handler
    emit(type, msg)
    return null
  }

  return func({
    payload,
    channel,
    state,
    msg
  })
}
