'use strict'

process.env.DEBUG = '*'

const debug = require('debug')('bfx:api:core:examples:candles')
const { subscribe, Manager } = require('../')

const CANDLE_KEY = 'trade:1m:tBTCUSD'

debug('opening connection...')

const m = new Manager({ transform: true })
const wsState = m.openWS()

m.on('ws2:open', () => debug('connection opened'))
m.on('ws2:close', () => debug('connection closed'))

m.on('ws2:candles', (candles, meta) => {
  const { chanFilter } = meta
  const { key } = chanFilter
  const [candle] = candles
  const nCandles = candles.length

  debug('recv %d candles on key', nCandles, key)
  debug(
    'latest candle: open %d, high %d, low %d, close %d, volume: %d, mts: %s',
    candle.open, candle.high, candle.low, candle.close, candle.volume,
    new Date(candle.mts).toLocaleString()
  )
})

debug('subscribing to candles channel %s', CANDLE_KEY)

subscribe(wsState, 'candles', { key: CANDLE_KEY })
