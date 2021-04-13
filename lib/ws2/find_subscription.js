'use strict'

const _pick = require('lodash/pick')
const _isEqual = require('lodash/isEqual')

/**
 * Find subscription by channel and payload
 *
 * @param {Array} subscriptions
 * @param {Object} msg
 * @param {boolean?} weak consider only existing fields in subscriptions
 * @return {Object?} subscription
 */
module.exports = (subscriptions, msg, weak = false) => {
  const subscription = subscriptions.find(sub => {
    const [source, target] = weak ? [sub, msg] : [msg, sub]
    const { channel, ...payload } = source
    const fv = _pick(target, Object.keys(payload))
    const filterMatch = _isEqual(payload, fv)

    return channel === target.channel && filterMatch
  })

  return subscription
}
