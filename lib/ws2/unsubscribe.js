'use strict'

const debug = require('debug')('bfx:api:ws2:unsubscribe')
const send = require('./send')

/**
 * Unsubscribes from the specified channel, buffers if the connection is not
 * open.
 *
 * @param {Object} state
 * @param {string|number} chanId - ID of channel to unsubscribe from
 */
const unsubscribe = (state = {}, chanId) => {
  debug('unsubscribing from %d', chanId)

  send(state, {
    event: 'unsubscribe',
    chanId: +chanId
  })

  state.pendingUnsubscriptions.push(chanId)
}

module.exports = unsubscribe
