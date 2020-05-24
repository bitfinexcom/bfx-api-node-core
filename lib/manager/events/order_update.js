'use strict'

const sendWS = require('../../ws2/send')

/**
 * Submits the provided order changeset
 *
 * @memberof module:bfx-api-node-core
 * @private
 *
 * @param {module:bfx-api-node-core.Manager} m - manager
 * @param {number} wsID - socket ID
 * @param {object} changes - order changeset
 */
const onOrderUpdateEvent = (m, wsID, changes) => {
  const ws = m.getWS(wsID)

  sendWS(ws, [0, 'ou', null, changes])
}

module.exports = onOrderUpdateEvent
