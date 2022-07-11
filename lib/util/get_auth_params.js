'use strict'

const { genAuthSig, nonce } = require('bfx-api-node-util')

const getAuthParams = (authArgs = {}) => {
  const { apiKey, apiSecret, authToken, dms = 0, calc = 0, channelFilters } = authArgs

  const authParams = {
    event: 'auth',
    dms,
    calc
  }

  if (Array.isArray(channelFilters)) {
    authParams.filter = channelFilters
  }

  if (authToken) {
    return {
      ...authParams,
      token: authToken
    }
  }

  if (apiKey && apiSecret) {
    const authNonce = nonce()
    const authPayload = `AUTH${authNonce}${authNonce}`
    const { sig } = genAuthSig(apiSecret, authPayload)

    return {
      ...authParams,
      apiKey,
      authSig: sig,
      authPayload,
      authNonce
    }
  }

  return authParams
}

module.exports = {
  get: getAuthParams
}
