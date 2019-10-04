'use strict'

const debug = require('debug')('bfx:api:manager')
const { RESTv2 } = require('bfx-api-node-rest')
const _isFunction = require('lodash/isFunction')
const _isObject = require('lodash/isObject')
const _isArray = require('lodash/isArray')
const _isEmpty = require('lodash/isEmpty')
const _isString = require('lodash/isString')
const _isEqual = require('lodash/isEqual')
const _keyBy = require('lodash/keyBy')
const _pick = require('lodash/pick')
const { EventEmitter } = require('events')
const WebSocket = require('ws')

const { REST_URL, WS_URL } = require('./config')
const dataChannelCount = require('./ws2/channels/data_count')
const initWSState = require('./ws2/init_state')
const authWS = require('./ws2/auth')

const onWSReopen = require('./manager/events/ws_reopen')
const onWSOpen = require('./manager/events/ws_open')
const onWSClose = require('./manager/events/ws_close')
const onWSMessage = require('./manager/events/ws_message')
const onWSError = require('./manager/events/ws_error')
const onWSData = require('./manager/events/ws_data')
const onWSAuthData = require('./manager/events/ws_auth_data')
const onWSEvent = require('./manager/events/ws_event')
const onPluginEvent = require('./manager/events/plugin')
const onOrderSubmitEvent = require('./manager/events/order_submit')
const onOrderUpdateEvent = require('./manager/events/order_update')
const onOrderCancelEvent = require('./manager/events/order_cancel')
const onSetFlags = require('./manager/events/set_flags')

/**
 * WSv2 connection pool manager. Limits active channel subscriptions per socket,
 * opening new sockets/closing existing one as needed.
 */
class Manager extends EventEmitter {
  /**
   * @param {Object} args
   * @param {string?} args.wsURL - defaults to production Bitfinex WSv2 API url
   * @param {string?} args.restURL - defaults to production Bitfinex RESTv2 API url
   * @param {Object?} args.agent - connection agent
   * @param {string?} args.apiKey - used to authenticate sockets
   * @param {string?} args.apiSecret - used to authenticate sockets
   * @param {boolean} args.autoResubscribe - default true
   * @param {number} args.channelsPerSocket - defaults to 30
   * @param {number} args.dms - dead-man-switch flag sent on auth, active 4
   * @param {number} args.calc
   * @param {boolean?} args.transform - if true, raw API data arrays will be automatically converted to bfx-api-node-models instances
   * @param {Object?} args.plugins - optional set of plugins to use
   */
  constructor (args = {}) {
    super()

    const {
      apiKey,
      apiSecret,
      channelsPerSocket = 30,
      autoResubscribe = true,
      restURL = REST_URL,
      wsURL = WS_URL,
      dms = 0,
      calc = 0,
      plugins = [],
      transform,
      agent
    } = args

    this._agent = agent
    this.apiKey = apiKey
    this.apiSecret = apiSecret
    this._restURL = restURL
    this._wsURL = wsURL
    this._transform = transform
    this._channelsPerSocket = channelsPerSocket
    this.autoResubscribe = autoResubscribe
    this.plugins = _keyBy(plugins, p => p.id)
    this.wsPool = []
    this.authArgs = { dms, calc }

    this.rest = new RESTv2({
      apiKey,
      apiSecret,
      transform,
      agent,
      url: restURL
    })
  }

  /**
   * @param {Object} plugin
   * @return {boolean} hasPlugin
   */
  hasPlugin (p = {}) {
    return !!this.plugins[p.id]
  }

  /**
   * No-op if the plugin is already registered
   *
   * @param {Object} plugin
   */
  addPlugin (p = {}) {
    if (this.plugins[p.id]) {
      debug('plugin %s already registered', p.id)
      return
    }

    this.plugins[p.id] = p
  }

