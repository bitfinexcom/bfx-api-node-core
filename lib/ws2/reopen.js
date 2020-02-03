'use strict'

const open = require('./open')
const bindEV = require('./bind_ev')

module.exports = (state = {}) => {
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
