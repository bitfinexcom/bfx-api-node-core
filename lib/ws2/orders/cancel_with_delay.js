'use strict'

const Promise = require('bluebird')
const cancelOrder = require('./cancel')

module.exports = (state = {}, delay, o) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      cancelOrder(state, o).then(resolve).catch(reject)
    }, delay)
  })
}
