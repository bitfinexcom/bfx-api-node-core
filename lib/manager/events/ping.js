'use strict'

const sendWS = require('../../ws2/send')

module.exports = (m, wsID, cid) => {
  const ws = m.getWS(wsID)

  sendWS(ws, {
    event: 'ping',
    cid: cid
  })
}
