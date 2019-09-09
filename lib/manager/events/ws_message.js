'use strict'

const _isObject = require('lodash/isObject')
const onWSMessage = require('../../ws2/on_message')

/**
 * Notifies that a ws2 message has been received (generic message handler),
 * and routes the message to the relevant ws2 handler; updates socket state.
 *
 * @param {Manager} m
 * @param {number} id - websocket ID
 * @param {string} msgJSON
 * @param {Object} flags - { binary, masked } optional flags set based on data
 */
module.exports = (m, id, msgJSON = '', flags) => {
  const ws = m.getWS(id)

  let msg

  try {
    msg = JSON.parse(msgJSON)
  } catch (e) {
    m.emit('error', `invalid message JSON: ${msgJSON}`)
    return
  }

  m.notifyPlugins('ws2', 'ws', 'message', { id, msg, flags })
  m.emit('ws2:message', msg, flags, { id })

  const stateUpdate = onWSMessage(ws, msg, flags) // external

  if (_isObject(stateUpdate)) {
    m.updateWS(id, stateUpdate)
  }
}