  /**
   * Authenticates all open API connections
   *
   * @param {Object?} args - optional, defaults to values provided to constructor
   * @param {string?} args.apiKey
   * @param {string?} args.apiSecret
   * @param {number?} args.dms - dead man switch, active 4
   * @param {number?} args.calc
   */
  auth ({ apiKey, apiSecret, dms = 0, calc = 0 } = {}) {
    if (_isString(apiKey)) this.apiKey = apiKey
    if (_isString(apiSecret)) this.apiSecret = apiSecret

    this.authArgs = { dms, calc }

    for (let i = 0; i < this.wsPool.length; i += 1) {
      const ws = this.wsPool[i]
      const { authenticated } = ws

      if (!authenticated) {
        const nextWS = {
          ...ws,
          apiKey: this.apiKey,
          apiSecret: this.apiSecret
        }

        authWS(nextWS, this.authArgs)
        this.wsPool[i] = nextWS
      }
    }
  }

  /**
   * Returns a connection state object by ID
   *
   * @param {number} id - connection ID
   * @return {Object} state - connection state
   */
  getWS (id) {
    return this.wsPool.find(s => s.id === id)
  }

  /**
   * Returns the index of a connection within the internal pool by ID
   *
   * @param {number} id - connection ID
   * @return {number} index - within internal pool
   */
  getWSIndex (id) {
    return this.wsPool.findIndex(s => s.id === id)
  }

  /**
   * Returns a connection state object by pool index
   *
   * @param {number} index - within internal pool
   * @return {Object} state - connection state
   */
  getWSByIndex (index) {
    return this.wsPool[index]
  }

  /**
   * Updates an internal connection by ID, emitting the socket:updated event
   * if the connection exists.
   *
   * @param {number} id
   * @param {Object} state - new connection state
   */
  updateWS (id, state) {
    const i = this.getWSIndex(id)

    if (i !== -1) {
      this.wsPool[i] = state
      this.emit('socket:updated', i, state)
    }
  }

  /**
   * Closes all connections in the pool
   */
  closeAllSockets () {
    while (this.wsPool.length > 0) {
      this.closeWS(this.wsPool[0].id)
    }
  }

  /**
   * Closes a connection by ID, no-op if the connection is not found.
   *
   * @param {number} id
   */
  closeWS (id) {
    const wsIndex = this.getWSIndex(id)

    if (wsIndex === -1) {
      debug('tried to close unknown ws client: %d', id)
      return null
    }

    this.notifyPlugins('ws2', 'manager', 'ws:destroyed', { id })

    const wsState = this.wsPool[wsIndex]
    const { ws } = wsState

    if (ws.readyState !== WebSocket.CLOSED) {
      ws.close()
    }

    this.wsPool.splice(wsIndex, 1)
  }

