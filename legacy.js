'use strict'

const { EventEmitter } = require('events')
const _isEmpty = require('lodash/isEmpty')
const _isEqual = require('lodash/isEqual')
const _isString = require('lodash/isString')
const _pick = require('lodash/pick')
const WSv1 = require('bfx-api-node-ws1')
const Promise = require('bluebird')

const { RESTv1, RESTv2 } = require('bfx-api-node-rest')
const SeqAuditPlugin = require('bfx-api-node-plugin-seq-audit')

const Config = require('./lib/config')
const Manager = require('./lib/manager')
const sendWS = require('./lib/ws2/send')
const setFlagWS = require('./lib/ws2/flags/set')
const submitOrderWS = require('./lib/ws2/orders/submit')
const updateOrderWS = require('./lib/ws2/orders/update')
const cancelOrderWS = require('./lib/ws2/orders/cancel')
const subscribeWS = require('./lib/ws2/subscribe')
const unsubscribeWS = require('./lib/ws2/unsubscribe')
const findChannelId = require('./lib/ws2/find_channel_id')

const authMessageTypes = [
  'te', 'tu',
  'os', 'ou', 'on', 'oc',
  'ps', 'pn', 'pu', 'pc',
  'fos', 'fon', 'fou', 'foc',
  'fcs', 'fcn', 'fcu', 'fcc',
  'fls', 'fln', 'flu', 'flc',
  'ws', 'wu', 'bu',
  'miu', 'fiu',
  'fte', 'ftu'
]

