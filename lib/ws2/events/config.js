'use strict'

const debug = require('debug')('bfx:api:ws:events:config')

/**
 * Updates the internal config flags, or logs the returned error
 *
 * @param {Object} state
 * @param {Object} msg
 * @return {null} nextState
 */
module.exports = (state = {}, msg = {}) => {
  const { ev } = state
  const { status, flags } = msg

  ev.emit('config', msg)

  if (status !== 'OK') {
    const err = new Error(`config failed (${status}) for flags ${flags}`)

    debug('config failed: %s', err.message)
    ev.emit('error', err)
    return null
  }

  return {
    ...state,
    flags
  }
}
