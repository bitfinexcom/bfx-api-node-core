'use strict'

const debug = require('debug')('bfx:api:manager:events:ws:error')

/**
 * Notifies an error
 *
 * @private
 *
 * @param {Manager} m - manager
 * @param {number} wsID - socket ID
 * @param {Error|object} err - ws2 error object or native Error instance
 */
const onWSErrorEvent = (m, wsID, err) => {
  debug('ws client (%d) error: %s', wsID, err.message || err.msg)

  m.notifyPlugins('ws2', 'ws', 'error', {
    id: wsID,
    err
  })

  m.emit('ws2:error', err, {
    id: wsID
  })
}

module.exports = onWSErrorEvent
