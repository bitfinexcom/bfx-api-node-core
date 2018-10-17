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

  let nextWSState = m.getWS(id)
  const { channels } = nextWSState
  const channelIds = Object.keys(channels)

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

        nextWSState = subscribe(nextWSState, 'trades', filter)
        break
      }

      case 'candles': {
        const { key } = data
        nextWSState = subscribe(nextWSState, 'candles', { key })
        break
      }

      case 'book': {
        const { symbol, prec, len } = data
        nextWSState = subscribe(nextWSState, 'book', { symbol, prec, len })
        break
      }

      case 'ticker': {
        const { symbol } = data
        nextWSState = subscribe(nextWSState, 'ticker', { symbol })
        break
      }

      default: {
        throw new Error(`unknown channel type: ${data.channel}`)
      }
    }
  })

  m.updateWS(id, nextWSState)
}