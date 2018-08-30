'use strict'

const Promise = require('bluebird')
const _isArray = require('lodash/isArray')
const debug = require('debug')('bfx:api:ws2:orders:cancel')

module.exports = (state = {}, order = {}) => {
  const { ev, emit } = state
  const id = typeof order === 'number'
    ? order
    : _isArray(order)
      ? order[0]
      : order.id

  debug('canceling order: %s', id)
  emit('exec:order:cancel', id)

  return new Promise((resolve, reject) => {
    ev.once(`n:oc-req:${id}:success`, (notification, oc) => {
      // note we resolve with the original order first
      resolve(order, notification, oc)
    })

    ev.once(`n:oc-req:${id}:error`, reject)
  })
}
