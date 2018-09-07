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
  const { emit, channels, pendingUnsubscriptions } = state
  const { chanId } = msg
  const {
    [chanId]: unsubChannel,
    ...otherChannels
  } = channels

  if (!unsubChannel) {
    debug('tried to unsub from unknown channel: %d', chanId)
    return null
  }

  emit('event:unsubscribed', msg)
  debug('unsubscribed from channel %d', chanId)

  const nextPendingUnsubs = [...pendingUnsubscriptions]
  const unsubI = nextPendingUnsubs.findIndex(cid => cid === chanId)

  if (unsubI !== -1) {
    nextPendingUnsubs.splice(unsubI, 1)
  }

  return {
    ...state,
    pendingUnsubscriptions: nextPendingUnsubs,
    channels: otherChannels,
  }
}
