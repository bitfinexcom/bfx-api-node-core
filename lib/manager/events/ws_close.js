'use strict'

const debug = require('debug')('bfx:api:manager:events:ws:close')

/**
 * Notifies ws2:close and closes the websocket if it hasn't already been closed
 * elsewhere (managedClose flag)
 *
 * @memberof module:bfx-api-node-core
 * @private
 *
 * @param {module:bfx-api-node-core.Manager} m - manager
 * @param {number} wsID - socket ID
 */
const onWSCloseEvent = (m, wsID) => {
  const ws = m.getWS(wsID)

  if (!ws) {
    debug('ws connection closed unsafely: %d', wsID)
    return
  }

  m.notifyPlugins('ws2', 'ws', 'close', { id: wsID })
  m.emit('ws2:close', { id: wsID })

  if (!ws.managedClose) {
    debug('removing connection (%d)', wsID)
    m.closeWS(wsID)
  }

  debug('ws client connection closed (%d)', wsID)
}

module.exports = onWSCloseEvent
