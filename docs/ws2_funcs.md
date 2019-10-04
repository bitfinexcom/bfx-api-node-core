## Functions

<dl>
<dt><a href="#auth">auth(state, opts)</a> ⇒ <code>Promise</code></dt>
<dd><p>Attempts to authenticate with the connection&#39;s configured API credentials,
and the provided flags. Returns a promise that resolves/rejects on
success/failure.</p>
</dd>
<dt><a href="#initState">initState(opts)</a> ⇒ <code>Object</code></dt>
<dd><p>Creates &amp; opens a WSv2 API connection, and returns the resulting state object</p>
</dd>
<dt><a href="#open">open(url, agent)</a> ⇒ <code>Object</code></dt>
<dd><p>Opens a websocket connection to the provided Bitfinex API URL and prepares
an event emitter to capture and report API stream events.</p>
</dd>
<dt><a href="#send">send(state, msg)</a></dt>
<dd><p>Sends the provided data to the active WebSocket connection, or buffers it if
the connection is not yet open.</p>
</dd>
<dt><a href="#subscribe">subscribe(state, channel, payload)</a></dt>
<dd><p>Subscribes to the specified channel, buffers if the connection is not open.</p>
</dd>
<dt><a href="#unsubscribe">unsubscribe(state, chanId)</a></dt>
<dd><p>Unsubscribes from the specified channel, buffers if the connection is not
open.</p>
</dd>
<dt><a href="#cancelOrder">cancelOrder(state, order)</a> ⇒ <code>Promise</code></dt>
<dd><p>Cancels an order from either an order object, array, or raw ID.</p>
</dd>
<dt><a href="#cancelOrderWithDelay">cancelOrderWithDelay(state, delay, order)</a> ⇒ <code>Promise</code></dt>
<dd><p>Cancels an order from either an order object, array, or raw ID, after the
specified delay.</p>
</dd>
<dt><a href="#submitOrder">submitOrder(state, order)</a> ⇒ <code>Promise</code></dt>
<dd><p>Submits an order with either an order model or raw order object.</p>
</dd>
<dt><a href="#submitOrderWithDelay">submitOrderWithDelay(state, delay, order)</a> ⇒ <code>Promise</code></dt>
<dd><p>Submits an order with either an order model or raw order object, after the
specified delay.</p>
</dd>
<dt><a href="#updateOrder">updateOrder(state, changes)</a> ⇒ <code>Promise</code></dt>
<dd><p>Updates an order in-place.</p>
</dd>
<dt><a href="#disableFlag">disableFlag(state, flag, silent)</a> ⇒ <code>Object</code></dt>
<dd><p>Disables a flag; updates the connection flag set</p>
</dd>
<dt><a href="#enableFlag">enableFlag(state, flag, silent)</a> ⇒ <code>Object</code></dt>
<dd><p>Enables a flag; updates the connection flag set</p>
</dd>
<dt><a href="#isFlagEnabled">isFlagEnabled(state, flag)</a> ⇒ <code>boolean</code></dt>
<dd></dd>
<dt><a href="#setFlags">setFlags(state, flags, silent)</a> ⇒ <code>Object</code></dt>
<dd><p>Updates the connections flags</p>
</dd>
</dl>

<a name="auth"></a>

## auth(state, opts) ⇒ <code>Promise</code>
Attempts to authenticate with the connection's configured API credentials,
and the provided flags. Returns a promise that resolves/rejects on
success/failure.

**Kind**: global function  
**Returns**: <code>Promise</code> - p - resolves on successful auth  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>Object</code> |  |
| opts | <code>Object</code> |  |
| opts.dms | <code>number</code> | dead man switch, active 4 |
| opts.calc | <code>number</code> |  |

<a name="initState"></a>

## initState(opts) ⇒ <code>Object</code>
Creates & opens a WSv2 API connection, and returns the resulting state object

**Kind**: global function  
**Returns**: <code>Object</code> - state  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> |  |
| opts.url | <code>string</code> | defaults to production Bitfinex WSv2 API url |
| opts.agent | <code>Object</code> | connection agent |
| opts.transform | <code>boolean</code> | if true, raw API data arrays will be automatically converted to bfx-api-node-models instances |
| opts.apiKey | <code>string</code> | for later authentication |
| opts.apiSecret | <code>string</code> | for later authentication |
| opts.plugins | <code>Object</code> | optional set of plugins to use with the connection |

<a name="open"></a>

## open(url, agent) ⇒ <code>Object</code>
Opens a websocket connection to the provided Bitfinex API URL and prepares
an event emitter to capture and report API stream events.

