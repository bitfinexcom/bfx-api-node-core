'use strict'

const setFlagsWS = require('../../ws2/flags/set')

/**
 * Called when flags are updated for a single socket; sets the same flags on
 * all other sockets.
 *
 * @param {Manager} m
 * @param {number} wsID
 * @param {number} flags
 */
module.exports = (m, wsID, flags) => {
  m.wsPool.forEach((ws, i) => {
    const { id } = ws

    if (id === wsID) {
      return
    }

    m.wsPool[i] = setFlagsWS(ws, flags, true)
  })
}
