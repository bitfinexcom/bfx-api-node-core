'use strict'

const send = require('../send')

/**
 * Updates the connections flags
 *
 * @memberof module:bfx-api-node-core
 *
 * @param {module:bfx-api-node-core.SocketState} state - socket
 * @param {number} flags - full flag set
 * @param {boolean} silent - if true, no event is emitted
 * @returns {object} nextState
 */
const setFlags = (state = {}, flags, silent) => {
  const { ev } = state

  send(state, { event: 'conf', flags })

  if (!silent) {
    ev.emit('exec:flags:set', flags)
  }

  return {
    ...state,
    flags
  }
}

module.exports = setFlags
