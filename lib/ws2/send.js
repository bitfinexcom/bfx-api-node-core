'use strict'

module.exports = (state = {}, msg) => {
  const { ws } = state
  ws.send(JSON.stringify(msg))
  return state
}
