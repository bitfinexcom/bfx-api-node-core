'use strict'

const sendWS = require('../../ws2/send')

/**
 * Cancel multiple orders using Group ID
 *
 * @param {Manager} m
 * @param {number} wsID - socket ID
 * @param {number} gid - order GID to cancel
 */
module.exports = (m, wsID, gid) => {
  const ws = m.getWS(wsID)

  sendWS(ws, [0, 'oc_multi', null, { gid: [+gid] }])
}
