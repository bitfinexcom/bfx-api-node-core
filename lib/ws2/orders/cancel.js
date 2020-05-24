'use strict'

const Promise = require('bluebird')
const _isArray = require('lodash/isArray')
const _isFinite = require('lodash/isFinite')
const debug = require('debug')('bfx:api:ws2:orders:cancel')

/**
 * Cancels an order from either an order object, array, or raw ID.
 *
 * @param {object} state
 * @param {Object|Array|number} order
 * @returns {Promise} p - resolves/rejects upon confirmation
 */
const cancelOrder = (state = {}, order = {}) => {
  const { ev, emit } = state
  const id = _isFinite(order)
    ? order
    : _isArray(order)
      ? order[0]
      : order.id

  debug('canceling order: %s', id)
  emit('exec:order:cancel', id)

  return new Promise((resolve, reject) => {
    ev.once(`n:oc-req:${id}:success`, (notification, oc) => {
      // note we resolve with the original order first
      resolve(order, notification, oc)
    })

    ev.once(`n:oc-req:${id}:error`, reject)
  })
}

module.exports = cancelOrder
