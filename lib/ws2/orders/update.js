'use strict'

const debug = require('debug')('bfx:api:ws2:orders:update')
const watchResponse = require('../../util/watch_response')

/**
 * Updates an order in-place.
 *
 * @param {Object} state
 * @param {Object} changes - order update packet
 * @param {Object} changes.id - id of order to apply update to
 * @return {Promise} p - resolves/rejects upon confirmation
 */
const updateOrder = (state = {}, changes = {}) => {
  const { id } = changes
  const { ev, emit } = state

  if (!id) {
    return emit('error', new Error('order ID required for update'))
  }

  debug('updating order: %j', changes)
  emit('exec:order:update', changes)

  return watchResponse(ev, `n:ou-req:${id}:success`, `n:ou-req:${id}:error`)
}

module.exports = updateOrder
