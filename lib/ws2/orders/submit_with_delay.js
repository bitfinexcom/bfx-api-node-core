'use strict'

const Promise = require('bluebird')
const submitOrder = require('./submit')

/**
 * Submits an order with either an order model or raw order object, after the
 * specified delay.
 *
 * @param {object} state
 * @param {number} delay - in ms
 * @param {Object|Array} order
 * @returns {Promise} p - resolves/rejects upon confirmation
 */
const submitOrderWithDelay = (state = {}, delay, o) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      submitOrder(state, o).then(resolve).catch(reject)
    }, delay)
  })
}

module.exports = submitOrderWithDelay
