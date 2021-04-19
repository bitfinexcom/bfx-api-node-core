'use strict'

const debug = require('debug')('bfx:api:ws:on_event_message')
const handlers = {
  auth: require('./events/auth'),
  subscribed: require('./events/subscribed'),
  unsubscribed: require('./events/unsubscribed'),
  info: require('./events/info'),
  conf: require('./events/config'),
  error: require('./events/error'),
  pong: require('./events/pong')
}

module.exports = (state = {}, msg = {}, flags) => {
  const func = handlers[msg.event]

  if (!func) {
    debug('recv unknown event: %j', msg)
    return null
  }

  return func(state, msg, flags)
}
