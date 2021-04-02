'use strict'

const debug = require('debug')('bfx:api:ws:events:subscribed')
const findSubscription = require('../find_pending_subscription')

/**
 * Adds the channel information to the internal channel map
 *
 * Emits:
 *   * event:subscribed
 *
 * @param {Object} state
 * @param {Object} msg
 * @return {Object} nextState
 */
module.exports = (state = {}, msg = {}) => {
  const { channels, emit, pendingSubscriptions } = state
  const { chanId } = msg

  emit('event:subscribed', msg)
  debug('subscribed to channel %d: %j', chanId, msg)

  // Remove pending subscription
  const subscription = findSubscription(pendingSubscriptions, msg)
  const nextPendingSubs = pendingSubscriptions.filter(item => item !== subscription)


  return {
    ...state,
    pendingSubscriptions: nextPendingSubs,
    channels: {
      ...channels,
      [chanId]: msg
    }
  }
}
