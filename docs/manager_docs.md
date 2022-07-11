<a name="Manager"></a>

## Manager
WSv2 connection pool manager. Limits active channel subscriptions per socket,
opening new sockets/closing existing one as needed.

**Kind**: global class  

* [Manager](#Manager)
    * [new Manager(args)](#new_Manager_new)
    * [.hasPlugin(plugin)](#Manager+hasPlugin) ⇒ <code>boolean</code>
    * [.addPlugin(plugin)](#Manager+addPlugin)
    * [.auth(args)](#Manager+auth)
    * [.getWS(id)](#Manager+getWS) ⇒ <code>Object</code>
    * [.getWSIndex(id)](#Manager+getWSIndex) ⇒ <code>number</code>
    * [.getWSByIndex(index)](#Manager+getWSByIndex) ⇒ <code>Object</code>
    * [.updateWS(id, state)](#Manager+updateWS)
    * [.closeAllSockets()](#Manager+closeAllSockets)
    * [.reconnectAllSockets()](#Manager+reconnectAllSockets)
    * [.closeWS(id)](#Manager+closeWS)
    * [.openWS()](#Manager+openWS) ⇒ <code>Object</code>
    * [.onWS(eventName, filterValue, cb)](#Manager+onWS)
    * [.onceWS(eventName, filterValue, cb)](#Manager+onceWS)
    * [.notifyPlugins(type, section, name, args)](#Manager+notifyPlugins)
    * [.withFreeDataSocket(cb)](#Manager+withFreeDataSocket)
    * [.withDataSocket(filterCb, cb)](#Manager+withDataSocket)
    * [.withAuthSocket(cb)](#Manager+withAuthSocket)
    * [.withSocket(cb)](#Manager+withSocket)
    * [.sampleWS()](#Manager+sampleWS) ⇒ <code>Object</code>
    * [.sampleWSI()](#Manager+sampleWSI) ⇒ <code>number</code>
    * [.applyWS(index, cb)](#Manager+applyWS)

<a name="new_Manager_new"></a>

### new Manager(args)

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Object</code> |  |
| args.wsURL | <code>string</code> | defaults to production Bitfinex WSv2 API url |
| args.agent | <code>Object</code> | connection agent |
| args.apiKey | <code>string</code> | used to authenticate sockets |
| args.apiSecret | <code>string</code> | used to authenticate sockets |
| args.authToken | <code>string</code> | used to authenticate sockets; has priority over API key/secret |
| args.autoResubscribe | <code>boolean</code> | default true |
| args.channelsPerSocket | <code>number</code> | defaults to 30 |
| args.dms | <code>number</code> | dead-man-switch flag sent on auth, active 4 |
| args.calc | <code>number</code> |  |
| args.transform | <code>boolean</code> | if true, raw API data arrays will be automatically converted to bfx-api-node-models instances |
| args.plugins | <code>Object</code> | optional set of plugins to use |
| args.channelFilters | <code>Array.&lt;string&gt;</code> | During authentication you can provide an array to indicate which information/messages you are interested to receive (default = everything). |

<a name="Manager+hasPlugin"></a>

### manager.hasPlugin(plugin) ⇒ <code>boolean</code>
**Kind**: instance method of [<code>Manager</code>](#Manager)  
**Returns**: <code>boolean</code> - hasPlugin  

| Param | Type |
| --- | --- |
| plugin | <code>Object</code> | 

<a name="Manager+addPlugin"></a>

### manager.addPlugin(plugin)
No-op if the plugin is already registered

**Kind**: instance method of [<code>Manager</code>](#Manager)  

| Param | Type |
| --- | --- |
| plugin | <code>Object</code> | 

<a name="Manager+auth"></a>

### manager.auth(args)
Authenticates all open API connections

**Kind**: instance method of [<code>Manager</code>](#Manager)  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Object</code> | optional, defaults to values provided to constructor |
| args.apiKey | <code>string</code> |  |
| args.apiSecret | <code>string</code> |  |
| args.authToken | <code>string</code> |  |
| args.dms | <code>number</code> | dead man switch, active 4 |
| args.calc | <code>number</code> |  |
| args.forceAuth | <code>boolean</code> |  |

<a name="Manager+getWS"></a>

### manager.getWS(id) ⇒ <code>Object</code>
Returns a connection state object by ID

**Kind**: instance method of [<code>Manager</code>](#Manager)  
**Returns**: <code>Object</code> - state - connection state  

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

### manager.getWSByIndex(index) ⇒ <code>Object</code>
Returns a connection state object by pool index

**Kind**: instance method of [<code>Manager</code>](#Manager)  
**Returns**: <code>Object</code> - state - connection state  

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
| id | <code>number</code> |  |
| state | <code>Object</code> | new connection state |

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

| Param | Type |
| --- | --- |
| id | <code>number</code> | 

<a name="Manager+openWS"></a>

### manager.openWS() ⇒ <code>Object</code>
Creates & opens a new WSv2 connection, adds it to the pool, and returns it

**Kind**: instance method of [<code>Manager</code>](#Manager)  
**Returns**: <code>Object</code> - connection  
<a name="Manager+onWS"></a>

### manager.onWS(eventName, filterValue, cb)
Creates an event handler that updates the relevant internal socket state
object.

**Kind**: instance method of [<code>Manager</code>](#Manager)  

| Param | Type | Description |
| --- | --- | --- |
| eventName | <code>string</code> |  |
| filterValue | <code>Object</code> | value(s) to check for |
| cb | <code>function</code> |  |

<a name="Manager+onceWS"></a>

### manager.onceWS(eventName, filterValue, cb)
Creates an event handler that updates the relevant internal socket state
object, and only fires once

**Kind**: instance method of [<code>Manager</code>](#Manager)  

| Param | Type | Description |
| --- | --- | --- |
| eventName | <code>string</code> |  |
| filterValue | <code>Object</code> | value(s) to check for |
| cb | <code>function</code> |  |

<a name="Manager+notifyPlugins"></a>

### manager.notifyPlugins(type, section, name, args)
Calls every matching plugin with the provided arguments, and updates the
relevant ws/rest state objects internally.

State objects are only updated if plugin handlers return valid objects

**Kind**: instance method of [<code>Manager</code>](#Manager)  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | ws2 or rest2 |
| section | <code>string</code> | event section |
| name | <code>string</code> | event name |
| args | <code>Object</code> | plugin handler arguments |

<a name="Manager+withFreeDataSocket"></a>

### manager.withFreeDataSocket(cb)
Calls the provided function with a connection instance that can subscribe
to at least 1 more data channel. If no such connection is found, a new one
is opened.

**Kind**: instance method of [<code>Manager</code>](#Manager)  

| Param | Type |
| --- | --- |
| cb | <code>function</code> | 

<a name="Manager+withDataSocket"></a>

### manager.withDataSocket(filterCb, cb)
Calls the provided function with a connection instance that is subscribed
to a channel matching the provided filter callback, which is called with
each subscribed channel descriptor.

**Kind**: instance method of [<code>Manager</code>](#Manager)  

| Param | Type |
| --- | --- |
| filterCb | <code>function</code> | 
| cb | <code>function</code> | 

<a name="Manager+withAuthSocket"></a>

### manager.withAuthSocket(cb)
Calls the provided function with an authenticated socket instance; updates
the socket state with the returned result.

**Kind**: instance method of [<code>Manager</code>](#Manager)  

| Param | Type |
| --- | --- |
| cb | <code>function</code> | 

<a name="Manager+withSocket"></a>

### manager.withSocket(cb)
Calls the provided function with a random open connection instance. If none
exists, this is a no-op.

**Kind**: instance method of [<code>Manager</code>](#Manager)  

| Param | Type |
| --- | --- |
| cb | <code>function</code> | 

<a name="Manager+sampleWS"></a>

### manager.sampleWS() ⇒ <code>Object</code>
Returns a random connection from the pool

**Kind**: instance method of [<code>Manager</code>](#Manager)  
**Returns**: <code>Object</code> - state  
<a name="Manager+sampleWSI"></a>

### manager.sampleWSI() ⇒ <code>number</code>
Returns a random connection index from the pool

**Kind**: instance method of [<code>Manager</code>](#Manager)  
**Returns**: <code>number</code> - index  
<a name="Manager+applyWS"></a>

### manager.applyWS(index, cb)
Calls the provided callback with the connection at the specified pool
index, and saves the return value as the new connection instance.

**Kind**: instance method of [<code>Manager</code>](#Manager)  

| Param | Type |
| --- | --- |
| index | <code>number</code> | 
| cb | <code>function</code> | 

