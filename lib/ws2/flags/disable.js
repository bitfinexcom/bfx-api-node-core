'use strict'

const setFlags = require('./set')

/**
 * Disables a flag; updates the connection flag set
 *
 * @memberof module:bfx-api-node-core
 *
 * @param {module:bfx-api-node-core.SocketState} state - socket
 * @param {number} flag - individual flag to disable
 * @param {boolean} silent - if true, no event is emitted
 * @returns {object} nextState
 */
const disableFlag = (state = {}, flag, silent) => {
  const { flags } = state

  return setFlags(state, flags ^ flag, silent)
}

module.exports = disableFlag
