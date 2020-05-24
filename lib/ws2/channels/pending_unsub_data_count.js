'use strict'

const _includes = require('lodash/includes')
const dataChannelTypes = require('./data_types')

/**
 * Query the number of pending channel unsubscriptions (unsubscribed but
 * confirmation packet not yet received)
 *
 * @memberof module:bfx-api-node-core
 *
 * @param {module:bfx-api-node-core.SocketState} state - socket
 * @returns {number} pendingUnsubCount
 */
const getPendingUnsubscriptionCount = (state = {}) => {
  const { channels = {}, pendingUnsubscriptions = [] } = state

  return pendingUnsubscriptions.filter(chanId => {
    const { channel } = (channels[chanId] || {})
    return _includes(dataChannelTypes, channel)
  }).length
}

module.exports = getPendingUnsubscriptionCount
