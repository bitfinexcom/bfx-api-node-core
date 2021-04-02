'use strict'

const _pick = require('lodash/pick')
const _isEqual = require('lodash/isEqual')

/**
 * Find pending subscription
 *
 * @param {Array} pendingSubscriptions
 * @return {Object?} subscription
 */
module.exports = (pendingSubscriptions, msg) => {
  const subscription = pendingSubscriptions.find(sub => {
    const [channel, payload] = sub
    const fv = _pick(msg, Object.keys(payload))
    const filterMatch = _isEqual(payload, fv)

    return channel === msg.channel && filterMatch
  })

  return subscription
}