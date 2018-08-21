'use strict'

const debug = require('debug')('bfx:api:ws2:open')
const { EventEmitter } = require('events')
const WebSocket = require('ws')
const { WS_URL } = require('../config')
const bindEV = require('./bind_ev')

module.exports = (url = WS_URL, agent) => {
  debug('connecting to %s...', url)

  const ws = new WebSocket(url, { agent })
  const ev = new EventEmitter()

  bindEV({ ws, ev })

  return { ws, ev }
}
