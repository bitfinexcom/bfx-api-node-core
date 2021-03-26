/* eslint-env mocha */
'use strict'

const assert = require('assert')
const auth = require('../../../lib/ws2/auth')

const defaultState = {
  isOpen: true,
  ev: {
    once: () => {}
  },
  apiKey: 'key',
  apiSecret: 'secret',
  ws: {
    send: () => {}
  }
}

describe('ws2:auth', () => {
  it('sends auth packet w/ dms and calc params', (done) => {
    auth({
      ...defaultState,
      ws: {
        send: (json) => {
          const msg = JSON.parse(json)

          assert.strictEqual(msg.event, 'auth')
          assert.strictEqual(msg.apiKey, 'key')
          assert(msg.authSig)
          assert(msg.authPayload)
          assert(msg.authNonce)
          assert.strictEqual(msg.dms, 4)
          assert.strictEqual(msg.calc, 0)
          done()
        }
      }
    }, {
      dms: 4,
      calc: 0
    })
  })

  it('sends auth packet w/ authToken', (done) => {
    auth({
      ...defaultState,
      authToken: 'token',
      ws: {
        send: (json) => {
          const msg = JSON.parse(json)

          assert.strictEqual(msg.event, 'auth')
          assert.strictEqual(msg.token, 'token')
          assert.strictEqual(msg.dms, 4)
          assert.strictEqual(msg.calc, 0)
          done()
        }
      }
    }, {
      dms: 4,
      calc: 0
    })
  })

  it('binds auth success event listener', (done) => {
    auth({
      ...defaultState,
      ev: {
        once: (eventName, handler) => {
          if (eventName === 'event:auth:success') {
            assert(handler)
            done()
          }
        }
      }
    })
  })

  it('binds auth error listener', (done) => {
    auth({
      ...defaultState,
      ev: {
        once: (eventName, handler) => {
          if (eventName === 'event:auth:error') {
            assert(handler)
            done()
          }
        }
      }
    })
  })
})
