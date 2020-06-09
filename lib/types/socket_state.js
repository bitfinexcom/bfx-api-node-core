'use strict'

/**
 * A single Bitfinex WebSocket v2 API connection, and all associated state/data
 *
 * @typedef {object} SocketState
 * @property {object} channels - key'ed by ID, values are subscription
 *   confirmations (includes channel filter data)
 * @property {Array[]} pendingSubscriptions - array with elements of the form
 *   `[channelType, payload]` i.e. `['trades', { symbol: 'tBTCUSD" ]]`,
 *   referring to channels that have been subscribed too but no confirmation
 *   packet has yet been received.
 * @property {Array[]} pendingUnsubscriptions - array of the same format as
 *   `pendingSubscriptions`, but refers to channels which have been
 *   unsubscribed from but no confirmation packet has yet been received.
 * @property {object} plugins - {@link Plugin}
 *   objects key'ed by ID
 * @property {number} id - unique socket identifier
 * @property {boolean} isOpen - indicates if the connection is open
 * @property {Array[]} sendBuffer - array of packets to be sent once the
 *   connection is established; used to buffer packets sent prior to connect.
 * @property {string} [apiKey] - api key
 * @property {string} [apiSecret] - api secret
 * @property {boolean} [transform=false] - enables automatic transformation of
 *   incoming data to models
 * @property {Function} [agent] - connection agent
 * @property {EventEmitter} ev - socket event emitter
 * @property {Function} emit - wrapper around `ev.emit` inside a
 *   `setTimeout(..., 0)` call
 * @property {WebSocket} ws - actual websocket client object
 */
