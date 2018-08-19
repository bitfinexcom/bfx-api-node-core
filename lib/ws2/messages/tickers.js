'use strict'

const debug = require('debug')('bfx:api:ws:messages:tickers')
const { TradingTicker, FundingTicker } = require('bfx-api-node-models')
const msgPayload = require('../../util/msg_payload')

module.exports = (state = {}, msg = [], chanData = {}) => {
  const { transform, ev } = state
  const payload = msgPayload(msg)
  let data = payload

  if (transform) {
    const seed = [chanData.symbol, ...payload]

    data = (chanData.symbol || '')[0] === 't'
      ? new TradingTicker(seed)
      : new FundingTicker(seed)
  }

  ev.emit('data:ticker', {
    original: payload,
    requested: data,
    chanData,
  })

  return null
}
