'use strict'

const debug = require('debug')('bfx:api:ws2:flush_send_buffer')
const send = require('./send')

/**
 * @memberof module:bfx-api-node-core
 * @private
 *
 * @param {module:bfx-api-node-core.SocketState} state - socket
 * @returns {object} nextState
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
