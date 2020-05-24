'use strict'

const setFlags = require('./set')

/**
 * Enables a flag; updates the connection flag set
 *
 * @memberof module:bfx-api-node-core
 *
 * @param {module:bfx-api-node-core.SocketState} state - socket
 * @param {number} flag - individual flag to enable
 * @param {boolean} silent - if true, no event is emitted
 * @returns {module:bfx-api-node-core.SocketState} nextState
 */
const enableFlag = (state = {}, flag, silent) => {
  const { flags } = state
  const nextFlags = flags | flag

  return setFlags(state, nextFlags, silent)
}

module.exports = enableFlag
