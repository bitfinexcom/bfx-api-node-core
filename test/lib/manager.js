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
    const id = WsStateConstructorStub(opts)

    return {
      id,
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

  describe('openWS', () => {
    it('', async () => {
      const wsId = 'ws id'
      WsStateConstructorStub.returns(wsId)
      const notifyPluginsStub = sandbox.stub()

      const instance = new Manager(args)
      instance.notifyPlugins = notifyPluginsStub
      const { ev, id } = instance.openWS()

      expect(id).to.eq(wsId)
      expect(ev.eventNames()).to.eql([
        'self:open',
        'self:reopen',
        'self:message',
        'self:close',
        'self:error',
        'error',
        'data:notification',
        'data:ticker',
        'data:trades',
        'data:candles',
        'data:book',
        'data:managed:book',
        'data:managed:candles',
        'data:book:cs',
        'data:auth',
        'event:auth',
        'event:auth:success',
        'event:auth:error',
        'event:subscribed',
        'event:unsubscribed',
        'event:config',
        'event:error',
        'event:info',
        'event:info:server-restart',
        'event:info:maintenance-start',
        'event:info:maintenance-end',
        'event:pong',
        'plugin:event',
        'exec:order:submit',
        'exec:order:update',
        'exec:order:cancel',
        'exec:flags:set',
        'exec:ping'
      ])
      assert.calledWithExactly(notifyPluginsStub, 'ws2', 'manager', 'ws:created', { id: wsId })
      ev.removeAllListeners()
    })
  })
})
