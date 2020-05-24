'use strict'

const _includes = require('lodash/includes')
const dataChannelTypes = require('./data_types')

/**
 * @param {object} state
 * @param {number} pendingUnsubCount
 */
module.exports = (state = {}) => {
  const { channels = {}, pendingUnsubscriptions = [] } = state

  return pendingUnsubscriptions.filter(chanId => {
    const { channel } = (channels[chanId] || {})
    return _includes(dataChannelTypes, channel)
  }).length
}
