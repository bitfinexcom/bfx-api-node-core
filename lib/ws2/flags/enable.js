'use strict'

const setFlags = require('./set')

/**
 * Enables a flag; updates the connection flag set
 *
 * @param {Object} state
 * @param {number} flag - individual flag to enable
 * @param {boolean} silent - if true, no event is emitted
 * @return {Object} nextState
 */
module.exports = (state = {}, flag, silent) => {
  const { flags } = state
  const nextFlags = flags | flag

  return setFlags(state, nextFlags, silent)
}
