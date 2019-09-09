'use strict'

const debug = require('debug')('bfx:api:ws2:unsubscribe')
const send = require('./send')

module.exports = (state = {}, chanId) => {
  debug('unsubscribing from %d', chanId)

  send(state, {
    event: 'unsubscribe',
    chanId: +chanId
  })

  state.pendingUnsubscriptions.push(chanId)
}
