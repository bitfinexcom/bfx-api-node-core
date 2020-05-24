'use strict'

/**
 * Emits a plugin event via a ws event emitter
 *
 * @param {string} id - plugin ID
 * @param {EventEmitter} ev - websocket ev
 * @param {string} label - event label, prefixed
 * @param {object} args - emitted with event
 */
module.exports = (id, ev, label, args) => {
  ev.emit('plugin:event', id, label, args)
}
