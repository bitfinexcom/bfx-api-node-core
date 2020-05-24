'use strict'

const Promise = require('bluebird')
const cancelOrder = require('./cancel')

/**
 * Cancels an order from either an order object, array, or raw ID, after the
 * specified delay.
 *
 * @param {object} state
 * @param {number} delay - in ms
 * @param {Object|Array|number} order
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
