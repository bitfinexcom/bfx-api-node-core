'use strict'

const sendWS = require('../../ws2/send')

/**
 * Cancels the requested order ID
 *
 * @param {Manager} m
 * @param {number} wsID - socket ID
 * @param {number} id - order ID to cancel
 */
module.exports = (m, wsID, id) => {
  const ws = m.getWS(wsID)

  sendWS(ws, [0, 'oc', null, { id }])
}