  /**
   * Creates & opens a new WSv2 connection, adds it to the pool, and returns it
   *
   * @return {Object} connection
   */
  openWS () {
    const wsState = initWSState({
      url: this._wsURL,
      agent: this._agent,
      apiKey: this.apiKey,
      apiSecret: this.apiSecret,
      transform: this._transform,
      plugins: this.plugins
    })

    this.wsPool.push(wsState)

    const { ev, id } = wsState

    ev.on('self:open', onWSOpen.bind(this, this, id))
    ev.on('self:reopen', onWSReopen.bind(this, this, id))
    ev.on('self:message', onWSMessage.bind(this, this, id))
    ev.on('self:close', onWSClose.bind(this, this, id))
    ev.on('self:error', onWSError.bind(this, this, id))
    ev.on('error', onWSError.bind(this, this, id))

    // Data events
    ev.on('data:notification', onWSData.bind(this, this, 'id', 'notification'))
    ev.on('data:ticker', onWSData.bind(this, this, id, 'ticker'))
    ev.on('data:trades', onWSData.bind(this, this, id, 'trades'))
    ev.on('data:candles', onWSData.bind(this, this, id, 'candles'))
    ev.on('data:book', onWSData.bind(this, this, id, 'book'))
    ev.on('data:managed:book', onWSData.bind(this, this, id, 'managed:book'))
    ev.on('data:managed:candles', onWSData.bind(this, this, id, 'managed:candles'))
    ev.on('data:book:cs', onWSData.bind(this, this, id, 'bookCS'))
    ev.on('data:auth', onWSAuthData.bind(this, this, id))

    // Other events
    ev.on('event:auth', onWSEvent.bind(this, this, id, 'auth'))
    ev.on('event:auth:success', onWSEvent.bind(this, this, id, 'auth:success'))
    ev.on('event:auth:error', onWSEvent.bind(this, this, id, 'auth:error'))
    ev.on('event:subscribed', onWSEvent.bind(this, this, id, 'subscribed'))
    ev.on('event:unsubscribed', onWSEvent.bind(this, this, id, 'unsubscribed'))
    ev.on('event:config', onWSEvent.bind(this, this, id, 'config'))
    ev.on('event:error', onWSEvent.bind(this, this, id, 'error'))
    ev.on('event:info', onWSEvent.bind(this, this, id, 'info'))
    ev.on('event:info:server-restart', onWSEvent.bind(this, this, id, 'info-server-restart'))
    ev.on('event:info:maintenance-start', onWSEvent.bind(this, this, id, 'info-maintenance-start'))
    ev.on('event:info:maintenance-end', onWSEvent.bind(this, this, id, 'info-maintenance-end'))

    ev.on('plugin:event', onPluginEvent.bind(this, this, id))

    ev.on('exec:order:submit', onOrderSubmitEvent.bind(this, this, id))
    ev.on('exec:order:update', onOrderUpdateEvent.bind(this, this, id))
    ev.on('exec:order:cancel', onOrderCancelEvent.bind(this, this, id))
    ev.on('exec:flags:set', onSetFlags.bind(this, this, { id }))

    this.notifyPlugins('ws2', 'manager', 'ws:created', { id })

    debug('created ws2 client %d', id)

    return wsState
  }

  /**
   * Creates an event handler that updates the relevant internal socket state
   * object.
   *
   * @param {string} eventName
   * @param {Object} filterValue - value(s) to check for
   * @param {Method} cb
   */
  onWS (eventName, filterValue, cb) {
    this._onWS('on', eventName, filterValue, cb)
  }

  /**
   * Creates an event handler that updates the relevant internal socket state
   * object, and only fires once
   *
   * @param {string} eventName
   * @param {Object} filterValue - value(s) to check for
   * @param {Method} cb
   */
  onceWS (eventName, filterValue, cb) {
    this._onWS('once', eventName, filterValue, cb)
  }

  /**
   * Creates an event handler that updates the relevant internal socket state
   * object.
   * @private
   *
   * @param {string} bindType - on or once
   * @param {string} eventName
   * @param {Object} filterValue - value(s) to check for
   * @param {Method} cb
   */
  _onWS (bindType, eventName, filterValue, cb) {
    this[bindType](`ws2:${eventName}`, (...eArgs) => {
      const meta = eArgs.pop()
      const { id, chanFilter } = meta
      const ws = this.getWS(id)

      // Check common filter values (i.e. n of symbol, prec, len)
      if (!_isEmpty(filterValue) && _isObject(filterValue)) {
        const fv = _pick(chanFilter, Object.keys(filterValue))

        if (!_isEqual(filterValue, fv)) {
          return
        }
      }

      const cbArgs = [...eArgs, ws]
      const nextWS = cb(...cbArgs) // eslint-disable-line

      if (!nextWS) {
        return
      }

      if (nextWS.then) {
        nextWS.then((res) => {
          if (_isObject(res)) {
            this.updateWS(id, res)
          }
        }).catch((err) => {
          debug('error in socket listener: %s', err.stack)
        })
      } else {
        if (_isObject(nextWS)) {
          this.updateWS(id, nextWS)
        }
      }
    })
  }

