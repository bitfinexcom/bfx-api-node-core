'use strict'

const Promise = require('bluebird')
const _isArray = require('lodash/isArray')
const { Order } = require('bfx-api-node-models')
const debug = require('debug')('bfx:api:ws2:orders:cancel')

module.exports = (state = {}, order = {}) => {
  const { ev, emit } = state
  const id = typeof order === 'number'
    ? order
    : Array.isArray(order)
      ? order[0]
      : order.id


  debug('canceling order: %j', id)
  emit('exec:order:cancel', id)

  return new Promise((resolve, reject) => {
    ev.once(`n:oc-req:${id}:success`, resolve)
    ev.once(`n:oc-req:${id}:error`, reject)
  })
}
