'use strict'

const debug = require('debug')('bfx:api:ws:messages:tickers')
const _isArray = require('lodash/isArray')
const { TradingTicker, FundingTicker } = require('bfx-api-node-models')

module.exports = (args = {}) => {
  const { state = {}, payload = [], channel = {}, msg } = args
  const { transform, emit } = state
  const { symbol, pair } = channel
  let data = payload

  if (!_isArray(data)) { // hb/no payload on message
    return null
  } else if (!_isArray(data[0])) { // ensure array of items
    data = [data]
  }

  if (transform) {
    const seed = [symbol, ...data]

    data = (symbol || '')[0] === 't'
      ? new TradingTicker(seed)
      : new FundingTicker(seed)
  }

  // Funding tickers lack a pair
  debug('recv ticker data on channel %s:%s', symbol, pair || '')

  emit('data:ticker', {
    msg,
    original: payload,
    requested: data,
    chanFilter: {
      symbol,
      pair,
    },
  })

  return null
}
