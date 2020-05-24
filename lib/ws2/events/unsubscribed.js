'use strict'

const debug = require('debug')('bfx:api:ws:events:unsubscribed')

/**
 * Removes the channel information from the internal channel map
 *
 * Emits:
 *   * event:unsubscribed
 *
 * @memberof module:bfx-api-node-core
 * @private
 *
 * @param {module:bfx-api-node-core.SocketState} state - socket
 * @param {object} msg - incoming message
 * @returns {module:bfx-api-node-core.SocketState} nextState
 */
const onWSUnsubscribedEvent = (state = {}, msg = {}) => {
  const { emit, channels, pendingUnsubscriptions } = state
  const { chanId } = msg
  const {
    [chanId]: unsubChannel,
    ...otherChannels
  } = channels

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
    channels: otherChannels
  }
}

module.exports = onWSUnsubscribedEvent
