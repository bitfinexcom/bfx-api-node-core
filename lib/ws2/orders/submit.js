'use strict'

const Promise = require('bluebird')
const { Order } = require('bfx-api-node-models')
const debug = require('debug')('bfx:api:ws2:orders:submit')

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

  return new Promise((resolve, reject) => {
    // TODO refactor
    const clear = () => {
      ev.removeAllListeners(`n:on-req:${cid}:success`)
      ev.removeAllListeners(`n:on-req:${cid}:error`)
      clearTimeout(timeout)
    }
    const timeout = setTimeout(clear, 3000)

    ev.once(`n:on-req:${cid}:success`, (notification, on) => {
      clear()
      const order = transform
        ? new Order(on)
        : on

      resolve(order, notification, on)
    })
    ev.once(`n:on-req:${cid}:error`, err => {
      clear()
      reject(err)
    })
  })
}

module.exports = submitOrder
