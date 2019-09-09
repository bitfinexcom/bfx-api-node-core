'use strict'

const debug = require('debug')('bfx:api:ws2:send')

module.exports = (state = {}, msg) => {
  const { ws, isOpen } = state

  if (isOpen) {
    ws.send(JSON.stringify(msg))
    debug('send: %j', msg)
  } else {
    state.sendBuffer.push(msg)
    debug('buffering send: %j', msg)
  }
}