module.exports = class LegacyWrapper extends EventEmitter {
  /**
   * @param {Object} opts
   * @param {string} opts.apiKey
   * @param {string} opts.apiSecret
   * @param {string} opts.transform - if true, packets are converted to models
   * @param {string} opts.nonceGenerator - optional
   * @param {string} opts.ws - ws transport options
   * @param {string} opts.rest - rest transport options
   */
  constructor (opts = {
    apiKey: '',
    apiSecret: '',
    transform: false,
    ws: {},
    rest: {}
  }) {
    super()

    this._manager = null
    this._apiKey = opts.apiKey || ''
    this._apiSecret = opts.apiSecret || ''
    this._transform = opts.transform === true
    this._wsArgs = opts.ws || {}
    this._restArgs = opts.rest || {}
    this._transportCache = {
      rest: {},
      ws: {}
    }

    this._ws2Listeners = {}
  }

  _getTransportPayload (extraOpts) {
    return {
      apiKey: this._apiKey,
      apiSecret: this._apiSecret,
      transform: this._transform,

      ...extraOpts
    }
  }

  /**
   * Returns a new REST API class instance (cached by version)
   *
   * @param {number} version - 1 or 2 (default)
   * @param {Object} extraOpts - passed to transport constructor
   * @return {RESTv1|RESTv2} transport
   */
  rest (version = 2, extraOpts = {}) {
    if (version !== 1 && version !== 2) {
      throw new Error(`invalid http API version: ${version}`)
    }

    const key = `${version}|${JSON.stringify(extraOpts)}`

    if (!this._transportCache.rest[key]) {
      Object.assign(extraOpts, this._restArgs)
      const payload = this._getTransportPayload(extraOpts)

      this._transportCache.rest[key] = version === 2
        ? new RESTv2(payload)
        : new RESTv1(payload)
    }

    return this._transportCache.rest[key]
  }

  /**
   * Returns a new WebSocket API class instance (cached by version)
   *
   * @param {number} version - 1 or 2 (default)
   * @param {Object} extraOpts - passed to transport constructor
   * @return {WSv1|WSv2} transport
   */
  ws (version = 2, extraOpts = {}) {
    if (version !== 1 && version !== 2) {
      throw new Error(`invalid websocket API version: ${version}`)
    }

    if (version === 2) {
      if (this._manager === null) {
        this.initManager({
          ...this._wsArgs,
          ...extraOpts
        })
      }

      return this
    }

    const key = `${version}|${JSON.stringify(extraOpts)}`

    if (!this._transportCache.ws[key]) {
      Object.assign(extraOpts, this._wsArgs)
      const payload = this._getTransportPayload(extraOpts)

      this._transportCache.ws[key] = new WSv1(payload)
    }

    return this._transportCache.ws[key]
  }

  open () {
    if (this._manager === null) {
      this.initManager()
    }

    this._manager.openWS()
  }

  auth (calc, dms) {
    if (this._manager === null) {
      this.initManager()
    }

    this._manager.auth({
      apiKey: this._apiKey,
      apiSecret: this._apiSecret,
      calc,
      dms
    })
  }

  close () {
    if (this._manager !== null) {
      this._manager.closeAllSockets()
    }
  }

  initManager (opts = {}) {
    const managerArgs = this._getTransportPayload(opts)

    // NOTE: Rename WS endpoint URL to maintain legacy signature
    managerArgs.wsURL = managerArgs.url
    delete managerArgs.url

    this._manager = new Manager(managerArgs)
    this._manager.on('ws2:open', () => this.emit('open'))
    this._manager.on('ws2:message', (msg) => this.emit('message', msg))
    this._manager.on('ws2:event:auth:success', () => this.emit('auth'))

    this.mapManagerListenerEvent(
      'ws2:event:info-server-restart',
      'info-server-restart'
    )

    this.mapManagerListenerEvent(
      'ws2:event:info-maintenance-start',
      'info-maintenance-start'
    )

    this.mapManagerListenerEvent(
      'ws2:event:info-maintenance-end',
      'info-maintenance-end'
    )

    this.mapManagerListenerEvent('ws2:candles', 'candles')
    this.mapManagerListenerEvent('ws2:trades', 'trades')
    this.mapManagerListenerEvent('ws2:ticker', 'ticker')
    this.mapManagerListenerEvent('ws2:bookCS', 'bookCS')
    this.mapManagerListenerEvent('ws2:book', 'book')

    authMessageTypes.forEach(type => {
      this.mapManagerListenerEvent(`ws2:auth:${type}`, type)
    })
  }

  mapManagerListenerEvent (managerEventName, listenerEventName) {
    this._manager.on(managerEventName, (data, meta = {}) => {
      this.notifyListeners(listenerEventName, meta, data)
    })
  }

  notifyListeners (type, meta, data) {
    const { chanFilter } = meta

    Object.values(this._ws2Listeners).forEach(group => {
      const listeners = [
        ...(group[type] || []),
        ...(group[''] || []) // include catch-all
      ]

      listeners.forEach(l => {
        if (!_isEmpty(chanFilter)) { // optional
          const fv = _pick(chanFilter, Object.keys(l.filter))

          if (!_isEqual(l.filter, fv)) {
            return
          }
        }

        l.cb(data)
      })
    })
  }

  registerListener (type, filter, id, cb) {
    if (!this._ws2Listeners[id]) {
      this._ws2Listeners[id] = { [type]: [] }
    }

    const listeners = this._ws2Listeners[id]

    if (!listeners[type]) {
      listeners[type] = []
    }

    listeners[type].push({
      cb,
      filter
    })
  }

  /// //////////////////////////////
  // Legacy subscription methods //
  /// //////////////////////////////

  subscribeCandles (key) {
    this._manager.withFreeDataSocket((state = {}) => {
      return subscribeWS(state, 'candles', { key })
    })
  }

  subscribeTrades (symbol) {
    this._manager.withFreeDataSocket((state = {}) => {
      return subscribeWS(state, 'trades', { symbol })
    })
  }

  subscribeOrderBook (symbol, prec = 'P0', len = '25') {
    this._manager.withFreeDataSocket((state = {}) => {
      return subscribeWS(state, 'book', { symbol, prec, len })
    })
  }

  subscribeTicker (symbol) {
    this._manager.withFreeDataSocket((state = {}) => {
      return subscribeWS(state, 'ticker', { symbol })
    })
  }

  unsubscribeTicker (symbol) {
    const comp = c => {
      if (c.channel !== 'candles') return false
      if (symbol && c.symbol !== symbol) return false
      return true
    }

    this._manager.withDataSocket(comp, (state = {}) => {
      const chanId = findChannelId(state, comp)
      return unsubscribeWS(state, chanId)
    })
  }

  unsubscribeTrades (symbol) {
    const comp = c => {
      if (c.channel !== 'candles') return false
      if (symbol && c.symbol !== symbol) return false
      return true
    }

    this._manager.withDataSocket(comp, (state = {}) => {
      const chanId = findChannelId(state, comp)
      return unsubscribeWS(state, chanId)
    })
  }

  unsubscribeOrderBook (symbol, prec, len) {
    const comp = c => {
      if (c.channel !== 'book') return false
      if (symbol && c.symbol !== symbol) return false
      if (prec && c.prec !== prec) return false
      if (len && c.len !== len) return false
      return true
    }

    this._manager.withDataSocket(comp, (state = {}) => {
      const chanId = findChannelId(state, comp)
      return unsubscribeWS(state, chanId)
    })
  }

  // NOTE: Changed sig from (symbol, frame)
  unsubscribeCandles (key) {
    const comp = c => {
      if (c.channel !== 'candles') return false
      if (key && c.key !== key) return false
      return true
    }

    this._manager.withDataSocket(comp, (state = {}) => {
      const chanId = findChannelId(state, comp)
      return unsubscribeWS(state, chanId)
    })
  }

  /// //////////////////////
  // Misc legacy methods //
  /// //////////////////////

  send (msg) {
    this._manager.withAuthSocket((state = {}) => {
      sendWS(state, msg)
    })
  }

  /**
   * @param {string[]} prefixes
   */
  requestCalc (prefixes) {
    this._manager.withAuthSocket((state = {}) => {
      return sendWS(state, [0, 'calc', null, prefixes.map(p => [p])])
    })
  }

  submitOrder (o) {
    return new Promise((resolve, reject) => {
      this._manager.withAuthSocket((state = {}) => {
        submitOrderWS(state, o).then(resolve).catch(reject)
      })
    })
  }

  cancelOrder (o) {
    return new Promise((resolve, reject) => {
      this._manager.withAuthSocket((state = {}) => {
        cancelOrderWS(state, o).then(resolve).catch(reject)
      })
    })
  }

  cancelOrders (os) {
    return Promise.all(os.map(o => this.cancelOrder(o)))
  }

  updateOrder (changes) {
    return new Promise((resolve, reject) => {
      this._manager.withAuthSocket((state = {}) => {
        updateOrderWS(state, changes).then(resolve).catch(reject)
      })
    })
  }

  enableSequencing ({ audit } = {}) {
    if (!this._manager) {
      return
    }

    if (audit && !this._manager.hasPlugin(SeqAuditPlugin)) {
      this._manager.addPlugin(SeqAuditPlugin)
    }

    return new Promise((resolve, reject) => {
      this._manager.withSocket((state = {}) => {
        const { ev } = state

        ev.once('event:config', (msg = {}) => {
          const { status } = msg

          if (status !== 'OK') {
            reject(msg)
          } else {
            resolve(msg)
          }
        })

        return setFlagWS(state, Config.FLAGS.SEQ_ALL)
      })
    })
  }

  isFlagEnabled (flag) {
    if (!this._manager) {
      return false
    }

    const ws = this._manager.sampleWS()

    if (!ws) {
      return false
    }

    const { flags } = ws
    return flags & flag
  }

  /**
   * Sends a broadcast notification, which will be received by any active UI
   * websocket connections (at bitfinex.com), triggering a desktop notification.
   *
   * In the future our mobile app will also support spawning native push
   * notifications in response to incoming ucm-notify-ui packets.
   *
   * @param {Object} opts
   * @param {string?} opts.message
   * @param {string?} opts.type
   * @param {string?} opts.level
   * @param {string?} opts.image
   * @param {string?} opts.link
   * @param {string?} opts.sound
   */
  notifyUI (opts = {}) {
    const { type, message, level, image, link, sound } = opts

    if (!_isString(type) || !_isString(message)) {
      throw new Error(`notified with invalid type/message: ${type}/${message}`)
    }

    this._manager.withAuthSocket((state = {}) => {
      sendWS(state, [0, 'n', null, {
        type: 'ucm-notify-ui',
        info: {
          type,
          message,
          level,
          image,
          link,
          sound
        }
      }])
    })
  }

  /// //////////////////////////
  // Legacy listener methods //
  /// //////////////////////////

  /**
   * @param {Object} opts
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   */
  onMessage ({ cbGID }, cb) {
    this.registerListener('', {}, cbGID, cb)
  }

  /**
   * Register a callback in case of a ws server restart message; Use this to
   * call reconnect() if needed. (code 20051)
   *
   * @param {Object} opts
   * @param {string} opts.cbGID
   * @param {method} cb
   */
  onServerRestart ({ cbGID }, cb) {
    this.registerListener('info-server-restart', {}, cbGID, cb)
  }

  /**
   * Register a callback in case of a 'maintenance started' message from the
   * server. This is a good time to pause server packets until maintenance ends
   *
   * @param {Object} opts
   * @param {string} opts.cbGID
   * @param {method} cb
   */
  onMaintenanceStart ({ cbGID }, cb) {
    this.registerListener('info-maintenance-start', {}, cbGID, cb)
  }

  /**
   * Register a callback to be notified of a maintenance period ending
   *
   * @param {Object} opts
   * @param {string} opts.cbGID
   * @param {method} cb
   */
  onMaintenanceEnd ({ cbGID }, cb) {
    this.registerListener('info-maintenance-end', {}, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.key - candle set key, i.e. trade:30m:tBTCUSD
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-public-candle
   */
  onCandle ({ key, cbGID }, cb) {
    const filter = {}
    if (key) filter.key = key

    this.registerListener('candle', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.prec
   * @param {string} opts.len
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-public-order-books
   */
  onOrderBook ({ symbol, prec, len, cbGID }, cb) {
    const filter = {}

    if (symbol) filter.symbol = symbol
    if (prec) filter.prec = prec
    if (len) filter.len = len

    this.registerListener('book', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.prec
   * @param {string} opts.len
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-public-order-books
   */
  onOrderBookChecksum ({ symbol, prec, len, cbGID }, cb) {
    const filter = {}

    if (symbol) filter.symbol = symbol
    if (prec) filter.prec = prec
    if (len) filter.len = len

    this.registerListener('bookCS', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.pair
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-public-trades
   */
  onTrades ({ pair, cbGID }, cb) {
    const filter = {}
    if (pair) filter.pair = pair

    this.registerListener('trades', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-public-ticker
   */
  onTicker ({ symbol = '', cbGID } = {}, cb) {
    const filter = {}
    if (symbol) filter.symbol = symbol

    this.registerListener('ticker', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {number} opts.id
   * @param {number} opts.cid
   * @param {number} opts.gid
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-orders
   */
  onOrderSnapshot ({ symbol, id, cid, gid, cbGID }, cb) {
    const filter = {}

    if (symbol) filter.symbol = symbol
    if (id) filter.id = id
    if (cid) filter.cid = cid
    if (gid) filter.gid = gid

    this.registerListener('os', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string?} opts.symbol
   * @param {number?} opts.id
   * @param {number?} opts.cid
   * @param {number?} opts.gid
   * @param {string?} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-orders
   */
  onOrderNew ({ symbol, id, cid, gid, cbGID }, cb) {
    const filter = {}

    if (symbol) filter.symbol = symbol
    if (id) filter.id = id
    if (cid) filter.cid = cid
    if (gid) filter.gid = gid

    this.registerListener('on', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {number} opts.id
   * @param {number} opts.gid
   * @param {number} opts.cid
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-orders
   */
  onOrderUpdate ({ symbol, id, cid, gid, cbGID }, cb) {
    const filter = {}

    if (symbol) filter.symbol = symbol
    if (id) filter.id = id
    if (cid) filter.cid = cid
    if (gid) filter.gid = gid

    this.registerListener('ou', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {number} opts.id
   * @param {number} opts.gid
   * @param {number} opts.cid
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-orders
   */
  onOrderClose ({ symbol, id, cid, gid, cbGID }, cb) {
    const filter = {}

    if (symbol) filter.symbol = symbol
    if (id) filter.id = id
    if (cid) filter.cid = cid
    if (gid) filter.gid = gid

    this.registerListener('oc', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-position
   */
  onPositionSnapshot ({ symbol, cbGID }, cb) {
    const filter = {}
    if (symbol) filter.symbol = symbol

    this.registerListener('ps', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-position
   */
  onPositionNew ({ symbol, cbGID }, cb) {
    const filter = {}
    if (symbol) filter.symbol = symbol

    this.registerListener('pn', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-position
   */
  onPositionUpdate ({ symbol, cbGID }, cb) {
    const filter = {}
    if (symbol) filter.symbol = symbol

    this.registerListener('pu', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-position
   */
  onPositionClose ({ symbol, cbGID }, cb) {
    const filter = {}
    if (symbol) filter.symbol = symbol

    this.registerListener('pc', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.pair
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-trades
   */
  onTradeEntry ({ pair, cbGID }, cb) {
    const filter = {}
    if (pair) filter.pair = pair

    this.registerListener('te', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.pair
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-trades
   */
  onTradeUpdate ({ pair, cbGID }, cb) {
    const filter = {}
    if (pair) filter.pair = pair

    this.registerListener('tu', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-offers
   */
  onFundingOfferSnapshot ({ symbol, cbGID }, cb) {
    const filter = {}
    if (symbol) filter.symbol = symbol

    this.registerListener('fos', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-offers
   */
  onFundingOfferNew ({ symbol, cbGID }, cb) {
    const filter = {}
    if (symbol) filter.symbol = symbol

    this.registerListener('fon', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-offers
   */
  onFundingOfferUpdate ({ symbol, cbGID }, cb) {
    const filter = {}
    if (symbol) filter.symbol = symbol

    this.registerListener('fou', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-offers
   */
  onFundingOfferClose ({ symbol, cbGID }, cb) {
    const filter = {}
    if (symbol) filter.symbol = symbol

    this.registerListener('foc', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-credits
   */
  onFundingCreditSnapshot ({ symbol, cbGID }, cb) {
    const filter = {}
    if (symbol) filter.symbol = symbol

    this.registerListener('fcs', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-credits
   */
  onFundingCreditNew ({ symbol, cbGID }, cb) {
    const filter = {}
    if (symbol) filter.symbol = symbol

    this.registerListener('fcn', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-credits
   */
  onFundingCreditUpdate ({ symbol, cbGID }, cb) {
    const filter = {}
    if (symbol) filter.symbol = symbol

    this.registerListener('fcu', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-credits
   */
  onFundingCreditClose ({ symbol, cbGID }, cb) {
    const filter = {}
    if (symbol) filter.symbol = symbol

    this.registerListener('fcc', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-loans
   */
  onFundingLoanSnapshot ({ symbol, cbGID }, cb) {
    const filter = {}
    if (symbol) filter.symbol = symbol

    this.registerListener('fls', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-loans
   */
  onFundingLoanNew ({ symbol, cbGID }, cb) {
    const filter = {}
    if (symbol) filter.symbol = symbol

    this.registerListener('fln', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-loans
   */
  onFundingLoanUpdate ({ symbol, cbGID }, cb) {
    const filter = {}
    if (symbol) filter.symbol = symbol

    this.registerListener('flu', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-loans
   */
  onFundingLoanClose ({ symbol, cbGID }, cb) {
    const filter = {}
    if (symbol) filter.symbol = symbol

    this.registerListener('flc', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-wallets
   */
  onWalletSnapshot ({ cbGID }, cb) {
    this.registerListener('ws', {}, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-wallets
   */
  onWalletUpdate ({ cbGID }, cb) {
    this.registerListener('wu', {}, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-balance
   */
  onBalanceInfoUpdate ({ cbGID }, cb) {
    this.registerListener('bu', {}, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-margin
   */
  onMarginInfoUpdate ({ cbGID }, cb) {
    this.registerListener('miu', {}, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-funding
   */
  onFundingInfoUpdate ({ cbGID }, cb) {
    this.registerListener('fiu', {}, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-funding-trades
   */
  onFundingTradeEntry ({ symbol, cbGID }, cb) {
    const filter = {}
    if (symbol) filter.symbol = symbol

    this.registerListener('fte', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-funding-trades
   */
  onFundingTradeUpdate ({ symbol, cbGID }, cb) {
    const filter = {}
    if (symbol) filter.symbol = symbol

    this.registerListener('ftu', filter, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.type
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-notifications
   */
  onNotification ({ type, cbGID }, cb) {
    const filter = {}
    if (type) filter.type = type

    this.registerListener('n', filter, cbGID, cb)
  }
}
