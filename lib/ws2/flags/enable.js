'use strict'

const setFlags = require('./set')

module.exports = (state = {}, flag, silent) => {
  const { flags, ev } = state
  const nextFlags = flags | flag

  if (!silent) {
    ev.emit('exec:flags:set', nextFlags)
  }

  return setFlags(state, nextFlags)
}
