'use strict'

const debug = require('debug')('bfx:api:ws:events:info')
const _isFinite = require('lodash/isFinite')
const Config = require('../../config')

/**
 * Emits an error if the server reports an incompatible API version. Does not
 * mutate state.
 *
 * Events:
 *   * error - on API server version miss-match
 *   * event:info - on all packets
 *   * event:info:server-restart
 *   * event:info:maintenance-start
 *   * event:info:maintenance-end
 *
 * @memberof module:bfx-api-node-core
 * @private
 *
 * @param {module:bfx-api-node-core.SocketState} state - socket
 * @param {object} msg - incoming message
 * @param {number} msg.version - must be 2
 * @returns {null} nextState
 */
const onWSInfoEvent = (state = {}, msg = {}) => {
  const { version, code, platform } = msg
  const { emit, ws } = state

  emit('event:info', msg)

  if (_isFinite(version) && version !== 2) {
    const err = new Error(`server not running API v2: v${version}`)

    emit('error', err)
    ws.close()
    return null
  }

  if (platform) {
    const { status } = platform

    debug(
      'server running API v2 (platform: %s (%d))',
      status === 0 ? 'under maintenance' : 'operating normally', status
    )
  }

  if (_isFinite(code)) {
    if (code === Config.INFO_CODES.SERVER_RESTART) {
      debug('server restarted')
      emit('event:info:server-restart', msg)
    } else if (code === Config.INFO_CODES.MAINTENANCE_START) {
      debug('maintenance period started')
      emit('event:info:maintenance-start', msg)
    } else if (code === Config.INFO_CODES.MAINTENANCE_END) {
      debug('maintenance period ended')
      emit('event:info:maintenance-end', msg)
    }
  }

  return null
}

module.exports = onWSInfoEvent
