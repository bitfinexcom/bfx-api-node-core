'use strict'

const WebSocket = require('ws')
const open = require('./open')
const bindEV = require('./bind_ev')

/**
 * Reopen a socket connection.
 *
 * @memberof module:bfx-api-node-core
 *
 * @param {module:bfx-api-node-core.SocketState} state - socket
 * @returns {module:bfx-api-node-core.SocketState} nextState
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
