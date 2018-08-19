'use strict'

const debug = require('debug')('bfx:api:ws:events:error')

/**
 * Logs the error
 *
 * @param {Object} state
 * @param {Object} msg
 * @return {null} nextState
 */
module.exports = (state = {}, msg = {}) => {
  const { ev } = state

  debug('error: %j', msg)
  ev.emit('error', msg)

  return null
}
