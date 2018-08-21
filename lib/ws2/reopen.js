'use strict'

const open = require('./open')
const bindEV = require('./bind_ev')

module.exports = (state = {}) => {
  const { url, agent } = state
  const { ws } = open(url, agent)

  bindEV({ ws, ev: state.ev })

  return {
    ...state,
    ws,
  }
}