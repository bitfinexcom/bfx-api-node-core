'use strict'

const sendWS = require('../../ws2/send')

/**
 * Cancels the requested order ID
 *
 * @private
 *
 * @param {Manager} m - manager
 * @param {number} wsID - socket ID
 * @param {number} id - order ID to cancel
 */
const onOrderCancelEvent = (m, wsID, id) => {
  const ws = m.getWS(wsID)

  sendWS(ws, [0, 'oc', null, { id }])
}

module.exports = onOrderCancelEvent
