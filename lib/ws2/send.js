'use strict'

const debug = require('debug')('bfx:api:ws2:send')

module.exports = (state = {}, msg) => {
  const { ws } = state

  ws.send(JSON.stringify(msg))
  debug('send: %j', msg)

  return state
}
