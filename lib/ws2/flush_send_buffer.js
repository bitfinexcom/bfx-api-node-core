'use strict'

const debug = require('debug')('bfx:api:ws2:flush_send_buffer')
const send = require('./send')

module.exports = (state = {}) => {
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
