'use strict'

const debug = require('debug')('bfx:api:manager')
const { RESTv2 } = require('bfx-api-node-rest')
const _isFinite = require('lodash/isFunction')
const _isFunction = require('lodash/isFunction')
const _isObject = require('lodash/isObject')
const _isArray = require('lodash/isArray')
const _isEmpty = require('lodash/isEmpty')
const _isString = require('lodash/isString')
const _isEqual = require('lodash/isEqual')
const _values = require('lodash/values')
const _keyBy = require('lodash/keyBy')
const _some = require('lodash/some')
const _pick = require('lodash/pick')
const { EventEmitter } = require('events')
const WebSocket = require('ws')

const { REST_URL, WS_URL } = require('./config')
const dataChannelCount = require('./ws2/channels/data_count')
const initWSState = require('./ws2/init_state')
const authWS = require('./ws2/auth')
const reopenWS = require('./ws2/reopen')

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
 *
 * @example
 * const debug = require('debug')('example')
 * const { subscribe, Manager } = require('bfx-api-node-core')
 * const SYMBOL = 'tBTCUSD'
 *
 * debug('opening connection...')
 *
 * const m = new Manager({ transform: true })
 * const wsState = m.openWS()
 *
 * m.on('ws2:open', () => debug('connection opened'))
 * m.on('ws2:close', () => debug('connection closed'))
 * m.on('ws2:trades', (trades, meta) => {
 *   const { chanFilter } = meta
 *   const { symbol, pair } = chanFilter
 *   const [trade] = trades
 *   const nTrades = trades.length
 *
 *   debug('recv %d trades on for symbol %s [pair %s]', nTrades, symbol, pair)
 *   debug(
 *     'latest trade: id %s, price %d, amount %d, mts: %s',
 *     trade.id, trade.price, trade.amount, new Date(trade.mts).toLocaleString()
 *   )
 * })
 *
 * debug('subscribing to trades channel %s', SYMBOL)
 *
 * subscribe(wsState, 'trades', { symbol: SYMBOL })
 *
 * @class
 * @augments EventEmitter
 * @memberof module:bfx-api-node-core
 */
class Manager extends EventEmitter {
  /**
   * @param {object} [args={}] - arguments
   * @param {string} [args.wsURL='wss://api.bitfinex.com/ws/2'] - defaults to
   *   production Bitfinex WSv2 API url
   * @param {string} [args.restURL='https://api.bitfinex.com'] - defaults to
   *   production Bitfinex RESTv2 API url
   * @param {object} [args.agent] - connection agent
   * @param {string} [args.apiKey] - used to authenticate sockets
   * @param {string} [args.apiSecret] - used to authenticate sockets
   * @param {boolean} [args.autoResubscribe=true] - enables automatic
   *   subscribing to previously subscribed channels on reconnect
   * @param {number} [args.channelsPerSocket=30] - max data channel
   *   subscriptions per WSv2 client
   * @param {number} [args.dms=0] - dead-man-switch flag sent on auth, active 4
   * @param {number} [args.calc=0] - calc
   * @param {boolean} [args.transform] - if true, raw API data arrays will be
   *   automatically converted to bfx-api-node-models instances
   * @param {object} [args.plugins] - optional set of plugins to use
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
   * Update authentication arguments used for all connections on auth. Provided
   * args are merged with existing ones.
   *
   * @param {module:bfx-api-node-core.AuthArgs} args - args
   */
  updateAuthArgs (args = {}) {
    this.authArgs = {
      ...this.authArgs,
      ...args
    }
  }

  /**
   * Check for plugin existence by ID
   *
   * @param {module:bfx-api-node-core.Plugin} plugin - plugin
   * @returns {boolean} hasPlugin
   */
  hasPlugin (plugin = {}) {
    return !!this.plugins[plugin.id]
  }

  /**
   * No-op if the plugin is already registered
   *
   * @param {module:bfx-api-node-core.Plugin} plugin - plugin
   */
  addPlugin (plugin = {}) {
    if (this.plugins[plugin.id]) {
      debug('plugin %s already registered', plugin.id)
      return
    }

    this.plugins[plugin.id] = plugin
  }

