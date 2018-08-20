'use strict'

const debug = require('debug')('bfx:api:ws:messages:tickers')
const { TradingTicker, FundingTicker } = require('bfx-api-node-models')

module.exports = (args = {}) => {
  const { state = {}, payload = [], channel = {} } = args
  const { transform, ev } = state
  const { symbol, pair } = channel
  let data = payload

  if (transform) {
    const seed = [symbol, ...payload]

    data = (symbol || '')[0] === 't'
      ? new TradingTicker(seed)
      : new FundingTicker(seed)
  }

  // Funding tickers lack a pair
  debug('recv ticker data on channel %s:%s', symbol, pair || '')

  ev.emit('data:ticker', {
    original: payload,
    requested: data,
    chanFilter: {
      symbol,
      pair,
    },
  })

  return null
}
