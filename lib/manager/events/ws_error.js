'use strict'

const debug = require('debug')('bfx:api:manager:events:ws:error')

/**
 * Notifies an error
 *
 * @param {Manager} m
 * @param {number} wsID
 * @param {Error|Object} err - ws2 error object or native Error instance
 */
module.exports = (m, wsID, err) => {
  debug('ws client (%d) error: %s', wsID, err.message || err.msg)

  m.notifyPlugins('ws2', 'ws', 'error', {
    id: wsID,
    err
  })

  m.emit('ws2:error', err, {
    id: wsID
  })
}
