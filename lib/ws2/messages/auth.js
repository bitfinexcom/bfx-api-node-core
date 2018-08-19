'use strict'

const debug = require('debug')('bfx:api:ws:messages:auth')
const msgPayload = require('../../util/msg_payload')
const onNotification = require('./notifications')

module.exports = (state = {}, msg = []) => {
  const [, type] = msg

  if (type === 'n') {
    const payload = msgPayload(msg)

    if (payload) {
      return onNotification(state, msg)
    }
  }

  // TODO: Propagate

  return null
}
