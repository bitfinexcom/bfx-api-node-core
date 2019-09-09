'use strict'

const debug = require('debug')('bfx:api:ws2:subscribe')
const send = require('./send')

module.exports = (state = {}, channel, payload = {}) => {
  debug('subscribing to %s: %j', channel, payload)

  send(state, {
    ...payload,
    event: 'subscribe',
    channel
  })

  state.pendingSubscriptions.push([channel, payload])
}
