'use strict'

const Promise = require('bluebird')
const debug = require('debug')('bfx:api:ws2:orders:cancel_by_gid')

const cancelOrderByGid = (state = {}, opts) => {
  const { ev, emit } = state
  const { gid } = opts

  debug('canceling order by gid: %s', gid)

  emit('exec:order:cancel-by-gid', gid)

  return new Promise((resolve, reject) => {
    ev.once(`n:oc_multi-req:${gid}:success`, (notification, oc) => {
      resolve(notification, oc)
    })

    ev.once(`n:oc_multi-req:${gid}:error`, reject)
  })
}

module.exports = cancelOrderByGid
