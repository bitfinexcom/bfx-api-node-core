/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const { expect } = require('chai')
const { createSandbox, assert } = require('sinon')
const proxyquire = require('proxyquire')
const EventEmitter = require('events')

const sandbox = createSandbox()
const RESTv2ConstructorStub = sandbox.stub()
const WsStateConstructorStub = sandbox.stub()
const authWsStub = sandbox.stub()

const Manager = proxyquire('../../lib/manager', {
  'bfx-api-node-rest': {
    RESTv2: sandbox.spy((opts) => {
      RESTv2ConstructorStub(opts)
      return {}
    })
  },
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
    restURL: 'rest url',
    wsURL: 'ws url',
    calc: 'calc',
    dms: 'dms'
  }

  it('creates a new manager instance', () => {
    const instance = new Manager(args)
    assert.calledWithExactly(RESTv2ConstructorStub, {
      apiKey: args.apiKey,
      apiSecret: args.apiSecret,
      authToken: args.authToken,
      transform: args.transform,
      agent: args.agent,
      url: args.restURL
    })
    expect(instance.rest).not.to.undefined
  })

  describe('auth token updated event', () => {
    it('should update the rest client and websockets auth', () => {
      const authToken = 'new token'

      const instance = new Manager(args)
      const { ev, id } = instance.openWS()

      ev.emit('auth:token:updated', { authToken })

      assert.calledWithExactly(RESTv2ConstructorStub.firstCall, {
        apiKey: args.apiKey,
        apiSecret: args.apiSecret,
        authToken: args.authToken,
        transform: args.transform,
        agent: args.agent,
        url: args.restURL
      })
      assert.calledWithExactly(RESTv2ConstructorStub.secondCall, {
        apiKey: args.apiKey,
        apiSecret: args.apiSecret,
        authToken: authToken,
        transform: args.transform,
        agent: args.agent,
        url: args.restURL
      })
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
      expect(instance.rest).not.to.undefined
    })
  })
})
