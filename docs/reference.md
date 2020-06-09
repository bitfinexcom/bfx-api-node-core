## Modules

<dl>
<dt><a href="#module_bfx-api-node-core">bfx-api-node-core</a></dt>
<dd><p>Modular Bitfinex Node.JS API library as an alternative to
<a href="https://github.com/bitfinexcom/bitfinex-api-node">bitfinex-api-node</a>, supporting a plugin
system. Connection instances are POJOs as opposed to the <code>WSv2</code> class
instances returned by
<a href="https://github.com/bitfinexcom/bitfinex-api-node">bitfinex-api-node</a> and are manipulated in
a functional style. A <a href="#Manager">connection pool manager</a> is also
provided for multiplexing.</p>
<h3 id="available-plugins">Available Plugins</h3>
<ul>
<li><a href="https://github.com/bitfinexcom/bfx-api-node-plugin-example">bfx-api-node-plugin-example</a> -
skeleton plugin that serves as a reference for the required structure.</li>
<li><a href="https://github.com/bitfinexcom/bfx-api-node-plugin-managed-candles">bfx-api-node-plugin-managed-candles</a> -
maintains an updated candle dataset and provides events to access it on
each update.</li>
<li><a href="https://github.com/bitfinexcom/bfx-api-node-plugin-managed-ob">bfx-api-node-plugin-managed-ob</a> -
maintains an updated full order book copy for each subscribed book
channel, and provides events to access it on each update.</li>
<li><a href="https://github.com/bitfinexcom/bfx-api-node-plugin-ob-checksum">bfx-api-node-plugin-ob-checksum</a> -
maintains local order books for each subscribed book channel and performs
automatic checksum verification, emitting a custom event on checksum
mismatch.</li>
<li><a href="https://github.com/bitfinexcom/bfx-api-node-plugin-seq-audit">bfx-api-node-plugin-seq-audit</a> -
enables sequence numbers and performs automatic verification, emitting a
custom event on sequence number mismatch.</li>
<li><a href="https://github.com/bitfinexcom/bfx-api-node-plugin-wd">bfx-api-node-plugin-wd</a> - implements
a connection watchdog, automatically reconnecting if no new packets are
received within the configured grace period.</li>
</ul>
</dd>
</dl>

## Classes

