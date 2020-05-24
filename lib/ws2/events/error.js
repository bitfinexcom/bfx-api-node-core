'use strict'

const debug = require('debug')('bfx:api:ws:events:error')

/**
 * Logs the error
 *
 * Emits:
 *   * event:error
 *   * error
 *
 * @param {object} state
 * @param {object} error
 * @returns {null} nextState
 */
module.exports = (state = {}, error) => {
  const { emit } = state

  debug('%j', error)
  emit('event:error', error)
  emit('error', error)

  return null
}
