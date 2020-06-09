'use strict'

const debug = require('debug')('bfx:api:ws2:send')

/**
 * Sends the provided data to the active WebSocket connection, or buffers it if
 * the connection is not yet open.
 *
 *
 * @param {SocketState} state - socket
 * @param {Array|object} msg - converted to a JSON string before being sent
 */
const send = (state = {}, msg) => {
  const { ws, isOpen } = state

  if (isOpen) {
    ws.send(JSON.stringify(msg))
    debug('send: %j', msg)
  } else {
    state.sendBuffer.push(msg)
    debug('buffering send: %j', msg)
  }
}

module.exports = send
