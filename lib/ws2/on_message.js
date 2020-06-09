'use strict'

const debug = require('debug')('bfx:api:ws2:on_message')
const _isArray = require('lodash/isArray')
const _isObject = require('lodash/isObject')
const onChannelMessage = require('./on_channel_message')
const onEventMessage = require('./on_event_message')

/**
 * @private
 *
 * @param {SocketState} state - socket
 * @param {Array|object} msg - incoming message
 * @param {number} flags - active connection flags
 * @returns {SocketState|null} nextState
 */
const onMessage = (state = {}, msg, flags) => {
  if (_isArray(msg)) {
    return onChannelMessage(state, msg, flags)
  } else if (_isObject(msg) && msg.event) {
    return onEventMessage(state, msg, flags)
  }

  debug('recv unidentified message: %j', msg)
  return null
}

module.exports = onMessage