  /**
   * Calls every matching plugin with the provided arguments, and updates the
   * relevant ws/rest state objects internally.
   *
   * State objects are only updated if plugin handlers return valid objects
   *
   * @param {string} type - ws2 or rest2
   * @param {string} section - event section
   * @param {string} name - event name
   * @param {Object} args - plugin handler arguments
   */
  notifyPlugins (type, section, name, args = {}) {
    Object.values(this.plugins)
      .filter(p => p.type === type || type === '*')
      .forEach(p => {
        this.notifyPlugin(p, section, name, args)
      })
  }

  notifyPlugin (plugin, section, name, args = {}) {
    const { id, type } = plugin
    const func = (plugin[section] || {})[name]
    const pool = type === 'ws2'
      ? this.wsPool
      : []

    if (!_isFunction(func)) {
      return // plugin missing handler
    }

    for (let i = 0; i < pool.length; i += 1) {
      // [wsState, pluginState]
      const handlerUpdate = func({
        state: pool[i],
        ...args
      })

      const nextPluginState = _isArray(handlerUpdate)
        ? handlerUpdate[1]
        : null

      const nextWSState = _isArray(handlerUpdate)
        ? handlerUpdate[0]
        : handlerUpdate

      if (_isObject(nextWSState)) {
        pool[i] = nextWSState
      }

      if (_isObject(nextPluginState)) {
        Object.assign(pool[i].plugins[id], nextPluginState)
      }
    }
  }

  /**
   * Calls the provided function with a connection instance that can subscribe
   * to at least 1 more data channel. If no such connection is found, a new one
   * is opened.
   *
   * @param {Function} cb
   */
  withFreeDataSocket (cb) {
    const freeSocketI = this.wsPool.findIndex(ws => (
      dataChannelCount(ws) < this._channelsPerSocket
    ))

    if (freeSocketI !== -1) {
      this.applyWS(freeSocketI, cb)
      return
    }

    // spawn new socket if needed
    debug('spawning new socket for data subscriptions...')

    const wsState = this.openWS()
    const i = this.wsPool.length - 1
    const { ev } = wsState

    ev.once('self:open', () => {
      this.applyWS(i, cb)
    })
  }

  /**
   * Calls the provided function with a connection instance that is subscribed
   * to a channel matching the provided filter callback, which is called with
   * each subscribed channel descriptor.
   *
   * @param {Function} filterCB
   * @param {Function} cb
   */
  withDataSocket (filterCb, cb) {
    const wsI = this.wsPool.findIndex(ws => {
      const { channels } = ws

      return Object.values(channels).findIndex(filterCb) !== -1
    })

    if (wsI === -1) {
      return
    }

    this.applyWS(wsI, cb)
  }

  /**
   * Calls the provided function with an authenticated socket instance; updates
   * the socket state with the returned result.
   *
   * @param {Function} cb
   */
  withAuthSocket (cb) {
    const wsI = this.wsPool.findIndex(ws => ws.authenticated)

    if (wsI === -1) {
      debug('no authenticated socket available!')
      return
    }

    this.applyWS(wsI, cb)
  }

  /**
   * Calls the provided function with a random open connection instance. If none
   * exists, this is a no-op.
   *
   * @param {Function} cb
   */
  withSocket (cb) {
    if (_isEmpty(this.wsPool)) {
      debug('no sockets available!')
      return
    }

    const wsI = Math.floor(Math.random() * this.wsPool.length)
    this.applyWS(wsI, cb)
  }

  /**
   * Returns a random connection from the pool
   *
   * @return {Object} state
   */
  sampleWS () {
    const wsI = this.sampleWSI()
    return this.wsPool[wsI]
  }

  /**
   * Returns a random connection index from the pool
   *
   * @return {number} index
   */
  sampleWSI () {
    return Math.floor(Math.random() * this.wsPool.length)
  }

  /**
   * Calls the provided callback with the connection at the specified pool
   * index, and saves the return value as the new connection instance.
   *
   * @param {number} index
   * @param {Function} cb
   */
  applyWS (i, cb) {
    const nextState = cb(this.wsPool[i])

    if (_isObject(nextState)) {
      this.wsPool[i] = nextState
      this.emit('socket:updated', i, nextState)
    }
  }
}

module.exports = Manager
