'use strict'

const debug = require('debug')('bfx:api:ws2:open')
const { EventEmitter } = require('events')
const WebSocket = require('ws')
const { WS_URL } = require('../config')
const id = require('../id')

module.exports = (opts = {}, url = WS_URL, agent) => {
  debug('connecting to %s...', url)

  const ws = new WebSocket(url, { agent })
  const ev = new EventEmitter()

  ws.on('open', () => {
    ev.emit('self:open')
  })

  ws.on('message', (msg, flags) => {
    ev.emit('self:message', msg, flags)
  })

  ws.on('error', (err) => {
    ev.emit('self:error', err)
  })

  ws.on('close', () => {
    ev.emit('self:close')
  })

  return {
    ...opts,
    channels: {},
    id: id(),
    ev,
    ws,
  }
}
