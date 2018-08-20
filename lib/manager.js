'use strict'

const debug = require('debug')('bfx:api:manager')
const _isFunction = require('lodash/isFunction')
const _isObject = require('lodash/isObject')
const _isEmpty = require('lodash/isEmpty')
const _isEqual = require('lodash/isEqual')
const _pick = require('lodash/pick')
const { EventEmitter } = require('events')

const { REST_URL, WS_URL } = require('./config')
const openWS = require('./ws2/open')
const onWSMessage = require('./ws2/on_message')

module.exports = class Manager extends EventEmitter {
  constructor (args = {}) {
    super()

    const {
      restURL = REST_URL,
      wsURL = WS_URL,
      plugins = [],
      transform,
    } = args

    this._restURL = restURL
    this._wsURL = wsURL
    this._transform = transform
    this._plugins = plugins
    this._wsPool = []
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
      ws.close(0, 'closed by manager')
    }

    this._wsPool.splice(wsIndex, 1)
  }

  openWS (url, agent) {
    const wsState = openWS({
      transform: this._transform,
    }, url, agent)

    this._wsPool.push(wsState)

    const { ev, id } = wsState

    ev.on('open', this.onWSOpen.bind(this, id))
    ev.on('message', this.onWSMessage.bind(this, id))
    ev.on('error', this.onWSError.bind(this, id))
    ev.on('close', this.onWSClose.bind(this, id))

    // Data events
    ev.on('data:ticker', this.onWSData.bind(this, id, 'ticker'))
    ev.on('data:trades', this.onWSData.bind(this, id, 'trades'))
    ev.on('data:candles', this.onWSData.bind(this, id, 'candles'))
    ev.on('data:book', this.onWSData.bind(this, id, 'book'))
    ev.on('data:book:cs', this.onWSData.bind(this, id, 'bookCS'))

    // Other events
    ev.on('auth', this.onWSEvent.bind(this, id, 'subscribed'))
    ev.on('auth:success', this.onWSEvent.bind(this, id, 'auth:success'))
    ev.on('auth:error', this.onWSEvent.bind(this, id, 'auth:error'))
    ev.on('subscribed', this.onWSEvent.bind(this, id, 'subscribed'))
    ev.on('unsubscribed', this.onWSEvent.bind(this, id, 'unsubscribed'))
    ev.on('info', this.onWSEvent.bind(this, id, 'info'))
    ev.on('config', this.onWSEvent.bind(this, id, 'config'))
    ev.on('error', this.onWSEvent.bind(this, id, 'error'))

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

    this.notifyPlugins('ws2', 'ws', 'open', { id })
    this.emit('ws2:open', { id })
  }

  onWSClose (id) {
    debug('ws client connection closed (%d)', id)

    this.notifyPlugins('ws2', 'ws', 'close', { id })
    this.emit('ws2:close', { id })
    this.closeWS(id)
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
  }

  onWSData (id, type, data) {
    const { requested, chanFilter } = data

    this.notifyPlugins('ws2', 'data', type, { id, data })
    this.emit(`ws2:${type}`, requested, {
      chanFilter,
      id,
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
    const pool = type === 'ws2'
      ? this._wsPool
      : [] // TODO: rest pool (of 1 to remain isomorphic)

    this._plugins
      .filter(p => p.type === type)
      .forEach(p => {
        const func = (p[section] || {})[name]

        if (!_isFunction(func)) {
          return // plugin missing handler
        }

        for (let i = 0; i < pool.length; i += 1) {
          const nextState = func({
            state: pool[i],
            ...args,
          })

          if (_isObject(nextState)) {
            pool[i] = nextState
          }
        }
      })
  }
}
