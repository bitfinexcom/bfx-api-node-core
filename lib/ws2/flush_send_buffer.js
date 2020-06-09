'use strict'

const debug = require('debug')('bfx:api:ws2:flush_send_buffer')
const send = require('./send')

/**
 * @private
 *
 * @param {SocketState} state - socket
 * @returns {SocketState} nextState
 */
const flushSendBuffer = (state = {}) => {
  const { sendBuffer = [] } = state

  if (sendBuffer.length === 0) {
    return state
  }

  debug('flushing %d packets...', sendBuffer.length)

  sendBuffer.forEach(msg => {
    send(state, msg)
  })

  return {
    ...state,
    sendBuffer: []
  }
}

module.exports = flushSendBuffer
