'use strict'

const Manager = require('./lib/manager')
const Config = require('./lib/config')
const flags = require('./lib/ws2/flags')
const plugins = require('./lib/plugins')
const ws2 = require('./lib/ws2')

/**
 * Modular Bitfinex Node.JS API library as an alternative to
 * {@link external:bitfinex-api-node|bitfinex-api-node}, supporting a plugin
 * system. Connection instances are POJOs as opposed to the `WSv2` class
 * instances returned by
 * {@link external:bitfinex-api-node|bitfinex-api-node} and are manipulated in
 * a functional style. A {@link Manager|connection pool manager} is also
 * provided for multiplexing.
 *
 * ### Available Plugins
 *
 * * {@link external:bfx-api-node-plugin-example|bfx-api-node-plugin-example} -
 *   skeleton plugin that serves as a reference for the required structure.
 * * {@link external:bfx-api-node-plugin-managed-candles|bfx-api-node-plugin-managed-candles} -
 *   maintains an updated candle dataset and provides events to access it on
 *   each update.
 * * {@link external:bfx-api-node-plugin-managed-ob|bfx-api-node-plugin-managed-ob} -
 *   maintains an updated full order book copy for each subscribed book
 *   channel, and provides events to access it on each update.
 * * {@link external:bfx-api-node-plugin-ob-checksum|bfx-api-node-plugin-ob-checksum} -
 *   maintains local order books for each subscribed book channel and performs
 *   automatic checksum verification, emitting a custom event on checksum
 *   mismatch.
 * * {@link external:bfx-api-node-plugin-seq-audit|bfx-api-node-plugin-seq-audit} -
 *   enables sequence numbers and performs automatic verification, emitting a
 *   custom event on sequence number mismatch.
 * * {@link external:bfx-api-node-plugin-wd|bfx-api-node-plugin-wd} - implements
 *   a connection watchdog, automatically reconnecting if no new packets are
 *   received within the configured grace period.
 *
 * @license MIT
 * @module bfx-api-node-core
 * @example
 * const { Manager, initState } = require('bfx-api-node-core')
 *
 * // Create a Manager instance with an internal connection pool, and add a
 * // connection to the pool
 * const m = new Manager({ transform: true })
 * const managedConnection = m.openWS()
 *
 * // Alternatively, create & open a single connection yourself
 * const connection = initState({ transform: true })
 *
 * // do something with connections
 */

/**
 * @external bitfinex-api-node
 * @see https://github.com/bitfinexcom/bitfinex-api-node
 */

/**
 * @external bfx-api-node-plugin-example
 * @see https://github.com/bitfinexcom/bfx-api-node-plugin-example
 */

/**
 * @external bfx-api-node-plugin-managed-candles
 * @see https://github.com/bitfinexcom/bfx-api-node-plugin-managed-candles
 */

/**
 * @external bfx-api-node-plugin-managed-ob
 * @see https://github.com/bitfinexcom/bfx-api-node-plugin-managed-ob
 */

/**
 * @external bfx-api-node-plugin-ob-checksum
 * @see https://github.com/bitfinexcom/bfx-api-node-plugin-ob-checksum
 */

/**
 * @external bfx-api-node-plugin-seq-audit
 * @see https://github.com/bitfinexcom/bfx-api-node-plugin-seq-audit
 */

/**
 * @external bfx-api-node-plugin-wd
 * @see https://github.com/bitfinexcom/bfx-api-node-plugin-wd
 */

module.exports = {
  Manager,
  Config,

  ...plugins,
  ...flags,
  ...ws2
}
