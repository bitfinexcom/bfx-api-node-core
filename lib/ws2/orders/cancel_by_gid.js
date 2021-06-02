'use strict'

const debug = require('debug')('bfx:api:ws2:orders:cancel_by_gid')
const watchResponse = require('../../util/watch_response')

const cancelOrderByGid = (state = {}, opts) => {
  const { ev, emit } = state
  const { gid } = opts

  debug('canceling order by gid: %s', gid)

  emit('exec:order:cancel-by-gid', gid)

  return watchResponse(ev, `n:oc_multi-req:${gid}:success`, `n:oc_multi-req:${gid}:error`)
}

module.exports = cancelOrderByGid
