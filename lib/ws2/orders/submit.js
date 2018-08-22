'use strict'

const Promise = require('bluebird')
const _isArray = require('lodash/isArray')
const { Order } = require('bfx-api-node-models')
const debug = require('debug')('bfx:api:ws2:orders:submit')

module.exports = (state = {}, order = {}) => {
  const { ev } = state
  const packet = _isArray(order)
    ? order
    : order instanceof Order
      ? order.toNewOrderPacket()
      : new Order(order).toNewOrderPacket()

  const { cid } = packet

  debug('executing order: %j', packet)
  ev.emit('exec:order', packet)

  return new Promise((resolve, reject) => {
    ev.once(`n:on-req:${cid}:success`, resolve)
    ev.once(`n:on-req:${cid}:error`, reject)
  })
}
