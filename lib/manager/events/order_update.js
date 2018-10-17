'use strict'

const sendWS = require('../../ws2/send')

/**
 * Submits the provided order changeset
 *
 * @param {Manager} m
 * @param {number} wsID - socket ID
 * @param {Object} changes - order changeset
 */
module.exports = (m, wsID, changes) => {
  const ws = m.getWS(wsID)

  sendWS(ws, [0, 'ou', null, changes])
}
