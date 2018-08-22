'use strict'

const debug = require('debug')('bfx:api:ws2:unsubscribe')
const send = require('./send')

module.exports = (state = {}, chanId) => {
  debug('unsubscribing from %d', chanId)

  const nextState = send(state, {
    event: 'unsubscribe',
    chanId: +chanId,
  })

  return {
    ...nextState,

    pendingUnsubscriptions: [
      ...state.pendingUnsubscriptions,
      chanId,
    ]
  }
}
