/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const { expect } = require('chai')
const { createSandbox, assert } = require('sinon')
const proxyquire = require('proxyquire')
const EventEmitter = require('events')

const sandbox = createSandbox()
const WsStateConstructorStub = sandbox.stub()
const authWsStub = sandbox.stub()

const Manager = proxyquire('../../lib/manager', {
  './ws2/auth': authWsStub,
  './ws2/init_state': sandbox.spy((opts) => {
    WsStateConstructorStub(opts)
    return {
      id: Math.random(),
      ev: new EventEmitter()
    }
  })
})

describe('manager', () => {
  afterEach(() => {
    sandbox.reset()
  })

  after(() => {
    sandbox.restore()
  })

  const args = {
    apiKey: 'api key',
    apiSecret: 'api secret',
    authToken: 'auth token',
    transform: 'transform',
    agent: false,
    wsURL: 'ws url',
    calc: 'calc',
    dms: 'dms'
  }

  describe('auth token updated event', () => {
    it('should update the rest client and websockets auth', async () => {
      const authToken = 'new token'

      const instance = new Manager(args)
      const { ev, id } = instance.openWS()

      const newTokenPublished = new Promise((resolve) => {
        instance.once('auth:token:updated', resolve)
      })

      ev.emit('auth:token:updated', { authToken })

      const { authToken: publishedToken } = await newTokenPublished

      expect(publishedToken).to.eq(authToken)
      assert.calledWithExactly(
        authWsStub,
        {
          id,
          ev,
          apiKey: args.apiKey,
          apiSecret: args.apiSecret,
          authToken
        },
        {
          dms: args.dms,
          calc: args.calc
        }
      )
      ev.removeAllListeners()
      instance.removeAllListeners()
    })
  })
})
