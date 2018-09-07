'use strict'

const debug = require('debug')('bfx:api:ws2:subscribe')
const send = require('./send')

module.exports = (state = {}, channel, payload = {}) => {
  debug('subscribing to %s: %j', channel, payload)

  const nextState = send(state, {
    ...payload,
    event: 'subscribe',
    channel,
  })

  return {
    ...nextState,

    pendingSubscriptions: [
      ...nextState.pendingSubscriptions,
      [channel, payload],
    ]
  }
}
