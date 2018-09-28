'use strict'

const debug = require('debug')('bfx:api:ws:events:auth')

/**
 * Initializes the auth channel (0) in the chan map on success, and sets the
 * authenticated flag. Returns null on error
 *
 * Emits with packet:
 *   - auth
 *   - auth:success
 *   - auth:error
 *
 * @param {Object} state
 * @param {Object} packet
 * @param {string} packet.msg
 * @param {string} packet.status
 * @return {Object|null} nextState
 */
module.exports = (state = {}, packet = {}) => {
  const { channels, emit } = state
  const { chanId, msg = '', status = '' } = packet

  emit('event:auth', packet)

  if (status !== 'OK') {
    const err = new Error(`auth failed: ${msg} (${status})`)

    debug('auth failed: %s', err.message)
    emit('event:auth:error', packet)

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
