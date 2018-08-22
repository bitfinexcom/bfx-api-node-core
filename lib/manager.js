'use strict'

const debug = require('debug')('bfx:api:manager')
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
const flushSendBuffer = require('./ws2/flush_send_buffer')
const initWSState = require('./ws2/init_state')
const onWSMessage = require('./ws2/on_message')
const getMsgPayload = require('./util/msg_payload')
const setFlagsWS = require('./ws2/flags/set')
const sendWS = require('./ws2/send')
const authWS = require('./ws2/auth')

module.exports = class Manager extends EventEmitter {
  constructor (args = {}) {
    super()

    const {
      apiKey,
      apiSecret,
      channelsPerSocket = 50,
      restURL = REST_URL,
      wsURL = WS_URL,
      plugins = [],
      transform,
      agent,
    } = args

    this._agent = agent
    this._apiKey = apiKey
    this._apiSecret = apiSecret
    this._restURL = restURL
    this._wsURL = wsURL
    this._transform = transform
    this._channelsPerSocket = channelsPerSocket
    this._plugins = _keyBy(plugins, p => p.id)
    this._wsPool = []
  }

  hasPlugin (p = {}) {
    return !!this._plugins[p.id]
  }

  addPlugin (p = {}) {
    if (this._plugins[p.id]) {
      debug('plugin %s already registered', p.id)
      return
    }

    this._plugins[p.id] = p
  }

  auth({ apiKey, apiSecret, dms = 0, calc = 0 } = {}) {
    if (_isString(apiKey)) this._apiKey = apiKey
    if (_isString(apiSecret)) this._apiSecret = apiSecret

    for (let i = 0; i < this._wsPool.length; i += 1) {
      const ws = this._wsPool[i]
      const { authenticated } = ws

      if (!authenticated) {
        const nextWS = {
          ...ws,
          apiKey: this._apiKey,
          apiSecret: this._apiSecret,
        }

        authWS(nextWS, { dms, calc })
        this._wsPool[i] = nextWS
      }
    }
  }

  getWS (id) {
    return this._wsPool.find(s => s.id === id)
  }

  getWSIndex (id) {
    return this._wsPool.findIndex(s => s.id === id)
  }

  updateWS (id, state) {
    const i = this.getWSIndex(id)

    if (i !== -1) {
      this._wsPool[i] = state
    }
  }

  closeAllSockets () {
    while (this._wsPool.length > 0) {
      this.closeWS(this._wsPool[0].id)
    }
  }

  closeWS (id) {
    const wsIndex = this.getWSIndex(id)

    if (wsIndex === -1) {
      debug('tried to close unknown ws client: %d', id)
      return null
    }

    this.notifyPlugins('ws2', 'manager', 'ws:destroyed', { id })

    const wsState = this._wsPool[wsIndex]
    const { ws } = wsState

    if (ws.readyState !== WebSocket.CLOSED) {
      ws.close()
    }

    this._wsPool.splice(wsIndex, 1)
  }

  openWS (url, agent) {
    const wsState = initWSState({
      url: this._wsURL,
      agent: this._agent,
      apiKey: this._apiKey,
      apiSecret: this._apiSecret,
      transform: this._transform,
      plugins: this._plugins,
    })

    this._wsPool.push(wsState)

    const { ev, id } = wsState

    ev.on('self:open', this.onWSOpen.bind(this, id))
    ev.on('self:message', this.onWSMessage.bind(this, id))
    ev.on('self:error', this.onWSError.bind(this, id))
    ev.on('self:close', this.onWSClose.bind(this, id))

    // Data events
    ev.on('data:ticker', this.onWSData.bind(this, id, 'ticker'))
    ev.on('data:trades', this.onWSData.bind(this, id, 'trades'))
    ev.on('data:candles', this.onWSData.bind(this, id, 'candles'))
    ev.on('data:book', this.onWSData.bind(this, id, 'book'))
    ev.on('data:book:cs', this.onWSData.bind(this, id, 'bookCS'))
    ev.on('data:auth', this.onWSAuthData.bind(this, id))

    // Other events
    ev.on('event:auth', this.onWSEvent.bind(this, id, 'subscribed'))
    ev.on('event:auth:success', this.onWSEvent.bind(this, id, 'auth:success'))
    ev.on('event:auth:error', this.onWSEvent.bind(this, id, 'auth:error'))
    ev.on('event:subscribed', this.onWSEvent.bind(this, id, 'subscribed'))
    ev.on('event:unsubscribed', this.onWSEvent.bind(this, id, 'unsubscribed'))
    ev.on('event:info', this.onWSEvent.bind(this, id, 'info'))
    ev.on('event:config', this.onWSEvent.bind(this, id, 'config'))
    ev.on('event:error', this.onWSEvent.bind(this, id, 'error'))

    ev.on('plugin:event', this.onPluginEvent.bind(this, id))

    ev.on('exec:order:submit', this.onOrderSubmitEvent.bind(this, id))
    ev.on('exec:order:cancel', this.onOrderCancelEvent.bind(this, id))
    ev.on('exec:flags:set', this.onSetFlags.bind(this, { id }))

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
    this.on(`ws2:${eventName}`, (...eArgs) => {
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
      const nextWS = cb(...cbArgs)

      if (_isObject(nextWS)) {
        this.updateWS(id, nextWS)
      }
    })
  }

  onWSOpen (id) {
    debug('ws client connection opened (%d)', id)

    const prevWSState = this.getWS(id)
    const ws = flushSendBuffer({
      ...prevWSState,
      isOpen: true,
    })

    this.updateWS(id, ws)
    this.notifyPlugins('ws2', 'ws', 'open', { id })
    this.emit('ws2:open', { id })
  }

  onWSClose (id) {
    const ws = this.getWS(id)

    if (!ws) {
      debug('ws connection closed unsafely: %d', id)
      return
    }

    const { managedClose } = ws

    debug('ws client connection closed (%d)', id)

    this.notifyPlugins('ws2', 'ws', 'close', { id })
    this.emit('ws2:close', { id })

    if (!managedClose) {
      debug('removing connection')
      this.closeWS(id)
    }
  }

  onWSError (id, err) {
    debug('ws client (%d) error: %s', id, err.message)

    this.notifyPlugins('ws2', 'ws', 'error', { id, err })
    this.emit('ws2:error', err, { id })
  }

  onWSMessage (id, msgJSON = '', flags) {
    const ws = this.getWS(id)

    let msg

    try {
      msg = JSON.parse(msgJSON)
    } catch (e) {
      this.emit('error', `invalid message JSON: ${msgJSON}`)
      return
    }

    this.notifyPlugins('ws2', 'ws', 'message', { id, msg, flags })
    this.emit('ws2:message', msg, flags, { id })

    const stateUpdate = onWSMessage(ws, msg, flags) // external

    if (_isObject(stateUpdate)) {
      this.updateWS(id, stateUpdate)
    }
  }

  onWSEvent (id, type, data) {
    this.notifyPlugins('ws2', 'events', type, { id, data })
    this.emit(`ws2:event:${type}`, data, { id })
  }

  onWSData (id, type, data) {
    const { requested, chanFilter } = data

    this.notifyPlugins('ws2', 'data', type, { id, data })
    this.emit(`ws2:${type}`, requested, {
      chanFilter,
      id,
    })
  }

  onWSAuthData (id, data) {
    const [, type] = data // type is 'te', 'tu', etc..
    const payload = getMsgPayload(data)

    this.notifyPlugins('ws2', 'auth', type, { id, data: payload })
    this.emit(`ws2:auth:${type}`, payload, { id })
  }

  onPluginEvent (wsID, pluginID, label, args) {
    const plugin = this._plugins[pluginID]

    if (!plugin) {
      throw new Error(
        `recv event ${label} for unknown plugin ${pluginID}`
      )
    }

    this.notifyPlugin(plugin, 'self', label, args)
  }

  onOrderSubmitEvent (wsID, packet) {
    const ws = this.getWS(wsID)

    sendWS(ws, [0, 'on', null, packet])
  }

  onOrderCancelEvent (wsID, id) {
    const ws = this.getWS(wsID)

    sendWS(ws, [0, 'oc', null, { id }])
  }

  /**
   * Called when flags are updated for a single socket; sets the same flags on
   * all other sockets.
   *
   * @param {number} wsID
   * @param {number} flags
   */
  onSetFlags (wsID, flags) {
    this._wsPool.forEach((ws, i) => {
      const { id } = ws

      if (id === wsID) {
        return
      }

      this._wsPool[i] = setFlagsWS(ws, flags)
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
    Object.values(this._plugins)
      .filter(p => p.type === type || type === '*')
      .forEach(p => {
        this.notifyPlugin(p, section, name, args)
      })
  }

  notifyPlugin (plugin, section, name, args = {}) {
    const { id, type } = plugin
    const func = (plugin[section] || {})[name]
    const pool = type === 'ws2'
      ? this._wsPool
      : [] // TODO: rest pool (of 1 to remain isomorphic)

 
    if (!_isFunction(func)) {
      return // plugin missing handler
    }

    for (let i = 0; i < pool.length; i += 1) {
      // [wsState, pluginState]
      const handlerUpdate = func({
        state: pool[i],
        ...args,
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

  withFreeDataSocket (cb) {
    let freeSocketI = this._wsPool.findIndex(ws => (
      dataChannelCount(ws) < this._channelsPerSocket
    ))

    if (freeSocketI !== -1) {
      this.applyWS(freeSocketI, cb)
      return
    }

    // spawn new socket if needed
    debug('spawning new socket for data subscriptions...')

    const wsState = this.openWS()
    const i = this._wsPool.length - 1
    const { ev } = wsState

    ev.once('self:open', () => {
      this.applyWS(i, cb)
    })
  }

  withDataSocket (filterCb, cb) {
    const wsI = this._wsPool.findIndex(ws => {
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
   * TODO: Decide how to spawn a new auth socket if needed; if any socket is
   *       authenticated, all future sockets are also authenticated. So toggling
   *       the auth status of a single socket is difficult to track.
   *
   * @param {Function} cb
   */
  withAuthSocket (cb) {
    const wsI = this._wsPool.findIndex(ws => ws.authenticated)

    if (wsI === -1) {
      debug('no authenticated socket available!')
      return
    }

    this.applyWS(wsI, cb)
  }

  withSocket (cb) {
    if (_isEmpty(this._wsPool)) {
      debug('no sockets available!')
      return
    }

    const wsI = Math.floor(Math.random() * this._wsPool.length)
    this.applyWS(wsI, cb)
  }

  sampleWS () {
    const wsI = Math.floor(Math.random() * this._wsPool.length)
    return this._wsPool[wsI]
  }

  applyWS (i, cb) {
    const nextState = cb(this._wsPool[i])

    if (_isObject(nextState)) {
      this._wsPool[i] = nextState
    }
  }
}
