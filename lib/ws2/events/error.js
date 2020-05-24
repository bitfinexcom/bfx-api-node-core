'use strict'

const debug = require('debug')('bfx:api:ws:events:error')

/**
 * Logs the error
 *
 * Emits:
 *   * event:error
 *   * error
 *
 * @memberof module:bfx-api-node-core
 * @private
 *
 * @param {module:bfx-api-node-core.SocketState} state - socket
 * @param {object} error - error
 * @returns {null} nextState
 */
const onWSErrorEvent = (state = {}, error) => {
  const { emit } = state

  debug('%j', error)
  emit('event:error', error)
  emit('error', error)

  return null
}

module.exports = onWSErrorEvent
