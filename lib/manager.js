'use strict'

const debug = require('debug')('bfx:api:manager')
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
      transform
    } = args

    this._restURL = restURL
    this._wsURL = wsURL
    this._transform = transform
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
    this.emit('ws2:open', { id })
  }

  onWSClose (id) {
    debug('ws client connection closed (%d)', id)
    this.emit('ws2:close', { id })
  }

  onWSError (id, err) {
    debug('ws client (%d) error: %j', id, err)
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

    this.emit('ws2:message', msg, flags, { id })

    const stateUpdate = onWSMessage(ws, msg, flags) // external

    if (_isObject(stateUpdate)) {
      this.updateWS(id, stateUpdate)
    }
  }

  onWSData (id, type, data) {
    const { requested, chanFilter } = data

    this.emit(`ws2:${type}`, requested, {
      chanFilter,
      id,
    })
  }
}
