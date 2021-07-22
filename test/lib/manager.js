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

const API_KEY = 'api key'
const API_SECRET = 'api secret'
const AUTH_TOKEN = 'auth token'

const Promise = require('bluebird')
const WSManager = require('../../lib/manager')
const { genAuthSig } = require('bfx-api-node-util')
const { MockWSv2Server } = require('bfx-api-mock-srv')

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
        'exec:order:cancel-by-gid',
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
        expect(notifyPluginStub.getCall(index).calledWithExactly(plugin, section, name, args)).to.be.true
      })
    })
  })

  describe('notifyPlugin', () => {
    it('notifies the plugin and updates the ws state', () => {
      const id = 'id'
      const section = 'manager'
      const name = 'event'
      const args = { id }

      const stub = sandbox.stub().returns({
        internalState: 'new value'
      })

      const plugin = {
        id: 'plugin id',
        type: 'ws2',
        [section]: {
          [name]: stub
        }
      }

      const ws = { internalState: 'value' }

      const instance = new Manager({
        plugins: [plugin]
      })
      instance.wsPool = [ws]
      instance.notifyPlugin(plugin, section, name, args)

      assert.calledWithExactly(stub, {
        manager: instance,
        state: ws,
        id
      })
      expect(instance.wsPool).to.eql([
        { internalState: 'new value' }
      ])
    })

    it('notifies the plugin and updates the ws state', () => {
      const id = 'id'
      const section = 'manager'
      const name = 'event'
      const args = { id }

      const stub = sandbox.stub()

      const plugin = {
        id: 'plugin id',
        type: 'ws2',
        pluginInternalState: 'valeu',
        [section]: {
          [name]: stub
        }
      }

      const ws = {
        wsInternalState: 'value',
        plugins: {
          [plugin.id]: plugin
        }
      }

      stub.returns([
        {
          ...ws,
          wsInternalState: 'new value'
        },
        {
          pluginInternalState: 'new value'
        }
      ])

      const instance = new Manager({
        plugins: [plugin]
      })
      instance.wsPool = [ws]
      instance.notifyPlugin(plugin, section, name, args)

      assert.calledWithExactly(stub, {
        manager: instance,
        state: ws,
        id
      })
      expect(instance.wsPool[0].wsInternalState).to.eq('new value')
      expect(plugin.pluginInternalState).to.eq('new value')
    })
  })
})

describe('Reconnect all sockets', () => {
  let m = null
  let wss = null

  afterEach(async () => {
    try {
      m.closeAllSockets()
    } catch (e) {
      assert(true)
    }

    if (wss && wss.isOpen()) {
      await wss.close()
    }

    m = null // eslint-disable-line
    wss = null // eslint-disable-line
  })

  it('reconnects properly when API credentials are updated', async () => {
    wss = new MockWSv2Server({
      syncOnConnect: false,
      authMiddleware: ({ apiKey, authSig, authPayload, token }) => {
        if (token) {
          return token === AUTH_TOKEN
        } else {
          const { sig } = genAuthSig(API_SECRET, authPayload)
          return apiKey === API_KEY && authSig === sig
        }
      }
    })

    m = new WSManager({
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      wsURL: 'ws://localhost:9997'
    })

    m.openWS()

    expect(m.getWSByIndex(0).authArgs.apiKey).to.eq(API_KEY)
    expect(m.getWSByIndex(0).authArgs.apiSecret).to.eq(API_SECRET)

    m.wsPool[0].managedClose = true // do not close wss on connection reopen

    await Promise.delay(50)
    expect(m.getWSByIndex(0).authenticated).to.be.true

    m.updateAuthArgs({ apiKey: 'invalid api key', apiSecret: 'invalid api secret' })

    expect(m.getWSByIndex(0).authArgs.apiKey).to.eq('invalid api key')
    expect(m.getWSByIndex(0).authArgs.apiSecret).to.eq('invalid api secret')

    m.reconnectAllSockets()

    await Promise.delay(50)
    expect(m.getWSByIndex(0).authenticated).to.be.false

    m.updateAuthArgs({ apiKey: API_KEY, apiSecret: API_SECRET })

    expect(m.getWSByIndex(0).authArgs.apiKey).to.eq(API_KEY)
    expect(m.getWSByIndex(0).authArgs.apiSecret).to.eq(API_SECRET)

    m.reconnectAllSockets()

    await Promise.delay(50)
    expect(m.getWSByIndex(0).authenticated).to.be.true
  })

  it('reconnects properly when auth token is updated', async () => {
    wss = new MockWSv2Server({
      syncOnConnect: false,
      authMiddleware: ({ apiKey, authSig, authPayload, token }) => {
        if (token) {
          return token === AUTH_TOKEN
        } else {
          const { sig } = genAuthSig(API_SECRET, authPayload)
          return apiKey === API_KEY && authSig === sig
        }
      }
    })

    m = new WSManager({
      authToken: AUTH_TOKEN,
      wsURL: 'ws://localhost:9997'
    })

    m.openWS()

    expect(m.getWSByIndex(0).authArgs.authToken).to.eq(AUTH_TOKEN)

    m.wsPool[0].managedClose = true // do not close wss on connection reopen

    await Promise.delay(50)
    expect(m.getWSByIndex(0).authenticated).to.be.true

    m.updateAuthArgs({ authToken: 'invalid auth token' })

    expect(m.getWSByIndex(0).authArgs.authToken).to.eq('invalid auth token')

    m.reconnectAllSockets()

    await Promise.delay(50)
    expect(m.getWSByIndex(0).authenticated).to.be.false

    m.updateAuthArgs({ authToken: AUTH_TOKEN })

    expect(m.getWSByIndex(0).authArgs.authToken).to.eq(AUTH_TOKEN)

    m.reconnectAllSockets()

    await Promise.delay(50)
    expect(m.getWSByIndex(0).authenticated).to.be.true
  })
})
