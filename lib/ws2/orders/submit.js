'use strict'

const { Order } = require('bfx-api-node-models')
const debug = require('debug')('bfx:api:ws2:orders:submit')
const watchResponse = require('../../util/watch_response')

/**
 * Submits an order with either an order model or raw order object.
 *
 * @param {Object} state
 * @param {Object|Array} order
 * @return {Promise} p - resolves/rejects upon confirmation
 */
const submitOrder = (state = {}, order = {}) => {
  const { ev, emit, transform } = state
  const packet = order instanceof Order
    ? order.toNewOrderPacket()
    : new Order(order).toNewOrderPacket()

  const { cid } = packet

  debug('executing order: %j', packet)
  emit('exec:order:submit', packet)

  return watchResponse(ev, `n:on-req:${cid}:success`, `n:on-req:${cid}:error`)
    .then(([, orderData]) => transform ? new Order(orderData) : orderData)
}

module.exports = submitOrder
