'use strict'

// const debug = require('debug')('bfx:api:ws:messages:auth')
const onNotification = require('./notifications')

module.exports = (args = {}) => {
  const { state = {}, msg = [] } = args
  const { emit } = state
  const [, type] = msg

  emit('data:auth', msg)

  if (type === 'n') {
    return onNotification(args)
  }

  return null
}
