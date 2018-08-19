'use strict'

const debug = require('debug')('bfx:api:ws:events:unsubscribed')

/**
 * Removes the channel information from the internal channel map
 *
 * @param {Object} state
 * @param {Object} msg
 * @return {Object} nextState
 */
module.exports = (state = {}, msg = {}) => {
  const { channels } = state
  const { chanId } = msg
  const {
    [chanId]: unsubChannel,
    ...otherChannels
  } = channels

  if (!unsubChannel) {
    debug('tried to unsub from unknown channel: %d', chanId)
    return null
  }


  debug('unsubscribed from channel %d: %j', chanId, unsubChannel)

  return {
    ...state,
    channels: otherChannels,
  }
}
