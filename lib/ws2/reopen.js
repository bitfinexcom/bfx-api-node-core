'use strict'

const WebSocket = require('ws')
const open = require('./open')
const bindEV = require('./bind_ev')

/**
 * Reopen a socket connection.
 *
 * @param {SocketState} state - socket
 * @returns {SocketState} nextState
 */
const reopen = (state = {}) => {
  const { url, agent, ws: oldWS } = state

  if (oldWS && oldWS.readyState === WebSocket.OPEN) {
    oldWS.close()
  }

  const { ws } = open(url, agent)

  bindEV({ ws, ev: state.ev })

  state.ev.once('self:open', () => {
    state.ev.emit('self:reopen')
  })

  return {
    ...state,
    ws
  }
}

module.exports = reopen
