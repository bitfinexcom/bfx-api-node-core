'use strict'

const send = require('../send')

module.exports = (state = {}, flags) => {
  // TODO: Event promise

  const nextState = send(state, {
    event: 'conf',
    flags
  })

  return {
    ...nextState,
    flags,
  }
}