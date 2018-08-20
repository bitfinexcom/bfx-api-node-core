'use strict'

const debug = require('debug')('bfx:api:ws:events:subscribed')

/**
 * Adds the channel information to the internal channel map
 *
 * @param {Object} state
 * @param {Object} msg
 * @return {Object} nextState
 */
module.exports = (state = {}, msg = {}) => {
  const { channels, ev } = state
  const { chanId } = msg

  ev.emit('subscribed', msg)
  debug('subscribed to channel %d: %j', chanId, msg)

  return {
    ...state,
    channels: {
      ...channels,
      [chanId]: msg,
    }
  }
}
