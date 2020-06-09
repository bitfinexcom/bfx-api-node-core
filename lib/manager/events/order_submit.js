'use strict'

const sendWS = require('../../ws2/send')

/**
 * Submits the provided order packet
 *
 * @private
 *
 * @param {Manager} m - manager
 * @param {number} wsID - socket ID
 * @param {module:bfx-api-node-models.Order~SubmitPayload} packet - new order
 *   packet
 */
const onOrderSubmitEvent = (m, wsID, packet) => {
  const ws = m.getWS(wsID)

  sendWS(ws, [0, 'on', null, packet])
}

module.exports = onOrderSubmitEvent
