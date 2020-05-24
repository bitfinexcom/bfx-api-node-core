'use strict'

const setFlagsWS = require('../../ws2/flags/set')

/**
 * Called when flags are updated for a single socket; sets the same flags on
 * all other sockets.
 *
 * @memberof module:bfx-api-node-core
 * @private
 *
 * @param {module:bfx-api-node-core.Manager} m - manager
 * @param {number} wsID - socket ID
 * @param {number} flags - desired flags value
 */
const onSetFlagsEvent = (m, wsID, flags) => {
  m.wsPool.forEach((ws, i) => {
    const { id } = ws

    if (id === wsID) {
      return
    }

    m.wsPool[i] = setFlagsWS(ws, flags, true)
  })
}

module.exports = onSetFlagsEvent
