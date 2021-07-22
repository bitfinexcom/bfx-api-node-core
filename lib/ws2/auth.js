'use strict'

const debug = require('debug')('bfx:api:ws2:auth')

const getAuthParams = require('../util/get_auth_params')
const watchResponse = require('../util/watch_response')
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
const auth = (state = {}) => {
  const { ev, authArgs } = state
  const authParams = getAuthParams.get(authArgs)

  send(state, authParams)

  return watchResponse(ev, 'event:auth:success', 'event:auth:error')
    .then(() => {
      debug('authenticated')
    })
    .catch(err => {
      debug('error authenticating: %j', err)
      return Promise.reject(err)
    })
}

module.exports = auth
