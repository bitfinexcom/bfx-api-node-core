'use strict'

const _values = require('lodash/values')
const _includes = require('lodash/includes')
const pendingSubCount = require('./pending_sub_data_count')
const pendingUnsubCount = require('./pending_unsub_data_count')
const dataChannelTypes = require('./data_types')

/**
 * Returns the number of data channel subscriptions. Pending subscriptions are
 * counted as the subscribe packet has been emitted.
 *
 * @memberof module:bfx-api-node-core
 *
 * @param {module:bfx-api-node-core.SocketState} state - socket
 * @returns {number} dataChannelCount
 */
const getWSDataChannelCount = (state = {}) => {
  const { channels = {} } = state

  const subCount = pendingSubCount(state)
  const unSubCount = pendingUnsubCount(state)
  const count = _values(channels).filter(c => {
    return _includes(dataChannelTypes, c.channel)
  }).length

  return count + subCount - unSubCount
}

module.exports = getWSDataChannelCount
