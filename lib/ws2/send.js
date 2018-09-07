'use strict'

const debug = require('debug')('bfx:api:ws2:send')

module.exports = (state = {}, msg) => {
  const { ws, isOpen } = state
  let nextState = state

  if (isOpen) {
    ws.send(JSON.stringify(msg))
    debug('send: %j', msg)
  } else {
    nextState = {
      ...nextState,
      sendBuffer: [
        ...nextState.sendBuffer,
        msg
      ]
    }
    debug('buffering send: %j', msg)
  }

  return nextState
}
