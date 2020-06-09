'use strict'

const _keys = require('lodash/keys')

/**
 * @param {SocketState} state - socket
 * @param {Function} comp - comparator
 * @returns {number} channelID
 */
const findChannelId = (state = {}, comp = () => false) => {
  const { channels = {} } = state

  return _keys(channels).find(cId => {
    return comp(channels[cId])
  })
}

module.exports = findChannelId
