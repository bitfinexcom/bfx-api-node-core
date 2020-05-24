'use strict'

const _keys = require('lodash/keys')

/**
 * @memberof module:bfx-api-node-core
 * @private
 *
 * @param {module:bfx-api-node-core.SocketState} state - socket
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
