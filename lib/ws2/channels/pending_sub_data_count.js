'use strict'

const _includes = require('lodash/includes')
const dataChannelTypes = require('./data_types')

/**
 * @param {Object} state
 * @param {number} pendingSubCount
 */
module.exports = (state = {}) => {
  const { pendingSubscriptions = [] } = state

  return pendingSubscriptions.filter(sub => {
    return _includes(dataChannelTypes, sub.channel)
  }).length
}
