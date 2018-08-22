'use strict'

const _includes = require('lodash/includes')
const dataChannelTypes = require('./data_types')

module.exports = (state = {}) => {
  const { pendingSubscriptions = [] } = state

  return pendingSubscriptions.filter(sub => {
    return _includes(dataChannelTypes, sub[0])
  }).length
}