**Kind**: global function  
**Returns**: <code>Object</code> - connectionState - see @initState  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | defaults to production Bitfinex WSv2 API url |
| agent | <code>Object</code> | connection agent |

<a name="send"></a>

## send(state, msg)
Sends the provided data to the active WebSocket connection, or buffers it if
the connection is not yet open.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>Object</code> |  |
| msg | <code>\*</code> | converted to a JSON string before being sent |

<a name="subscribe"></a>

## subscribe(state, channel, payload)
Subscribes to the specified channel, buffers if the connection is not open.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>Object</code> |  |
| channel | <code>string</code> | channel type, i.e. 'trades' |
| payload | <code>Object</code> | channel filter, i.e. { symbol: '...' } |

<a name="unsubscribe"></a>

## unsubscribe(state, chanId)
Unsubscribes from the specified channel, buffers if the connection is not
open.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>Object</code> |  |
| chanId | <code>string</code> \| <code>number</code> | ID of channel to unsubscribe from |

<a name="cancelOrder"></a>

## cancelOrder(state, order) ⇒ <code>Promise</code>
Cancels an order from either an order object, array, or raw ID.

**Kind**: global function  
**Returns**: <code>Promise</code> - p - resolves/rejects upon confirmation  

| Param | Type |
| --- | --- |
| state | <code>Object</code> | 
| order | <code>Object</code> \| <code>Array</code> \| <code>number</code> | 

<a name="cancelOrderWithDelay"></a>

## cancelOrderWithDelay(state, delay, order) ⇒ <code>Promise</code>
Cancels an order from either an order object, array, or raw ID, after the
specified delay.

**Kind**: global function  
**Returns**: <code>Promise</code> - p - resolves/rejects upon confirmation  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>Object</code> |  |
| delay | <code>number</code> | in ms |
| order | <code>Object</code> \| <code>Array</code> \| <code>number</code> |  |

<a name="submitOrder"></a>

## submitOrder(state, order) ⇒ <code>Promise</code>
Submits an order with either an order model or raw order object.

**Kind**: global function  
**Returns**: <code>Promise</code> - p - resolves/rejects upon confirmation  

| Param | Type |
| --- | --- |
| state | <code>Object</code> | 
| order | <code>Object</code> \| <code>Array</code> | 

<a name="submitOrderWithDelay"></a>

## submitOrderWithDelay(state, delay, order) ⇒ <code>Promise</code>
Submits an order with either an order model or raw order object, after the
specified delay.

**Kind**: global function  
**Returns**: <code>Promise</code> - p - resolves/rejects upon confirmation  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>Object</code> |  |
| delay | <code>number</code> | in ms |
| order | <code>Object</code> \| <code>Array</code> |  |

<a name="updateOrder"></a>

## updateOrder(state, changes) ⇒ <code>Promise</code>
Updates an order in-place.

**Kind**: global function  
**Returns**: <code>Promise</code> - p - resolves/rejects upon confirmation  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>Object</code> |  |
| changes | <code>Object</code> | order update packet |
| changes.id | <code>Object</code> | id of order to apply update to |

<a name="disableFlag"></a>

## disableFlag(state, flag, silent) ⇒ <code>Object</code>
Disables a flag; updates the connection flag set

**Kind**: global function  
**Returns**: <code>Object</code> - nextState  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>Object</code> |  |
| flag | <code>number</code> | individual flag to disable |
| silent | <code>boolean</code> | if true, no event is emitted |

<a name="enableFlag"></a>

## enableFlag(state, flag, silent) ⇒ <code>Object</code>
Enables a flag; updates the connection flag set

**Kind**: global function  
**Returns**: <code>Object</code> - nextState  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>Object</code> |  |
| flag | <code>number</code> | individual flag to enable |
| silent | <code>boolean</code> | if true, no event is emitted |

<a name="isFlagEnabled"></a>

## isFlagEnabled(state, flag) ⇒ <code>boolean</code>
**Kind**: global function  
**Returns**: <code>boolean</code> - enabled  

| Param | Type |
| --- | --- |
| state | <code>Object</code> | 
| flag | <code>number</code> | 

<a name="setFlags"></a>

## setFlags(state, flags, silent) ⇒ <code>Object</code>
Updates the connections flags

**Kind**: global function  
**Returns**: <code>Object</code> - nextState  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>Object</code> |  |
| flags | <code>number</code> | full flag set |
| silent | <code>boolean</code> | if true, no event is emitted |

