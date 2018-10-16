'use strict'

const debug = require('debug')('bfx:api:ws:events:error')

/**
 * Logs the error
 *
 * Emits:
 *   * event:error
 *   * error
 *
 * @param {Object} state
 * @param {Object} error
 * @return {null} nextState
 */
module.exports = (state = {}, msg = {}) => {
  const { emit } = state

  debug('%j', msg)
  emit('event:error', msg)

  return null
}