<dl>
<dt><a href="#Manager">Manager</a> ⇐ <code>events.EventEmitter</code></dt>
<dd><p>WSv2 connection pool manager. Limits active channel subscriptions per socket,
opening new sockets/closing existing ones as needed.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#definePlugin">definePlugin(id, defaultArgs, cb)</a> ⇒ <code><a href="#PluginGenerator">PluginGenerator</a></code></dt>
<dd><p>Provides helpers for the plugin definition, and attaches the ID</p>
</dd>
<dt><a href="#emitPluginEvent">emitPluginEvent(id, ev, label, args)</a></dt>
<dd><p>Emits a plugin event via a ws event emitter</p>
</dd>
<dt><a href="#getPluginState">getPluginState(id, wsState)</a> ⇒ <code><a href="#Plugin">Plugin</a></code></dt>
<dd><p>Get plugin state by ID from a socket</p>
</dd>
<dt><a href="#initPluginState">initPluginState(plugin)</a> ⇒ <code>object</code></dt>
<dd></dd>
<dt><a href="#auth">auth(state, opts)</a> ⇒ <code>Promise</code></dt>
<dd><p>Attempts to authenticate with the connection&#39;s configured API credentials,
and the provided flags. Returns a promise that resolves/rejects on
success/failure.</p>
</dd>
<dt><a href="#getWSDataChannelCount">getWSDataChannelCount(state)</a> ⇒ <code>number</code></dt>
<dd><p>Returns the number of data channel subscriptions. Pending subscriptions are
counted as the subscribe packet has been emitted.</p>
</dd>
<dt><a href="#getPendingSubscriptionCount">getPendingSubscriptionCount(state)</a> ⇒ <code>number</code></dt>
<dd><p>Query the number of pending channel subscriptions (subscribed but
confirmation packet not yet received)</p>
</dd>
<dt><a href="#getPendingUnsubscriptionCount">getPendingUnsubscriptionCount(state)</a> ⇒ <code>number</code></dt>
<dd><p>Query the number of pending channel unsubscriptions (unsubscribed but
confirmation packet not yet received)</p>
</dd>
<dt><a href="#findChannelId">findChannelId(state, comp)</a> ⇒ <code>number</code></dt>
<dd></dd>
<dt><a href="#disableFlag">disableFlag(state, flag, silent)</a> ⇒ <code><a href="#SocketState">SocketState</a></code></dt>
<dd><p>Disables a flag; updates the connection flag set</p>
</dd>
<dt><a href="#enableFlag">enableFlag(state, flag, silent)</a> ⇒ <code><a href="#SocketState">SocketState</a></code></dt>
<dd><p>Enables a flag; updates the connection flag set</p>
</dd>
<dt><a href="#isFlagEnabled">isFlagEnabled(state, flag)</a> ⇒ <code>boolean</code></dt>
<dd><p>Query if a flag is enabled on the provided socket.</p>
</dd>
<dt><a href="#setFlags">setFlags(state, flags, silent)</a> ⇒ <code><a href="#SocketState">SocketState</a></code></dt>
<dd><p>Updates the connection flags</p>
</dd>
<dt><a href="#initState">initState(opts)</a> ⇒ <code><a href="#SocketState">SocketState</a></code></dt>
<dd><p>Creates &amp; opens a WSv2 API connection, and returns the resulting state object</p>
</dd>
<dt><a href="#open">open([url], [agent])</a> ⇒ <code>object</code></dt>
<dd><p>Opens a websocket connection to the provided Bitfinex API URL and prepares
an event emitter to capture and report API stream events.</p>
</dd>
<dt><a href="#cancelOrderWithDelay">cancelOrderWithDelay(state, delay, o)</a> ⇒ <code>Promise</code></dt>
<dd><p>Cancels an order from either an order object, array, or raw ID, after the
specified delay.</p>
</dd>
<dt><a href="#cancelOrder">cancelOrder(state, order)</a> ⇒ <code>Promise</code></dt>
<dd><p>Cancels an order from either an order object, array, or raw ID.</p>
</dd>
<dt><a href="#submitOrderWithDelay">submitOrderWithDelay(state, delay, o)</a> ⇒ <code>Promise</code></dt>
<dd><p>Submits an order with either an order model or raw order object, after the
specified delay.</p>
</dd>
<dt><a href="#submitOrder">submitOrder(state, order)</a> ⇒ <code>Promise</code></dt>
<dd><p>Submits an order with either an order model or raw order object.</p>
</dd>
<dt><a href="#updateOrder">updateOrder(state, changes)</a> ⇒ <code>Promise</code></dt>
<dd><p>Updates an order in-place.</p>
</dd>
<dt><a href="#reopen">reopen(state)</a> ⇒ <code><a href="#SocketState">SocketState</a></code></dt>
<dd><p>Reopen a socket connection.</p>
</dd>
<dt><a href="#send">send(state, msg)</a></dt>
<dd><p>Sends the provided data to the active WebSocket connection, or buffers it if
the connection is not yet open.</p>
</dd>
<dt><a href="#subscribe">subscribe(state, channel, payload)</a> ⇒ <code><a href="#SocketState">SocketState</a></code></dt>
<dd><p>Subscribes to the specified channel, buffers if the connection is not open.</p>
</dd>
<dt><a href="#unsubscribe">unsubscribe(state, chanId)</a> ⇒ <code><a href="#SocketState">SocketState</a></code></dt>
<dd><p>Unsubscribes from the specified channel, buffers if the connection is not
open.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#AuthArgs">AuthArgs</a> : <code>object</code></dt>
<dd><p>Socket authentication arguments, provided to WSv2 clients by the
<a href="#Manager">Manager</a>.</p>
</dd>
<dt><a href="#FullAuthArgs">FullAuthArgs</a> : <code><a href="#AuthArgs">AuthArgs</a></code></dt>
<dd><p>Like <a href="#AuthArgs">AuthArgs</a> but with API
credentials.</p>
</dd>
<dt><a href="#PluginEventHandler">PluginEventHandler</a> ⇒ <code>Array</code> | <code>null</code></dt>
<dd><p>A plugin event handler function.</p>
</dd>
<dt><a href="#PluginGenerator">PluginGenerator</a> ⇒ <code><a href="#Plugin">Plugin</a></code></dt>
<dd><p>Function that returns a <a href="#Plugin">Plugin</a>
object given a set of arguments.</p>
</dd>
<dt><a href="#PluginHelpers">PluginHelpers</a> : <code>object</code></dt>
<dd><p>An object passed to all plugin method handlers</p>
</dd>
<dt><a href="#Plugin">Plugin</a> : <code>object</code></dt>
<dd><p>Plugin for a <a href="#Manager">Manager</a> instance.</p>
</dd>
<dt><a href="#SocketState">SocketState</a> : <code>object</code></dt>
<dd><p>A single Bitfinex WebSocket v2 API connection, and all associated state/data</p>
</dd>
</dl>

<a name="module_bfx-api-node-core"></a>

