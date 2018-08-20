'use strict'

const setFlags = require('./set')

module.exports = (state = {}, flag) => {
  const { flags } = state

  return setFlags(state, flags | flag)
}
