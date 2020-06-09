'use strict'

const send = require('../send')

/**
 * Updates the connection flags
 *
 * @param {SocketState} state - socket
 * @param {number} flags - full flag set
 * @param {boolean} silent - if true, no event is emitted
 * @returns {SocketState} nextState
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
