/* eslint-env mocha */
'use strict'

const assert = require('assert')

const getAuthParams = require('../../../lib/util/get_auth_params')

describe('utils:get_auth_params', () => {
  it('prioritizes authToken over apiKey and apiSecret', () => {
    const dms = 4
    const calc = 0
    const state = {
      apiKey: 'key',
      apiSecret: 'secret',
      authToken: 'token'
    }

    const res = getAuthParams.get(state, dms, calc)

    assert.deepStrictEqual(res.event, 'auth')
    assert.deepStrictEqual(res.dms, dms)
    assert.deepStrictEqual(res.calc, calc)
    assert.deepStrictEqual(res.token, state.authToken)
    assert.deepStrictEqual(Object.keys(res), ['event', 'dms', 'calc', 'token'])
  })

  it('returns params with apiKey and apiSecret when authToken is not provided', () => {
    const dms = 4
    const calc = 0
    const state = {
      apiKey: 'key',
      apiSecret: 'secret',
      authToken: ''
    }

    const res = getAuthParams.get(state, dms, calc)

    assert.deepStrictEqual(res.event, 'auth')
    assert.deepStrictEqual(res.dms, dms)
    assert.deepStrictEqual(res.calc, calc)
    assert.deepStrictEqual(res.apiKey, state.apiKey)
    assert.deepStrictEqual(Object.keys(res), ['event', 'dms', 'calc', 'apiKey', 'authSig', 'authPayload', 'authNonce'])
  })
})
