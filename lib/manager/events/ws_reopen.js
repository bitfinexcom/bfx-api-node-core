'use strict'

const _isString = require('lodash/isString')
const subscribe = require('../../ws2/subscribe')

/**
 * Subscribes to all known channels if autoResubscribe is enabled
 *
 * @param {Manager} m
 * @param {number} id - websocket ID
 */
module.exports = (m, id) => {
  if (!m.autoResubscribe) {
    return
  }

  const wsState = m.getWS(id)
  const { channels } = wsState
  const channelIds = Object.keys(channels)

  m.emit('ws2:reopen', { id })

  channelIds.forEach(chanId => {
    const data = channels[chanId]

    switch (data.channel) {
      case 'auth': {
        break
      }

      case 'trades': {
        const { pair, symbol } = data
        const filter = {}

        if (_isString(pair)) {
          filter.pair = pair
        } else if (_isString(symbol)) {
          filter.symbol = symbol
        }

        subscribe(wsState, 'trades', filter)
        break
      }

      case 'candles': {
        const { key } = data
        subscribe(wsState, 'candles', { key })
        break
      }

      case 'book': {
        const { symbol, prec, len } = data
        subscribe(wsState, 'book', { symbol, prec, len })
        break
      }

      case 'ticker': {
        const { symbol } = data
        subscribe(wsState, 'ticker', { symbol })
        break
      }

      default: {
        throw new Error(`unknown channel type: ${data.channel}`)
      }
    }
  })
}