'use strict'

const getMsgPayload = require('../../util/msg_payload')

/**
 * Notifies for data on the auth channel (0); expects to receive a transformed
 * version of the incoming data on the data packet.
 *
 * @private
 *
 * @param {Manager} m - manager
 * @param {number} wsID - socket ID
 * @param {Array} data - incoming auth channel data packet
 */
const onWSAuthDataEvent = (m, wsID, data) => {
  const [, type,, transformed] = data // type is 'te', 'tu', etc..
  const payload = getMsgPayload(data)

  m.notifyPlugins('ws2', 'auth', type, {
    id: wsID,
    data: payload
  })

  m.emit(`ws2:auth:${type}`, payload, {
    id: wsID,
    chanFilter: transformed // for filtering
  })
}

module.exports = onWSAuthDataEvent
