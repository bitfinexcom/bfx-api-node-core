'use strict'

const setFlags = require('./set')

/**
 * Enables a flag; updates the connection flag set
 *
 * @param {object} state
 * @param {number} flag - individual flag to enable
 * @param {boolean} silent - if true, no event is emitted
 * @returns {object} nextState
 */
const enableFlag = (state = {}, flag, silent) => {
  const { flags } = state
  const nextFlags = flags | flag

  return setFlags(state, nextFlags, silent)
}

module.exports = enableFlag
