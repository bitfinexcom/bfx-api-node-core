'use strict'

const debug = require('debug')('bfx:api:ws2:auth')
const Promise = require('bluebird')
const { genAuthSig, nonce } = require('bfx-api-node-util')

const send = require('./send')

/**
 * Attempts to authenticate with the connection's configured API credentials,
 * and the provided flags. Returns a promise that resolves/rejects on
 * success/failure.
 *
 * @param {Object} state
 * @param {Object} opts
 * @param {number} opts.dms - dead man switch, active 4
 * @param {number} opts.calc
 * @return {Promise} p - resolves on successful auth
 */
const auth = (state = {}, { dms = 0, calc = 0 } = {}) => {
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
      debug('error authenticating: %j', err)
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

module.exports = auth
