'use strict'

const { genAuthSig, nonce } = require('bfx-api-node-util')

const getAuthParams = (state, dms, calc) => {
  const { apiKey, apiSecret, authToken } = state

  const authParams = {
    event: 'auth',
    dms,
    calc
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
