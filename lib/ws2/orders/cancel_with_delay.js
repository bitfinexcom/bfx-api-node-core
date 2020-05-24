'use strict'

const Promise = require('bluebird')
const cancelOrder = require('./cancel')

/**
 * Cancels an order from either an order object, array, or raw ID, after the
 * specified delay.
 *
 * @memberof module:bfx-api-node-core
 *
 * @param {module:bfx-api-node-core.SocketState} state - socket
 * @param {number} delay - in ms
 * @param {(
 *   module:bfx-api-node-models.Order|
 *   module:bfx-api-node-models.Order~Data
 * )} o - order
 *
 * @returns {Promise} p - resolves/rejects upon confirmation
 */
const cancelOrderWithDelay = (state = {}, delay, o) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      cancelOrder(state, o).then(resolve).catch(reject)
    }, delay)
  })
}

module.exports = cancelOrderWithDelay
