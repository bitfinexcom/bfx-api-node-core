'use strict'

const sendWS = require('../../ws2/send')

/**
 * Submits the provided order packet
 *
 * @param {Manager} m
 * @param {number} wsID - socket ID
 * @param {object} packet - new order packet
 */
module.exports = (m, wsID, packet) => {
  const ws = m.getWS(wsID)

  sendWS(ws, [0, 'on', null, packet])
}
