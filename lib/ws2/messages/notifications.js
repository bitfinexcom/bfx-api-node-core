'use strict'

const debug = require('debug')('bfx:api:ws:messages:notifications')
const getMsgPayload = require('../../util/msg_payload')

// TODO: _onWSNotification from ws2.js (cb triggers)
module.exports = (args = {}) => {
  const { state = {}, msg = [] } = args
  const { ev } = state
  const data = getMsgPayload(msg)
  const [, type,,, payload,, status, message] = data

  debug('%s: %s', status, message)

  // TODO: Generalise event payload ID index. on-req is 2
  const eid = payload[2]

  ev.emit(`n:${type}:${eid}:${status.toLowerCase()}`, data)

  return null
}
