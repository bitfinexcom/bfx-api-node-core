'use strict'

const _includes = require('lodash/includes')
const pendingSubCount = require('./pending_sub_data_count')
const pendingUnsubCount = require('./pending_unsub_data_count')
const dataChannelTypes = require('./data_types')

/**
 * @params {Object} state
 * @return {number} dataChannelCount
 */
module.exports = (state = {}) => {
  const { channels = {} } = state

  const subCount = pendingSubCount(state)
  const unSubCount = pendingUnsubCount(state)
  const count = Object.values(channels).filter(c => {
    return _includes(dataChannelTypes, c.channel)
  }).length

  return count + subCount - unSubCount
}
