'use strict'

// const debug = require('debug')('bfx:api:ws:messages:auth')
const onNotification = require('./notifications')

module.exports = (args = {}) => {
  const { msg = [] } = args
  const [, type] = msg

  if (type === 'n') {
    return onNotification(args)
  }

  // TODO: Propagate

  return null
}
