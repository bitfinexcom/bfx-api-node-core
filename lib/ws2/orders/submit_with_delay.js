'use strict'

const Promise = require('bluebird')
const submitOrder = require('./submit')

module.exports = (state = {}, delay, o) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      submitOrder(state, o).then(resolve).catch(reject)
    }, delay)
  })
}
