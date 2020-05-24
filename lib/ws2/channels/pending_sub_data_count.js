'use strict'

const _includes = require('lodash/includes')
const dataChannelTypes = require('./data_types')

/**
 * Query the number of pending channel subscriptions (subscribed but
 * confirmation packet not yet received)
 *
 * @memberof module:bfx-api-node-core
 *
 * @param {module:bfx-api-node-core.SocketState} state - socket
 * @returns {number} pendingSubCount
 */
const getPendingSubscriptionCount = (state = {}) => {
  const { pendingSubscriptions = [] } = state

  return pendingSubscriptions.filter(sub => {
    return _includes(dataChannelTypes, sub[0])
  }).length
}

module.exports = getPendingSubscriptionCount
