'use strict'

const Promise = require('bluebird')
const debug = require('debug')('bfx:api:ws2:orders:update')

module.exports = (state = {}, changes = {}) => {
  const { id } = changes
  const { ev, emit } = state

  if (!id) {
    return emit('error', new Error('order ID required for update'))
  }

  debug('updating order: %j', changes)
  emit('exec:order:update', changes)

  return new Promise((resolve, reject) => {
    ev.once(`n:ou-req:${id}:success`, resolve)
    ev.once(`n:ou-req:${id}:error`, reject)
  })
}
