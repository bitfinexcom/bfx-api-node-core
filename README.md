# bfx-api-node-core

[![Build Status](https://travis-ci.org/bitfinexcom/bfx-api-node-core.svg?branch=master)](https://travis-ci.org/bitfinexcom/bfx-api-node-core)

Modular Bitfinex Node.JS API library as an alternative to `bitfinex-api-node`, supporting a plugin system.

### Example: Subscribing to candles
```js
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
```

### Example: Using a plugin
```js
'use strict'

process.env.DEBUG = '*'

const debug = require('debug')('bfx:api:core:examples:candles')
const Watchdog = require('bfx-api-node-plugin-wd')
const { Manager } = require('../')

const WATCHDOG_DELAY = 5 * 1000

debug('opening connection...')

const m = new Manager({
  transform: true,
  plugins: [Watchdog({ pachetWDDelay: WATCHDOG_DELAY })]
})

m.on('ws2:open', () => debug('connection opened'))
m.on('ws2:reopen', () => debug('connection re-opened'))
m.on('ws2:close', () => debug('connection closed'))
m.openWS()

debug('awaiting watchdog trigger [no subscriptions]')
```
