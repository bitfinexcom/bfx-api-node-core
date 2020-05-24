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
 * @memberof module:bfx-api-node-core
 * @private
 *
 * @param {module:bfx-api-node-core.SocketState} state - socket
 * @param {object} msg - incoming message
 * @param {number} flags - active connection flags
 * @returns {module:bfx-api-node-core.SocketState} nextState
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
