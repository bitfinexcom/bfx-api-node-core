'use strict'

const _isArray = require('lodash/isArray')
const _isFinite = require('lodash/isFinite')
const debug = require('debug')('bfx:api:ws2:orders:cancel')
const watchResponse = require('../../util/watch_response')

/**
 * Cancels an order from either an order object, array, or raw ID.
 *
 * @param {Object} state
 * @param {Object|Array|number} order
 * @return {Promise} p - resolves/rejects upon confirmation
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

  return watchResponse(ev, `n:oc-req:${id}:success`, `n:oc-req:${id}:error`)
    .then(() => order)
}

module.exports = cancelOrder
