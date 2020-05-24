'use strict'

const debug = require('debug')('bfx:api:ws2:subscribe')
const send = require('./send')

/**
 * Subscribes to the specified channel, buffers if the connection is not open.
 *
 * @memberof module:bfx-api-node-core
 *
 * @param {module:bfx-api-node-core.SocketState} state - socket
 * @param {string} channel - channel type, i.e. 'trades'
 * @param {object} payload - channel filter, i.e. { symbol: '...' }
 * @returns {module:bfx-api-node-core.SocketState} state - original ref
 */
const subscribe = (state = {}, channel, payload = {}) => {
  debug('subscribing to %s: %j', channel, payload)

  send(state, {
    ...payload,
    event: 'subscribe',
    channel
  })

  state.pendingSubscriptions.push([channel, payload])

  return state
}

module.exports = subscribe
