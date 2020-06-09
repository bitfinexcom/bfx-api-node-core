'use strict'

/**
 * Plugin for a {@link Manager|Manager} instance.
 *
 * @typedef {object} Plugin
 * @property {string} id - unique plugin ID
 * @property {string} type - must be 'ws2'
 * @property {object} [initialState={}] - initial plugin state
 *
 * @property {object} [manager] - high-level manager event handler object
 * @property {Function} [manager."ws:created"] - called when a new socket is
 *   opened
 * @property {Function} [manager."ws:destroyed"] - called when an existing
 *   socket is destroyed.
 *
 * @property {object} [ws] - socket-level event handler object
 * @property {Function} [ws.open] - called on socket open
 * @property {Function} [ws.message] - called when any message is received
 * @property {Function} [ws.error] - called on socket error
 * @property {Function} [ws.close] - called on socket close
 *
 * @property {object} [events] - high-level socket event handler object
 * @property {Function} [events.auth] - called on socket auth (success or
 *   failure)
 * @property {Function} [events."auth:success"] - called on auth success
 * @property {Function} [events."auth:error"] - called on auth failure
 * @property {Function} [events.subscribed] - called on channel subscription
 *   (confirmed)
 * @property {Function} [events.unsubscribed] - called on channel unsubscribe
 *   (confirmed)
 * @property {Function} [events.info] - called when an info message is received
 * @property {Function} [events.config] - called on any config event
 * @property {Function} [events.error] - called on any error
 *
 * @property {object} [data] - data-related event handler object
 * @property {Function} [data.ticker] - called when ticker data is received
 * @property {Function} [data.trades] - called when trade data is received
 * @property {Function} [data.candles] - called when candle data is received
 * @property {Function} [data.book] - called when order book data is received
 *
 * @property {object} [auth] - auth-channel data event handler object
 * @property {Function} [auth.te] - called when a 'te' packet is received
 * @property {Function} [auth.tu] - called when a 'tu' packet is received
 *
 * @property {Function} [auth.os] - called when an 'os' packet is received
 * @property {Function} [auth.ou] - called when an 'ou' packet is received
 * @property {Function} [auth.on] - called when an 'on' packet is received
 * @property {Function} [auth.oc] - called when an 'oc' packet is received
 *
 * @property {Function} [auth.ps] - called when an 'ps' packet is received
 * @property {Function} [auth.pu] - called when an 'pu' packet is received
 * @property {Function} [auth.pn] - called when an 'pn' packet is received
 * @property {Function} [auth.pc] - called when an 'pc' packet is received
 *
 * @property {Function} [auth.fos] - called when an 'fos' packet is received
 * @property {Function} [auth.fon] - called when an 'fon' packet is received
 * @property {Function} [auth.fou] - called when an 'fou' packet is received
 * @property {Function} [auth.foc] - called when an 'foc' packet is received
 *
 * @property {Function} [auth.fcs] - called when an 'fcs' packet is received
 * @property {Function} [auth.fcn] - called when an 'fcn' packet is received
 * @property {Function} [auth.fcu] - called when an 'fcu' packet is received
 * @property {Function} [auth.fcc] - called when an 'fcc' packet is received
 *
 * @property {Function} [auth.fls] - called when an 'fls' packet is received
 * @property {Function} [auth.fln] - called when an 'fln' packet is received
 * @property {Function} [auth.flu] - called when an 'flu' packet is received
 * @property {Function} [auth.flc] - called when an 'flc' packet is received
 *
 * @property {Function} [auth.ws] - called when an 'ws' packet is received
 * @property {Function} [auth.wu] - called when an 'wu' packet is received
 * @property {Function} [auth.bu] - called when an 'bu' packet is received
 * @property {Function} [auth.miu] - called when an 'miu' packet is received
 * @property {Function} [auth.fiu] - called when an 'fiu' packet is received
 * @property {Function} [auth.fte] - called when an 'fte' packet is received
 * @property {Function} [auth.ftu] - called when an 'ftu' packet is received
 */
