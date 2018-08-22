'use strict'

const debug = require('debug')('bfx:api:ws2:auth')
const Promise = require('bluebird')
const { genAuthSig, nonce } = require('bfx-api-node-util')

const send = require('./send')

/**
 * @param {Object} state
 * @param {Object} opts
 * @param {number} opts.dms - dead man switch, active 4
 * @param {number} opts.calc
 * @return {Promise} p - resolves on successful auth
 */
module.exports = (state = {}, { dms = 0, calc = 0 } = {}) => {
  const { ev, apiKey, apiSecret } = state
  const authNonce = nonce()
  const authPayload = `AUTH${authNonce}${authNonce}`
  const { sig } = genAuthSig(apiSecret, authPayload)

  return new Promise((resolve, reject) => {
    ev.once('event:auth:success', () => {
      debug('authenticated')
      resolve()
    })

    ev.once('event:auth:error', err => {
      debug('error authenticating: %s', err.message)
      reject(err)
    })

    send(state, {
      event: 'auth',
      apiKey,
      authSig: sig,
      authPayload,
      authNonce,
      dms,
      calc
    })
  })
}
