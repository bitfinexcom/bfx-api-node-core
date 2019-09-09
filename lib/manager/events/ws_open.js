'use strict'

const debug = require('debug')('bfx:api:manager:events:ws:open')
const authWS = require('../../ws2/auth')
const flushSendBuffer = require('../../ws2/flush_send_buffer')

/**
 * Notifies that the connection is opened, flushes the send buffer, and
 * authenticates if auth credentials are available
 *
 * @param {Manager} m
 * @param {number} id - websocket ID
 */
module.exports = (m, id) => {
  debug('connection opened (%d)', id)

  const prevWSState = m.getWS(id)
  const ws = flushSendBuffer({
    ...prevWSState,
    isOpen: true
  })

  m.updateWS(id, ws)
  m.notifyPlugins('ws2', 'ws', 'open', { id })
  m.emit('ws2:open', { id })

  if (m.apiKey && m.apiSecret) {
    authWS(ws, m.authArgs).then(() => {
      debug('authenticated socket %d', id)
    }).catch((err) => {
      debug('failed to authenticate: %j', err)
    })
  }
}
