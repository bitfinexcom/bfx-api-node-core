# Bitfinex Modular WSv2 API Library for Node.JS

[![Build Status](https://travis-ci.org/bitfinexcom/bfx-api-node-core.svg?branch=master)](https://travis-ci.org/bitfinexcom/bfx-api-node-core)

Modular Bitfinex Node.JS API library as an alternative to `bitfinex-api-node`, supporting a plugin system. Connection instances are POJOs as opposed to the
WSv2 class instances returned by `bitfinex-api-node` and are manipulated in a
functional style. A connection pool manager is also provided for multiplexing.

### Features

* POJO connection instances
* Multiplexing connection pool manager
* Plugin system for extending the default events

### Installation

```bash
npm i --save bfx-api-node-core
```

### Quickstart

```js
const { Manager, initState } = require('bfx-api-node-core')

// Create a Manager instance with an internal connection pool, and add a
// connection to the pool
const m = new Manager({ transform: true })
const managedConnection = m.openWS()

// Alternatively, create & open a single connection yourself
const connection = initState({ transform: true })

// do something with connections, see below for examples
```

### Docs

[`See docs/manager_docs.md`](/docs/manager_docs.md) for the Manager class documentation, and [`docs/ws2_funcs.md`](/docs/ws2_funcs.md) for documentation on the functions available for manipulating a connection instance.

### Examples

Subscribing to a candle channel:
```js
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

Using a plugin:
```js
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

### Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request
