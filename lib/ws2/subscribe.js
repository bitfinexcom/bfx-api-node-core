'use strict'

const send = require('./send')

module.exports = (state = {}, channel, payload = {}) => {
  return send(state, {
    ...payload,
    event: 'subscribe',
    channel,
  })
}
