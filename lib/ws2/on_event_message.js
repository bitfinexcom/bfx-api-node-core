'use strict'

const debug = require('debug')('bfx:api:ws:on_event_message')
const handlers = {
  auth: require('./events/auth'),
  subscribed: require('./events/subscribed'),
  unsubscribed: require('./events/unsubscribed'),
  info: require('./events/info'),
  conf: require('./events/config'),
  error: require('./events/error')
}

/**
 * @private
 *
 * @param {SocketState} state - socket
 * @param {object} msg - incoming message
 * @param {number} flags - active connection flags
 * @returns {SocketState} nextState
 */
const onEventMessage = (state = {}, msg = {}, flags) => {
  const func = handlers[msg.event]

  if (!func) {
    debug('recv unknown event: %j', msg)
    return null
  }

  return func(state, msg, flags)
}

module.exports = onEventMessage
