'use strict'

const debug = require('debug')('bfx:api:ws2:unsubscribe')
const send = require('./send')

/**
 * Unsubscribes from the specified channel, buffers if the connection is not
 * open.
 *
 * @param {object} state
 * @param {string|number} chanId - ID of channel to unsubscribe from
 * @returns {object} state - original ref
 */
const unsubscribe = (state = {}, chanId) => {
  debug('unsubscribing from %d', chanId)

  send(state, {
    event: 'unsubscribe',
    chanId: +chanId
  })

  state.pendingUnsubscriptions.push(chanId)

  return state
}

module.exports = unsubscribe
