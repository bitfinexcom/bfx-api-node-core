'use strict'

const debug = require('debug')('bfx:api:ws:events:auth')

/**
 * Initializes the auth channel (0) in the chan map on success, and sets the
 * authenticated flag. Returns null on error
 *
 * Emits with packet:
 *   * auth - on all auth events
 *   * auth:success - on successful authentication
 *   * auth:error - on auth error
 *   * error - on auth error
 *
 * @memberof module:bfx-api-node-core
 * @private
 *
 * @param {module:bfx-api-node-core.SocketState} state - socket
 * @param {object} packet - incoming packet
 * @param {string} packet.msg - authentication message
 * @param {string} packet.status - authentication status
 * @returns {object|null} nextState
 */
const onWSAuthEvent = (state = {}, packet = {}) => {
  const { channels, emit } = state
  const { chanId, msg = '', status = '' } = packet

  emit('event:auth', packet)

  if (status !== 'OK') {
    const err = new Error(`auth failed: ${msg} (${status})`)
    debug('auth failed: %s', err.message)

    emit('event:auth:error', packet)
    emit('error', err)

    return null
  }

  debug('auth success: %s', status)
  emit('event:auth:success', packet)

  return {
    ...state,
    authenticated: true,
    channels: {
      ...channels,
      [chanId]: {
        channel: 'auth'
      }
    }
  }
}

module.exports = onWSAuthEvent
