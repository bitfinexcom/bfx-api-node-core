'use strict'

/**
 * Notifies a ws2 event (subscribed, config, auth, etc)
 *
 * @private
 *
 * @param {Manager} m - manager
 * @param {number} id - websocket ID
 * @param {string} type - i.e. subscribed, auth, info, etc
 * @param {object} data - event data
 */
const onWSEvent = (m, id, type, data) => {
  m.notifyPlugins('ws2', 'events', type, { id, data })
  m.emit(`ws2:event:${type}`, data, { id })
}

module.exports = onWSEvent
