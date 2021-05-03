/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const { expect } = require('chai')
const { createSandbox, assert } = require('sinon')
const proxyquire = require('proxyquire')
const EventEmitter = require('events')
const WebSocket = require('ws')

const sandbox = createSandbox()
const WsStateConstructorStub = sandbox.stub()
const authWsStub = sandbox.stub()

const Manager = proxyquire('../../lib/manager', {
  './ws2/auth': authWsStub,
  './ws2/init_state': sandbox.spy((opts) => {
    const id = WsStateConstructorStub(opts)

    return {
      id,
      ev: new EventEmitter(),
      ws: {
        readyState: WebSocket.OPEN,
        close: sandbox.stub()
      }
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
    it('open ws and notify plugins', async () => {
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

  describe('closeAllSockets', () => {
    it('close all sockets and notify plugins', () => {
      const wsId = 'ws id'
      WsStateConstructorStub.returns(wsId)
      const notifyPluginsStub = sandbox.stub()

      const instance = new Manager(args)
      instance.notifyPlugins = notifyPluginsStub
      const { ev, id, ws } = instance.openWS()

      instance.closeWS(id)

      expect(id).to.eq(wsId)
      assert.calledWithExactly(notifyPluginsStub, 'ws2', 'manager', 'ws:destroyed', { id: wsId })
      assert.calledOnce(ws.close)
      expect(instance.wsPool).to.be.empty
      ev.removeAllListeners()
    })
  })

  describe('notifyPlugins', () => {
    it('notify plugins that match type', () => {
      const notifyPluginStub = sandbox.stub()

      const type = 'notification type'
      const section = 'notification section'
      const name = 'notification name'
      const args = { id: 'id' }

      const pluginThatMatches = {
        id: 'plugin 1',
        type
      }
      const pluginDoesNoMatch = {
        id: 'plugin 2',
        type: 'another type'
      }

      const instance = new Manager({
        plugins: [
          pluginThatMatches,
          pluginDoesNoMatch
        ]
      })
      instance.notifyPlugin = notifyPluginStub
      instance.notifyPlugins(type, section, name, args)

      assert.calledOnce(notifyPluginStub)
      assert.calledWithExactly(notifyPluginStub, pluginThatMatches, section, name, args)
      expect(notifyPluginStub.calledWith(pluginDoesNoMatch)).to.be.false
    })

    it('wildcard type should notify all plugins', () => {
      const notifyPluginStub = sandbox.stub()

      const type = '*'
      const section = 'notification section'
      const name = 'notification name'
      const args = { id: 'id' }

      const plugins = [
        {
          id: 'plugin 1',
          type: 'first type'
        },
        {
          id: 'plugin 2',
          type: 'another type'
        }
      ]

      const instance = new Manager({
        plugins
      })
      instance.notifyPlugin = notifyPluginStub
      instance.notifyPlugins(type, section, name, args)

      assert.calledTwice(notifyPluginStub)
      plugins.forEach((plugin, index) => {
        expect(notifyPluginStub.onCall(index).calledWithExactly(plugin, section, name, args)).to.be.true
      })
    })
  })
})
