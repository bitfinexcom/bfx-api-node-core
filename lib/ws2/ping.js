'use strict'

const Promise = require('bluebird')
const debug = require('debug')('bfx:api:ws2:ping')

const submitPing = (state = {}, opts) => {
  const { ev, emit } = state
  const { cid } = opts

  debug('executing ping: %j', cid)

  emit('exec:ping', cid)

  return new Promise((resolve, reject) => {
    const ns = `event:pong:${cid}`

    const cb = (msg) => {
      clearTimeout(t)
      resolve(msg)
    }

    const t = setTimeout(() => {
      const err = new Error('ERR_PING_TIMEOUT')
      err._cid = cid

      ev.off(ns, cb)
      reject(err)
    }, 7000)

    ev.once(ns, cb)
  })
}

module.exports = submitPing