## bfx-api-node-core
Modular Bitfinex Node.JS API library as an alternative to
[bitfinex-api-node](https://github.com/bitfinexcom/bitfinex-api-node), supporting a plugin
system. Connection instances are POJOs as opposed to the `WSv2` class
instances returned by
[bitfinex-api-node](https://github.com/bitfinexcom/bitfinex-api-node) and are manipulated in
a functional style. A [connection pool manager](#Manager) is also
provided for multiplexing.

### Available Plugins

* [bfx-api-node-plugin-example](https://github.com/bitfinexcom/bfx-api-node-plugin-example) -
  skeleton plugin that serves as a reference for the required structure.
* [bfx-api-node-plugin-managed-candles](https://github.com/bitfinexcom/bfx-api-node-plugin-managed-candles) -
  maintains an updated candle dataset and provides events to access it on
  each update.
* [bfx-api-node-plugin-managed-ob](https://github.com/bitfinexcom/bfx-api-node-plugin-managed-ob) -
  maintains an updated full order book copy for each subscribed book
  channel, and provides events to access it on each update.
* [bfx-api-node-plugin-ob-checksum](https://github.com/bitfinexcom/bfx-api-node-plugin-ob-checksum) -
  maintains local order books for each subscribed book channel and performs
  automatic checksum verification, emitting a custom event on checksum
  mismatch.
* [bfx-api-node-plugin-seq-audit](https://github.com/bitfinexcom/bfx-api-node-plugin-seq-audit) -
  enables sequence numbers and performs automatic verification, emitting a
  custom event on sequence number mismatch.
* [bfx-api-node-plugin-wd](https://github.com/bitfinexcom/bfx-api-node-plugin-wd) - implements
  a connection watchdog, automatically reconnecting if no new packets are
  received within the configured grace period.

**License**: MIT  
**Example**  
```js
const { Manager, initState } = require('bfx-api-node-core')

// Create a Manager instance with an internal connection pool, and add a
// connection to the pool
const m = new Manager({ transform: true })
const managedConnection = m.openWS()

// Alternatively, create & open a single connection yourself
const connection = initState({ transform: true })

// do something with connections
```
<a name="Manager"></a>

## Manager ⇐ <code>events.EventEmitter</code>
WSv2 connection pool manager. Limits active channel subscriptions per socket,
opening new sockets/closing existing ones as needed.

**Kind**: global class  
**Extends**: <code>events.EventEmitter</code>  

* [Manager](#Manager) ⇐ <code>events.EventEmitter</code>
    * [new Manager([args])](#new_Manager_new)
    * [.updateAuthArgs(args)](#Manager+updateAuthArgs)
    * [.hasPlugin(plugin)](#Manager+hasPlugin) ⇒ <code>boolean</code>
    * [.addPlugin(plugin)](#Manager+addPlugin)
    * [.auth([args])](#Manager+auth)
    * [.getWS(id)](#Manager+getWS) ⇒ [<code>SocketState</code>](#SocketState)
    * [.getWSIndex(id)](#Manager+getWSIndex) ⇒ <code>number</code>
    * [.getWSByIndex(index)](#Manager+getWSByIndex) ⇒ [<code>SocketState</code>](#SocketState)
    * [.updateWS(id, state)](#Manager+updateWS)
    * [.closeAllSockets()](#Manager+closeAllSockets)
    * [.reconnectAllSockets()](#Manager+reconnectAllSockets)
    * [.closeWS(id)](#Manager+closeWS)
    * [.openWS()](#Manager+openWS) ⇒ [<code>SocketState</code>](#SocketState)
    * [.onWS(eventName, filterValue, cb)](#Manager+onWS)
    * [.onceWS(eventName, filterValue, cb)](#Manager+onceWS)
    * [.notifyPlugins(type, section, name, args)](#Manager+notifyPlugins)
    * [.notifyPlugin(plugin, section, name, args)](#Manager+notifyPlugin)
    * [.withFreeDataSocket(cb)](#Manager+withFreeDataSocket)
    * [.withDataSocket(filterCB, cb)](#Manager+withDataSocket)
    * [.withAuthSocket(cb)](#Manager+withAuthSocket)
    * [.withSocket(cb)](#Manager+withSocket)
    * [.sampleWS()](#Manager+sampleWS) ⇒ [<code>SocketState</code>](#SocketState)
    * [.sampleWSI()](#Manager+sampleWSI) ⇒ <code>number</code>
    * [.applyWS(i, cb)](#Manager+applyWS)

<a name="new_Manager_new"></a>

### new Manager([args])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [args] | <code>object</code> | <code>{}</code> | arguments |
| [args.wsURL] | <code>string</code> | <code>&quot;&#x27;wss://api.bitfinex.com/ws/2&#x27;&quot;</code> | defaults to   production Bitfinex WSv2 API url |
| [args.restURL] | <code>string</code> | <code>&quot;&#x27;https://api.bitfinex.com&#x27;&quot;</code> | defaults to   production Bitfinex RESTv2 API url |
| [args.agent] | <code>object</code> |  | connection agent |
| [args.apiKey] | <code>string</code> |  | used to authenticate sockets |
| [args.apiSecret] | <code>string</code> |  | used to authenticate sockets |
| [args.autoResubscribe] | <code>boolean</code> | <code>true</code> | enables automatic   subscribing to previously subscribed channels on reconnect |
| [args.channelsPerSocket] | <code>number</code> | <code>30</code> | max data channel   subscriptions per WSv2 client |
| [args.dms] | <code>number</code> | <code>0</code> | dead-man-switch flag sent on auth, active 4 |
| [args.calc] | <code>number</code> | <code>0</code> | calc |
| [args.transform] | <code>boolean</code> |  | if true, raw API data arrays will be   automatically converted to bfx-api-node-models instances |
| [args.plugins] | <code>object</code> |  | optional set of plugins to use |

**Example** *(streaming candles)*  
```js
const debug = require('debug')('bfx:api:core:examples:candles')
const { subscribe, Manager } = require('bfx-api-node-core')

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

subscribe(wsState, 'candles', { key: CANDLE_KEY }) *
```
**Example** *(streaming public trades)*  
```js
const debug = require('debug')('bfx:api:core:examples:trades')
const { subscribe, Manager } = require('bfx-api-node-core')

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

subscribe(wsState, 'trades', { symbol: SYMBOL }) *
```
<a name="Manager+updateAuthArgs"></a>

### manager.updateAuthArgs(args)
Update authentication arguments used for all connections on auth. Provided
args are merged with existing ones.

**Kind**: instance method of [<code>Manager</code>](#Manager)  

| Param | Type | Description |
| --- | --- | --- |
| args | [<code>AuthArgs</code>](#AuthArgs) | args |

<a name="Manager+hasPlugin"></a>

### manager.hasPlugin(plugin) ⇒ <code>boolean</code>
Check for plugin existence by ID

**Kind**: instance method of [<code>Manager</code>](#Manager)  
**Returns**: <code>boolean</code> - hasPlugin  

| Param | Type | Description |
| --- | --- | --- |
| plugin | [<code>Plugin</code>](#Plugin) | plugin |

<a name="Manager+addPlugin"></a>

### manager.addPlugin(plugin)
No-op if the plugin is already registered

**Kind**: instance method of [<code>Manager</code>](#Manager)  

| Param | Type | Description |
| --- | --- | --- |
| plugin | [<code>Plugin</code>](#Plugin) | plugin |

<a name="Manager+auth"></a>

### manager.auth([args])
Authenticates all open API connections, and updates auth arguments used
for future connections with those provided.

**Kind**: instance method of [<code>Manager</code>](#Manager)  

| Param | Type | Description |
| --- | --- | --- |
| [args] | [<code>FullAuthArgs</code>](#FullAuthArgs) | defaults to values   provided to constructor |

<a name="Manager+getWS"></a>

### manager.getWS(id) ⇒ [<code>SocketState</code>](#SocketState)
Returns a connection state object by ID

**Kind**: instance method of [<code>Manager</code>](#Manager)  
**Returns**: [<code>SocketState</code>](#SocketState) - state - connection state  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | connection ID |

<a name="Manager+getWSIndex"></a>

### manager.getWSIndex(id) ⇒ <code>number</code>
Returns the index of a connection within the internal pool by ID

**Kind**: instance method of [<code>Manager</code>](#Manager)  
**Returns**: <code>number</code> - index - within internal pool  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | connection ID |

<a name="Manager+getWSByIndex"></a>

### manager.getWSByIndex(index) ⇒ [<code>SocketState</code>](#SocketState)
Returns a connection state object by pool index

**Kind**: instance method of [<code>Manager</code>](#Manager)  
**Returns**: [<code>SocketState</code>](#SocketState) - state - connection state  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | within internal pool |

<a name="Manager+updateWS"></a>

### manager.updateWS(id, state)
Updates an internal connection by ID, emitting the socket:updated event
if the connection exists.

**Kind**: instance method of [<code>Manager</code>](#Manager)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | id |
| state | [<code>SocketState</code>](#SocketState) | new connection state |

<a name="Manager+closeAllSockets"></a>

### manager.closeAllSockets()
Closes all connections in the pool

**Kind**: instance method of [<code>Manager</code>](#Manager)  
<a name="Manager+reconnectAllSockets"></a>

### manager.reconnectAllSockets()
Closes and re-opens all connections in the pool

**Kind**: instance method of [<code>Manager</code>](#Manager)  
<a name="Manager+closeWS"></a>

### manager.closeWS(id)
Closes a connection by ID, no-op if the connection is not found.

**Kind**: instance method of [<code>Manager</code>](#Manager)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | id |

<a name="Manager+openWS"></a>

### manager.openWS() ⇒ [<code>SocketState</code>](#SocketState)
Creates & opens a new WSv2 connection, adds it to the pool, and returns it

**Kind**: instance method of [<code>Manager</code>](#Manager)  
**Returns**: [<code>SocketState</code>](#SocketState) - connection  
<a name="Manager+onWS"></a>

### manager.onWS(eventName, filterValue, cb)
Creates an event handler that updates the relevant internal socket state
object.

**Kind**: instance method of [<code>Manager</code>](#Manager)  

| Param | Type | Description |
| --- | --- | --- |
| eventName | <code>string</code> | event name |
| filterValue | <code>object</code> | value(s) to check for |
| cb | <code>function</code> | callback |

<a name="Manager+onceWS"></a>

### manager.onceWS(eventName, filterValue, cb)
Creates an event handler that updates the relevant internal socket state
object, and only fires once

**Kind**: instance method of [<code>Manager</code>](#Manager)  

| Param | Type | Description |
| --- | --- | --- |
| eventName | <code>string</code> | event name |
| filterValue | <code>object</code> | value(s) to check for |
| cb | <code>function</code> | callback |

<a name="Manager+notifyPlugins"></a>

### manager.notifyPlugins(type, section, name, args)
Calls every matching plugin with the provided arguments, and updates the
relevant ws/rest state objects internally.

State objects are only updated if plugin handlers return valid objects

**Kind**: instance method of [<code>Manager</code>](#Manager)  
**See**: Manager#notifyPlugin  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | ws2 or rest2 |
| section | <code>string</code> | event section |
| name | <code>string</code> | event name |
| args | <code>object</code> | plugin handler arguments |

<a name="Manager+notifyPlugin"></a>

### manager.notifyPlugin(plugin, section, name, args)
Calls the identified plugin with the provided arguments, and updates the
relevant ws/rest state objects internally.

State objects are only updated if plugin handlers return valid objects

**Kind**: instance method of [<code>Manager</code>](#Manager)  
**See**: Manager#notifyPlugins  

| Param | Type | Description |
| --- | --- | --- |
| plugin | <code>object</code> | plugin identifier |
| plugin.id | <code>string</code> | plugin ID |
| plugin.type | <code>string</code> | plugin type |
| section | <code>string</code> | event section |
| name | <code>string</code> | event name |
| args | <code>object</code> | plugin handler arguments |

<a name="Manager+withFreeDataSocket"></a>

### manager.withFreeDataSocket(cb)
Calls the provided function with a connection instance that can subscribe
to at least 1 more data channel. If no such connection is found, a new one
is opened.

**Kind**: instance method of [<code>Manager</code>](#Manager)  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | callback |

<a name="Manager+withDataSocket"></a>

### manager.withDataSocket(filterCB, cb)
Calls the provided function with a connection instance that is subscribed
to a channel matching the provided filter callback, which is called with
each subscribed channel descriptor.

**Kind**: instance method of [<code>Manager</code>](#Manager)  

| Param | Type | Description |
| --- | --- | --- |
| filterCB | <code>function</code> | filter callback, called with each channel on   each socket to find the desired data channel. |
| cb | <code>function</code> | callback, called with identified socket. Not called   if `filterCB` fails to identify a valid socket. |

<a name="Manager+withAuthSocket"></a>

### manager.withAuthSocket(cb)
Calls the provided function with an authenticated socket instance; updates
the socket state with the returned result.

**Kind**: instance method of [<code>Manager</code>](#Manager)  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | callback |

<a name="Manager+withSocket"></a>

### manager.withSocket(cb)
Calls the provided function with a random open connection instance. If none
exists, this is a no-op.

**Kind**: instance method of [<code>Manager</code>](#Manager)  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | callback |

<a name="Manager+sampleWS"></a>

### manager.sampleWS() ⇒ [<code>SocketState</code>](#SocketState)
Returns a random connection from the pool

**Kind**: instance method of [<code>Manager</code>](#Manager)  
**Returns**: [<code>SocketState</code>](#SocketState) - state  
<a name="Manager+sampleWSI"></a>

### manager.sampleWSI() ⇒ <code>number</code>
Returns a random connection index from the pool

**Kind**: instance method of [<code>Manager</code>](#Manager)  
**Returns**: <code>number</code> - index  
<a name="Manager+applyWS"></a>

### manager.applyWS(i, cb)
Calls the provided callback with the connection at the specified pool
index, and saves the return value as the new connection instance.

**Kind**: instance method of [<code>Manager</code>](#Manager)  

| Param | Type | Description |
| --- | --- | --- |
| i | <code>number</code> | socket index |
| cb | <code>function</code> | callback |

<a name="definePlugin"></a>

## definePlugin(id, defaultArgs, cb) ⇒ [<code>PluginGenerator</code>](#PluginGenerator)
Provides helpers for the plugin definition, and attaches the ID

**Kind**: global function  
**Returns**: [<code>PluginGenerator</code>](#PluginGenerator) - def - enriched plugin
  def function  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | plugin ID |
| defaultArgs | <code>object</code> | default plugin arguments |
| cb | <code>function</code> | plugin def function |

<a name="emitPluginEvent"></a>

## emitPluginEvent(id, ev, label, args)
Emits a plugin event via a ws event emitter

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | plugin ID |
| ev | <code>EventEmitter</code> | websocket ev |
| label | <code>string</code> | event label, prefixed |
| args | <code>object</code> | emitted with event |

<a name="getPluginState"></a>

## getPluginState(id, wsState) ⇒ [<code>Plugin</code>](#Plugin)
Get plugin state by ID from a socket

**Kind**: global function  
**Returns**: [<code>Plugin</code>](#Plugin) - plugin - may be undefined  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | unique plugin ID |
| wsState | [<code>SocketState</code>](#SocketState) | socket |

<a name="initPluginState"></a>

## initPluginState(plugin) ⇒ <code>object</code>
**Kind**: global function  
**Returns**: <code>object</code> - state  

| Param | Type | Description |
| --- | --- | --- |
| plugin | [<code>Plugin</code>](#Plugin) | plugin |

<a name="auth"></a>

## auth(state, opts) ⇒ <code>Promise</code>
Attempts to authenticate with the connection's configured API credentials,
and the provided flags. Returns a promise that resolves/rejects on
success/failure.

**Kind**: global function  
**Returns**: <code>Promise</code> - p - resolves on successful auth  

| Param | Type | Description |
| --- | --- | --- |
| state | [<code>SocketState</code>](#SocketState) | socket |
| opts | [<code>AuthArgs</code>](#AuthArgs) | auth args |

<a name="getWSDataChannelCount"></a>

## getWSDataChannelCount(state) ⇒ <code>number</code>
Returns the number of data channel subscriptions. Pending subscriptions are
counted as the subscribe packet has been emitted.

**Kind**: global function  
**Returns**: <code>number</code> - dataChannelCount  

| Param | Type | Description |
| --- | --- | --- |
| state | [<code>SocketState</code>](#SocketState) | socket |

<a name="getPendingSubscriptionCount"></a>

## getPendingSubscriptionCount(state) ⇒ <code>number</code>
Query the number of pending channel subscriptions (subscribed but
confirmation packet not yet received)

**Kind**: global function  
**Returns**: <code>number</code> - pendingSubCount  

| Param | Type | Description |
| --- | --- | --- |
| state | [<code>SocketState</code>](#SocketState) | socket |

<a name="getPendingUnsubscriptionCount"></a>

## getPendingUnsubscriptionCount(state) ⇒ <code>number</code>
Query the number of pending channel unsubscriptions (unsubscribed but
confirmation packet not yet received)

**Kind**: global function  
**Returns**: <code>number</code> - pendingUnsubCount  

| Param | Type | Description |
| --- | --- | --- |
| state | [<code>SocketState</code>](#SocketState) | socket |

<a name="findChannelId"></a>

## findChannelId(state, comp) ⇒ <code>number</code>
**Kind**: global function  
**Returns**: <code>number</code> - channelID  

| Param | Type | Description |
| --- | --- | --- |
| state | [<code>SocketState</code>](#SocketState) | socket |
| comp | <code>function</code> | comparator |

<a name="disableFlag"></a>

## disableFlag(state, flag, silent) ⇒ [<code>SocketState</code>](#SocketState)
Disables a flag; updates the connection flag set

**Kind**: global function  
**Returns**: [<code>SocketState</code>](#SocketState) - nextState  

| Param | Type | Description |
| --- | --- | --- |
| state | [<code>SocketState</code>](#SocketState) | socket |
| flag | <code>number</code> | individual flag to disable |
| silent | <code>boolean</code> | if true, no event is emitted |

<a name="enableFlag"></a>

## enableFlag(state, flag, silent) ⇒ [<code>SocketState</code>](#SocketState)
Enables a flag; updates the connection flag set

**Kind**: global function  
**Returns**: [<code>SocketState</code>](#SocketState) - nextState  

| Param | Type | Description |
| --- | --- | --- |
| state | [<code>SocketState</code>](#SocketState) | socket |
| flag | <code>number</code> | individual flag to enable |
| silent | <code>boolean</code> | if true, no event is emitted |

<a name="isFlagEnabled"></a>

## isFlagEnabled(state, flag) ⇒ <code>boolean</code>
Query if a flag is enabled on the provided socket.

**Kind**: global function  
**Returns**: <code>boolean</code> - enabled  

| Param | Type | Description |
| --- | --- | --- |
| state | [<code>SocketState</code>](#SocketState) | socket |
| flag | <code>number</code> | flag |

<a name="setFlags"></a>

## setFlags(state, flags, silent) ⇒ [<code>SocketState</code>](#SocketState)
Updates the connection flags

**Kind**: global function  
**Returns**: [<code>SocketState</code>](#SocketState) - nextState  

| Param | Type | Description |
| --- | --- | --- |
| state | [<code>SocketState</code>](#SocketState) | socket |
| flags | <code>number</code> | full flag set |
| silent | <code>boolean</code> | if true, no event is emitted |

<a name="initState"></a>

## initState(opts) ⇒ [<code>SocketState</code>](#SocketState)
Creates & opens a WSv2 API connection, and returns the resulting state object

**Kind**: global function  
**Returns**: [<code>SocketState</code>](#SocketState) - state  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| opts | <code>object</code> |  | options |
| [opts.url] | <code>string</code> | <code>&quot;&#x27;wss://api.bitfinex.com/ws/2&#x27;&quot;</code> | endpoint |
| [opts.agent] | <code>object</code> |  | connection agent |
| [opts.transform] | <code>boolean</code> |  | if true, raw API data arrays will be   automatically converted to bfx-api-node-models instances |
| [opts.apiKey] | <code>string</code> |  | for later authentication |
| [opts.apiSecret] | <code>string</code> |  | for later authentication |
| [opts.plugins] | <code>object</code> |  | optional set of plugins to use with the   connection |

<a name="open"></a>

## open([url], [agent]) ⇒ <code>object</code>
Opens a websocket connection to the provided Bitfinex API URL and prepares
an event emitter to capture and report API stream events.

**Kind**: global function  
**Returns**: <code>object</code> - connectionState - see
  [initState](#initState)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [url] | <code>string</code> | <code>&quot;&#x27;wss://api.bitfinex.com/ws/2&#x27;&quot;</code> | endpoint |
| [agent] | <code>object</code> |  | connection agent |

<a name="cancelOrderWithDelay"></a>

## cancelOrderWithDelay(state, delay, o) ⇒ <code>Promise</code>
Cancels an order from either an order object, array, or raw ID, after the
specified delay.

**Kind**: global function  
**Returns**: <code>Promise</code> - p - resolves/rejects upon confirmation  

| Param | Type | Description |
| --- | --- | --- |
| state | [<code>SocketState</code>](#SocketState) | socket |
| delay | <code>number</code> | in ms |
| o | <code>bfx-api-node-models.Order</code> \| <code>bfx-api-node-models.Order~Data</code> | order |

<a name="cancelOrder"></a>

## cancelOrder(state, order) ⇒ <code>Promise</code>
Cancels an order from either an order object, array, or raw ID.

**Kind**: global function  
**Returns**: <code>Promise</code> - p - resolves/rejects upon confirmation  

| Param | Type | Description |
| --- | --- | --- |
| state | [<code>SocketState</code>](#SocketState) | socket |
| order | <code>bfx-api-node-models.Order</code> \| <code>bfx-api-node-models.Order~Data</code> | order |

<a name="submitOrderWithDelay"></a>

## submitOrderWithDelay(state, delay, o) ⇒ <code>Promise</code>
Submits an order with either an order model or raw order object, after the
specified delay.

**Kind**: global function  
**Returns**: <code>Promise</code> - p - resolves/rejects upon confirmation  

| Param | Type | Description |
| --- | --- | --- |
| state | [<code>SocketState</code>](#SocketState) | socket |
| delay | <code>number</code> | in ms |
| o | <code>bfx-api-node-models.Order</code> \| <code>bfx-api-node-models.Order~Data</code> | order |

<a name="submitOrder"></a>

## submitOrder(state, order) ⇒ <code>Promise</code>
Submits an order with either an order model or raw order object.

**Kind**: global function  
**Returns**: <code>Promise</code> - p - resolves/rejects upon confirmation  

| Param | Type | Description |
| --- | --- | --- |
| state | [<code>SocketState</code>](#SocketState) | socket |
| order | <code>bfx-api-node-models.Order</code> \| <code>bfx-api-node-models.Order~Data</code> | order |

<a name="updateOrder"></a>

## updateOrder(state, changes) ⇒ <code>Promise</code>
Updates an order in-place.

**Kind**: global function  
**Returns**: <code>Promise</code> - p - resolves/rejects upon confirmation  

| Param | Type | Description |
| --- | --- | --- |
| state | [<code>SocketState</code>](#SocketState) | socket |
| changes | <code>object</code> | order update packet |
| changes.id | <code>object</code> | id of order to apply update to |

<a name="reopen"></a>

## reopen(state) ⇒ [<code>SocketState</code>](#SocketState)
Reopen a socket connection.

**Kind**: global function  
**Returns**: [<code>SocketState</code>](#SocketState) - nextState  

| Param | Type | Description |
| --- | --- | --- |
| state | [<code>SocketState</code>](#SocketState) | socket |

<a name="send"></a>

## send(state, msg)
Sends the provided data to the active WebSocket connection, or buffers it if
the connection is not yet open.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| state | [<code>SocketState</code>](#SocketState) | socket |
| msg | <code>Array</code> \| <code>object</code> | converted to a JSON string before being sent |

<a name="subscribe"></a>

## subscribe(state, channel, payload) ⇒ [<code>SocketState</code>](#SocketState)
Subscribes to the specified channel, buffers if the connection is not open.

**Kind**: global function  
**Returns**: [<code>SocketState</code>](#SocketState) - state - original ref  

| Param | Type | Description |
| --- | --- | --- |
| state | [<code>SocketState</code>](#SocketState) | socket |
| channel | <code>string</code> | channel type, i.e. 'trades' |
| payload | <code>object</code> | channel filter, i.e. { symbol: '...' } |

<a name="unsubscribe"></a>

## unsubscribe(state, chanId) ⇒ [<code>SocketState</code>](#SocketState)
Unsubscribes from the specified channel, buffers if the connection is not
open.

**Kind**: global function  
**Returns**: [<code>SocketState</code>](#SocketState) - state - original ref  

| Param | Type | Description |
| --- | --- | --- |
| state | [<code>SocketState</code>](#SocketState) | socket |
| chanId | <code>string</code> \| <code>number</code> | ID of channel to unsubscribe from |

<a name="AuthArgs"></a>

## AuthArgs : <code>object</code>
Socket authentication arguments, provided to WSv2 clients by the
[Manager](#Manager).

**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [dms] | <code>number</code> | <code>0</code> | dead man switch, active 4 |
| [calc] | <code>number</code> | <code>0</code> | calc |

<a name="FullAuthArgs"></a>

## FullAuthArgs : [<code>AuthArgs</code>](#AuthArgs)
Like [AuthArgs](#AuthArgs) but with API
credentials.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| apiKey | <code>string</code> | api key |
| apiSecret | <code>string</code> | api secret |

<a name="PluginEventHandler"></a>

## PluginEventHandler ⇒ <code>Array</code> \| <code>null</code>
A plugin event handler function.

**Kind**: global typedef  
**Returns**: <code>Array</code> \| <code>null</code> - stateUpdate - of the form `[socketState, pluginState]`  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | arguments |
| args.state | [<code>SocketState</code>](#SocketState) | target socket |

<a name="PluginGenerator"></a>

## PluginGenerator ⇒ [<code>Plugin</code>](#Plugin)
Function that returns a [Plugin](#Plugin)
object given a set of arguments.

**Kind**: global typedef  
**Returns**: [<code>Plugin</code>](#Plugin) - plugin  

| Param | Type | Description |
| --- | --- | --- |
| pluginArgs | <code>object</code> | plugin arguments |

<a name="PluginHelpers"></a>

## PluginHelpers : <code>object</code>
An object passed to all plugin method handlers

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| emit | <code>function</code> | emit a plugin event automatically including the   plugin ID |
| getState | <code>function</code> | returns the current plugin state |

<a name="Plugin"></a>

## Plugin : <code>object</code>
Plugin for a [Manager](#Manager) instance.

**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>string</code> |  | unique plugin ID |
| type | <code>string</code> |  | must be 'ws2' |
| [initialState] | <code>object</code> | <code>{}</code> | initial plugin state |
| [manager] | <code>object</code> |  | high-level manager event handler object |
| [manager."ws:created"] | <code>function</code> |  | called when a new socket is   opened |
| [manager."ws:destroyed"] | <code>function</code> |  | called when an existing   socket is destroyed. |
| [ws] | <code>object</code> |  | socket-level event handler object |
| [ws.open] | <code>function</code> |  | called on socket open |
| [ws.message] | <code>function</code> |  | called when any message is received |
| [ws.error] | <code>function</code> |  | called on socket error |
| [ws.close] | <code>function</code> |  | called on socket close |
| [events] | <code>object</code> |  | high-level socket event handler object |
| [events.auth] | <code>function</code> |  | called on socket auth (success or   failure) |
| [events."auth:success"] | <code>function</code> |  | called on auth success |
| [events."auth:error"] | <code>function</code> |  | called on auth failure |
| [events.subscribed] | <code>function</code> |  | called on channel subscription   (confirmed) |
| [events.unsubscribed] | <code>function</code> |  | called on channel unsubscribe   (confirmed) |
| [events.info] | <code>function</code> |  | called when an info message is received |
| [events.config] | <code>function</code> |  | called on any config event |
| [events.error] | <code>function</code> |  | called on any error |
| [data] | <code>object</code> |  | data-related event handler object |
| [data.ticker] | <code>function</code> |  | called when ticker data is received |
| [data.trades] | <code>function</code> |  | called when trade data is received |
| [data.candles] | <code>function</code> |  | called when candle data is received |
| [data.book] | <code>function</code> |  | called when order book data is received |
| [auth] | <code>object</code> |  | auth-channel data event handler object |
| [auth.te] | <code>function</code> |  | called when a 'te' packet is received |
| [auth.tu] | <code>function</code> |  | called when a 'tu' packet is received |
| [auth.os] | <code>function</code> |  | called when an 'os' packet is received |
| [auth.ou] | <code>function</code> |  | called when an 'ou' packet is received |
| [auth.on] | <code>function</code> |  | called when an 'on' packet is received |
| [auth.oc] | <code>function</code> |  | called when an 'oc' packet is received |
| [auth.ps] | <code>function</code> |  | called when an 'ps' packet is received |
| [auth.pu] | <code>function</code> |  | called when an 'pu' packet is received |
| [auth.pn] | <code>function</code> |  | called when an 'pn' packet is received |
| [auth.pc] | <code>function</code> |  | called when an 'pc' packet is received |
| [auth.fos] | <code>function</code> |  | called when an 'fos' packet is received |
| [auth.fon] | <code>function</code> |  | called when an 'fon' packet is received |
| [auth.fou] | <code>function</code> |  | called when an 'fou' packet is received |
| [auth.foc] | <code>function</code> |  | called when an 'foc' packet is received |
| [auth.fcs] | <code>function</code> |  | called when an 'fcs' packet is received |
| [auth.fcn] | <code>function</code> |  | called when an 'fcn' packet is received |
| [auth.fcu] | <code>function</code> |  | called when an 'fcu' packet is received |
| [auth.fcc] | <code>function</code> |  | called when an 'fcc' packet is received |
| [auth.fls] | <code>function</code> |  | called when an 'fls' packet is received |
| [auth.fln] | <code>function</code> |  | called when an 'fln' packet is received |
| [auth.flu] | <code>function</code> |  | called when an 'flu' packet is received |
| [auth.flc] | <code>function</code> |  | called when an 'flc' packet is received |
| [auth.ws] | <code>function</code> |  | called when an 'ws' packet is received |
| [auth.wu] | <code>function</code> |  | called when an 'wu' packet is received |
| [auth.bu] | <code>function</code> |  | called when an 'bu' packet is received |
| [auth.miu] | <code>function</code> |  | called when an 'miu' packet is received |
| [auth.fiu] | <code>function</code> |  | called when an 'fiu' packet is received |
| [auth.fte] | <code>function</code> |  | called when an 'fte' packet is received |
| [auth.ftu] | <code>function</code> |  | called when an 'ftu' packet is received |

<a name="SocketState"></a>

## SocketState : <code>object</code>
A single Bitfinex WebSocket v2 API connection, and all associated state/data

**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| channels | <code>object</code> |  | key'ed by ID, values are subscription   confirmations (includes channel filter data) |
| pendingSubscriptions | <code>Array.&lt;Array&gt;</code> |  | array with elements of the form   `[channelType, payload]` i.e. `['trades', { symbol: 'tBTCUSD" ]]`,   referring to channels that have been subscribed too but no confirmation   packet has yet been received. |
| pendingUnsubscriptions | <code>Array.&lt;Array&gt;</code> |  | array of the same format as   `pendingSubscriptions`, but refers to channels which have been   unsubscribed from but no confirmation packet has yet been received. |
| plugins | <code>object</code> |  | [Plugin](#Plugin)   objects key'ed by ID |
| id | <code>number</code> |  | unique socket identifier |
| isOpen | <code>boolean</code> |  | indicates if the connection is open |
| sendBuffer | <code>Array.&lt;Array&gt;</code> |  | array of packets to be sent once the   connection is established; used to buffer packets sent prior to connect. |
| [apiKey] | <code>string</code> |  | api key |
| [apiSecret] | <code>string</code> |  | api secret |
| [transform] | <code>boolean</code> | <code>false</code> | enables automatic transformation of   incoming data to models |
| [agent] | <code>function</code> |  | connection agent |
| ev | <code>EventEmitter</code> |  | socket event emitter |
| emit | <code>function</code> |  | wrapper around `ev.emit` inside a   `setTimeout(..., 0)` call |
| ws | <code>WebSocket</code> |  | actual websocket client object |