  /**
   * Authenticates all open API connections, and updates auth arguments used
   * for future connections with those provided.
   *
   * @param {module:bfx-api-node-core.FullAuthArgs} [args] - defaults to values
   *   provided to constructor
   */
  auth (args = {}) {
    const { apiKey, apiSecret, dms, calc } = args

    if (_isString(apiKey)) this.apiKey = apiKey
    if (_isString(apiSecret)) this.apiSecret = apiSecret
    if (_isFinite(calc)) this.authArgs.calc = calc
    if (_isFinite(dms)) this.authArgs.dms = dms

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
   * @returns {module:bfx-api-node-core.SocketState} state - connection state
   */
  getWS (id) {
    return this.wsPool.find(s => s.id === id)
  }

  /**
   * Returns the index of a connection within the internal pool by ID
   *
   * @param {number} id - connection ID
   * @returns {number} index - within internal pool
   */
  getWSIndex (id) {
    return this.wsPool.findIndex(s => s.id === id)
  }

  /**
   * Returns a connection state object by pool index
   *
   * @param {number} index - within internal pool
   * @returns {module:bfx-api-node-core.SocketState} state - connection state
   */
  getWSByIndex (index) {
    return this.wsPool[index]
  }

  /**
   * Updates an internal connection by ID, emitting the socket:updated event
   * if the connection exists.
   *
   * @param {number} id - id
   * @param {module:bfx-api-node-core.SocketState} state - new connection state
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
   * Closes and re-opens all connections in the pool
   */
  reconnectAllSockets () {
    for (let i = 0; i < this.wsPool.length; i += 1) {
      this.wsPool[i] = reopenWS(this.wsPool[i])
    }
  }

  /**
   * Closes a connection by ID, no-op if the connection is not found.
   *
   * @param {number} id - id
   */
  closeWS (id) {
    const wsIndex = this.getWSIndex(id)

    if (wsIndex === -1) {
      debug('tried to close unknown ws client: %d', id)
      return
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
   * @returns {module:bfx-api-node-core.SocketState} connection
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
   * @param {string} eventName - event name
   * @param {object} filterValue - value(s) to check for
   * @param {Function} cb - callback
   */
  onWS (eventName, filterValue, cb) {
    this._onWS('on', eventName, filterValue, cb)
  }

  /**
   * Creates an event handler that updates the relevant internal socket state
   * object, and only fires once
   *
   * @param {string} eventName - event name
   * @param {object} filterValue - value(s) to check for
   * @param {Function} cb - callback
   */
  onceWS (eventName, filterValue, cb) {
    this._onWS('once', eventName, filterValue, cb)
  }

  /**
   * Creates an event handler that updates the relevant internal socket state
   * object.
   *
   * @private
   *
   * @param {string} bindType - on or once
   * @param {string} eventName - event name
   * @param {object} filterValue - value(s) to check for
   * @param {Function} cb - callback
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

          return null
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
   * @see module:bfx-api-node-core.Manager#notifyPlugin
   *
   * @param {string} type - ws2 or rest2
   * @param {string} section - event section
   * @param {string} name - event name
   * @param {object} args - plugin handler arguments
   */
  notifyPlugins (type, section, name, args = {}) {
    Object.values(this.plugins)
      .filter(p => p.type === type || type === '*')
      .forEach(p => {
        this.notifyPlugin(p, section, name, args)
      })
  }

  /**
   * Calls the identified plugin with the provided arguments, and updates the
   * relevant ws/rest state objects internally.
   *
   * State objects are only updated if plugin handlers return valid objects
   *
   * @see module:bfx-api-node-core.Manager#notifyPlugins
   *
   * @param {object} plugin - plugin identifier
   * @param {string} plugin.id - plugin ID
   * @param {string} plugin.type - plugin type
   * @param {string} section - event section
   * @param {string} name - event name
   * @param {object} args - plugin handler arguments
   */
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
   * @param {Function} cb - callback
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
   * @param {Function} filterCB - filter callback, called with each channel on
   *   each socket to find the desired data channel.
   * @param {Function} cb - callback, called with identified socket. Not called
   *   if `filterCB` fails to identify a valid socket.
   */
  withDataSocket (filterCB, cb) {
    const wsI = this.wsPool.findIndex(ws => {
      const { channels = {} } = ws

      return _some(_values(channels), filterCB)
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
   * @param {Function} cb - callback
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
   * @param {Function} cb - callback
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
   * @returns {module:bfx-api-node-core.SocketState} state
   */
  sampleWS () {
    const wsI = this.sampleWSI()
    return this.wsPool[wsI]
  }

  /**
   * Returns a random connection index from the pool
   *
   * @returns {number} index
   */
  sampleWSI () {
    return Math.floor(Math.random() * this.wsPool.length)
  }

  /**
   * Calls the provided callback with the connection at the specified pool
   * index, and saves the return value as the new connection instance.
   *
   * @param {number} i - socket index
   * @param {Function} cb - callback
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
