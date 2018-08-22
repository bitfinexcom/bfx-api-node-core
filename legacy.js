'use strict'

const { EventEmitter } = require('events')
const _isEqual = require('lodash/isEqual')
const _pick = require('lodash/pick')
const WSv1 = require('bfx-api-node-ws1')

const Manager = require('./lib/manager')
const subscribeWS = require('./lib/ws2/subscribe')
const unsubscribeWS = require('./lib/ws2/unsubscribe')
const findChannelId = require('./lib/ws2/find_channel_id')
const { RESTv1, RESTv2 } = require('bfx-api-node-rest')

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

    if (opts.constructor.name !== 'Object') {
      throw new Error([
        'constructor takes an object since version 2.0.0, see:',
        'https://github.com/bitfinexcom/bitfinex-api-node#version-200-breaking-changes\n'
      ].join('\n'))
    }

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

      ...extraOpts,
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
        this.initManager(extraOpts)
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

  initManager (opts = {}) {
    const managerArgs = this._getTransportPayload(opts)

    this._manager = new Manager(managerArgs)
    this._manager.on('ws2:open', () => this.emit('open'))
    this._manager.on('ws2:candles', (data, meta = {}) => {
      this.notifyListeners('candles', meta, data)
    })

    this._manager.on('ws2:trades', (data, meta = {}) => {
      this.notifyListeners('trades', meta, data)
    })
  }

  notifyListeners (type, meta, data) {
    const { chanFilter } = meta

    Object.values(this._ws2Listeners).forEach(group => {
      const listeners = [
        ...(group[type] || []),
        ...(group[''] || []), // include catch-all
      ]

      listeners.forEach(l => {
        const fv = _pick(chanFilter, Object.keys(l.filter))

        if (!_isEqual(l.filter, fv)) {
          return
        }

        l.cb(data)
      })
    })
  }

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
      filter,
    })
  }

  /////////////////////////////////
  // Legacy subscription methods //
  /////////////////////////////////

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

  /////////////////////////////
  // Legacy listener methods //
  /////////////////////////////

  /**
   * @param {Object} opts
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   */
  onMessage ({ cbGID }, cb) {
    this.registerListener('', {}, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.key - candle set key, i.e. trade:30m:tBTCUSD
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-public-candle
   */
  onCandle ({ key, cbGID }, cb) {
    this.registerListener('candle', { key }, cbGID, cb)
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
    this.registerListener('orderbook', { symbol, prec, len }, cbGID, cb)
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
    this.registerListener('ob_checksum', { symbol, prec, len }, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.pair
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-public-trades
   */
  onTrades ({ pair, cbGID }, cb) {
    this.registerListener('trades', { pair }, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-public-ticker
   */
  onTicker ({ symbol = '', cbGID } = {}, cb) {
    this.registerListener('ticker', { symbol }, cbGID, cb)
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
    this.registerListener('os', { id, gid, cid, symbol }, cbGID, cb)
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
    this.registerListener('on', { id, gid, cid, symbol }, cbGID, cb)
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
    this.registerListener('ou', { id, gid, cid, symbol }, cbGID, cb)
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
    this.registerListener('oc', { id, gid, cid, symbol }, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-position
   */
  onPositionSnapshot ({ symbol, cbGID }, cb) {
    this.registerListener('ps', { symbol }, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-position
   */
  onPositionNew ({ symbol, cbGID }, cb) {
    this.registerListener('pn', { symbol }, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-position
   */
  onPositionUpdate ({ symbol, cbGID }, cb) {
    this.registerListener('pu', { symbol }, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-position
   */
  onPositionClose ({ symbol, cbGID }, cb) {
    this.registerListener('pc', { symbol }, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.pair
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-trades
   */
  onTradeEntry ({ pair, cbGID }, cb) {
    this.registerListener('te', { pair }, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.pair
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-trades
   */
  onTradeUpdate ({ pair, cbGID }, cb) {
    this.registerListener('tu', { pair }, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-offers
   */
  onFundingOfferSnapshot ({ symbol, cbGID }, cb) {
    this.registerListener('fos', { symbol }, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-offers
   */
  onFundingOfferNew ({ symbol, cbGID }, cb) {
    this.registerListener('fon', { symbol }, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-offers
   */
  onFundingOfferUpdate ({ symbol, cbGID }, cb) {
    this.registerListener('fou', { symbol }, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-offers
   */
  onFundingOfferClose ({ symbol, cbGID }, cb) {
    this.registerListener('foc', { symbol }, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-credits
   */
  onFundingCreditSnapshot ({ symbol, cbGID }, cb) {
    this.registerListener('fcs', { symbol }, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-credits
   */
  onFundingCreditNew ({ symbol, cbGID }, cb) {
    this.registerListener('fcn', { symbol }, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-credits
   */
  onFundingCreditUpdate ({ symbol, cbGID }, cb) {
    this.registerListener('fcu', { symbol }, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-credits
   */
  onFundingCreditClose ({ symbol, cbGID }, cb) {
    this.registerListener('fcc', { symbol }, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-loans
   */
  onFundingLoanSnapshot ({ symbol, cbGID }, cb) {
    this.registerListener('fls', { symbol }, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-loans
   */
  onFundingLoanNew ({ symbol, cbGID }, cb) {
    this.registerListener('fln', { symbol }, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-loans
   */
  onFundingLoanUpdate ({ symbol, cbGID }, cb) {
    this.registerListener('flu', { symbol }, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-loans
   */
  onFundingLoanClose ({ symbol, cbGID }, cb) {
    this.registerListener('flc', { symbol }, cbGID, cb)
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
    this.registerListener('fte', { symbol }, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.symbol
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-funding-trades
   */
  onFundingTradeUpdate ({ symbol, cbGID }, cb) {
    this.registerListener('ftu', { symbol }, cbGID, cb)
  }

  /**
   * @param {Object} opts
   * @param {string} opts.type
   * @param {string} opts.cbGID - callback group id
   * @param {Method} cb
   * @see https://docs.bitfinex.com/v2/reference#ws-auth-notifications
   */
  onNotification ({ type, cbGID }, cb) {
    this.registerListener('n', { type }, cbGID, cb)
  }
}
