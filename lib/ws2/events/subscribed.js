'use strict'

const debug = require('debug')('bfx:api:ws:events:subscribed')
const _pick = require('lodash/pick')
const _isEqual = require('lodash/isEqual')

/**
 * Adds the channel information to the internal channel map
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

  // Remove pending subscription, search w/ channel details
  const nextPendingSubs = [...pendingSubscriptions]
  const subI = nextPendingSubs.findIndex(sub => {
    const fv = _pick(msg, Object.keys(sub[1]))
    const filterMatch = _isEqual(sub[1], fv)

    return sub[0] === msg.channel && filterMatch
  })

  if (subI !== -1) {
    nextPendingSubs.splice(subI, 1)
  }

  return {
    ...state,
    pendingSubscriptions: nextPendingSubs,
    channels: {
      ...channels,
      [chanId]: msg
    }
  }
}
