/* eslint-env mocha */
'use strict'

const assert = require('assert')

const getAuthParams = require('../../../lib/util/get_auth_params')

describe('utils:get_auth_params', () => {
  it('prioritizes authToken over apiKey and apiSecret', () => {
    const authArgs = {
      apiKey: 'key',
      apiSecret: 'secret',
      authToken: 'token',
      dms: 4,
      calc: 0
    }

    const res = getAuthParams.get(authArgs)

    assert.deepStrictEqual(res.event, 'auth')
    assert.deepStrictEqual(res.dms, authArgs.dms)
    assert.deepStrictEqual(res.calc, authArgs.calc)
    assert.deepStrictEqual(res.token, authArgs.authToken)
    assert.deepStrictEqual(Object.keys(res), ['event', 'dms', 'calc', 'token'])
  })

  it('returns params with apiKey and apiSecret when authToken is not provided', () => {
    const authArgs = {
      apiKey: 'key',
      apiSecret: 'secret',
      authToken: '',
      dms: 4,
      calc: 0
    }

    const res = getAuthParams.get(authArgs)

    assert.deepStrictEqual(res.event, 'auth')
    assert.deepStrictEqual(res.dms, authArgs.dms)
    assert.deepStrictEqual(res.calc, authArgs.calc)
    assert.deepStrictEqual(res.apiKey, authArgs.apiKey)
    assert.deepStrictEqual(Object.keys(res), ['event', 'dms', 'calc', 'apiKey', 'authSig', 'authPayload', 'authNonce'])
  })
})
