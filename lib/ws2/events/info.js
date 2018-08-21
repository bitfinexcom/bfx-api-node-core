'use strict'

const debug = require('debug')('bfx:api:ws:events:info')

/**
 * Emits an error if the server reports an incompatible API version. Does not
 * mutate state.
 *
 * @param {Object} state
 * @param {Object} msg
 * @param {number} msg.version - must be 2
 * @return {null} nextState
 */
module.exports = (state = {}, msg = {}) => {
  const { version } = msg
  const { ev, ws } = state

  ev.emit('event:info', msg)

  if (!version) {
    return null
  }

  if (version !== 2) {
    const err = new Error(`server not running API v2: v${version}`)

    ev.emit('error', err)
    ws.close()
    return null
  }

  const { status } = msg.platform || {}

  debug(
    'server running API v2 (platform: %s (%d))',
    status === 0 ? 'under maintenance' : 'operating normally', status
  )

  return null
}
