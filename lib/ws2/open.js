'use strict'

const debug = require('debug')('bfx:api:ws2:open')
const { EventEmitter } = require('events')
const WebSocket = require('ws')

const { WS_URL } = require('../config')
const bindEV = require('./bind_ev')

/**
 * Opens a websocket connection to the provided Bitfinex API URL and prepares
 * an event emitter to capture and report API stream events.
 *
 *
 * @param {string} [url='wss://api.bitfinex.com/ws/2'] - endpoint
 * @param {object} [agent] - connection agent
 * @returns {object} connectionState - see
 *   {@link initState}
 */
const open = (url = WS_URL, agent) => {
  debug('connecting to %s...', url)

  const ws = new WebSocket(url, { agent })
  const ev = new EventEmitter()

  ev.setMaxListeners(1000)

  bindEV({ ws, ev })

  return { ws, ev }
}

module.exports = open
