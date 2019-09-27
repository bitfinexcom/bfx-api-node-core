'use strict'

process.env.DEBUG = '*'

const debug = require('debug')('bfx:api:core:examples:trades')
const { subscribe, Manager } = require('../')

const SYMBOL = 'tBTCUSD'

debug('opening connection...')

const m = new Manager({ transform: true })
const wsState = m.openWS()

m.on('ws2:open', () => debug('connection opened'))
m.on('ws2:close', () => debug('connection closed'))

m.on('ws2:trades', (trades, meta) => {
  const { chanFilter } = meta
  const { symbol, pair } = chanFilter
  const [trade] = trades
  const nTrades = trades.length

  debug('recv %d trades on for symbol %s [pair %s]', nTrades, symbol, pair)
  debug(
    'latest trade: id %s, price %d, amount %d, mts: %s',
    trade.id, trade.price, trade.amount, new Date(trade.mts).toLocaleString()
  )
})

debug('subscribing to trades channel %s', SYMBOL)

subscribe(wsState, 'trades', { symbol: SYMBOL })
