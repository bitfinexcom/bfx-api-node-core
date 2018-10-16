'use strict'

const send = require('../send')

/**
 * @param {Object} state
 * @param {number} flags - full flag set
 * @param {boolean} silent - if true, no event is emitted
 * @return {Object} nextState
 */
module.exports = (state = {}, flags, silent) => {
  const { ev } = state
  const nextState = send(state, {
    event: 'conf',
    flags
  })

  if (!silent) {
    ev.emit('exec:flags:set', flags)
  }

  return {
    ...nextState,
    flags
  }
}
