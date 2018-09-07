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
  const { emit } = state
  const { status, flags } = msg

  emit('event:config', msg)

  if (status !== 'OK') {
    const err = new Error(`config failed (${status}) for flags ${flags}`)

    debug('config failed: %s', err.message)
    emit('error', err)
    return null
  }

  debug('updated config: %s', `0b${Number(flags).toString(2)}`)

  return {
    ...state,
    flags
  }
}
