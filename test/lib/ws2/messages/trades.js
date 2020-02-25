/* eslint-env mocha */
'use strict'

const assert = require('assert')
const onTradesMessage = require('../../../../lib/ws2/messages/trades')
const { Trade, PublicTrade } = require('bfx-api-node-models')

const defaultState = {
  transform: false,
  emit: () => {}
}

const channel = {
  symbol: 'tBTCUSD',
  pair: 'BTCUSD'
}

describe('ws2:messages:trades', () => {
  it('emits no data for heartbeats', (done) => {
    onTradesMessage({
      msg: [15, 'hb'],
      state: {
        ...defaultState,
        emit: (eventName) => {
          done(new Error(`should not have emitted any event (${eventName})`))
        }
      }
    })

    done()
  })

  it('emits raw data if not transforming', (done) => {
    const tradeMessage = [25, [[12, Date.now(), 1525.2523, 1214.2]]]

    onTradesMessage({
      channel,
      msg: tradeMessage,
      payload: tradeMessage[1],
      state: {
        ...defaultState,
        emit: (eventName, packet = {}) => {
          if (eventName === 'data:trades') {
            const { msg, original, requested, chanFilter } = packet
            assert.deepStrictEqual(msg, tradeMessage)
            assert.deepStrictEqual(original, tradeMessage[1])
            assert.deepStrictEqual(requested, tradeMessage[1])
            assert.deepStrictEqual(chanFilter, channel)
            done()
          }
        }
      }
    })
  })

  it('emits transformed account trades if necessary', (done) => {
    const tradeMessage = [0, [[
      12, 'tBTCUSD', Date.now(), 23523, 1241.12, 12.42, 'LIMIT', 12.42, 1, 0.124, 'USD'
    ]]]

    onTradesMessage({
      channel,
      msg: tradeMessage,
      payload: tradeMessage[1],
      state: {
        ...defaultState,
        transform: true,
        emit: (eventName, packet = {}) => {
          if (eventName === 'data:trades') {
            const { msg, original, requested, chanFilter } = packet
            assert.deepStrictEqual(msg, tradeMessage)
            assert.deepStrictEqual(original, tradeMessage[1])
            assert(requested instanceof Trade)
            assert.deepStrictEqual(chanFilter, channel)
            done()
          }
        }
      }
    })
  })

  it('emits transformed public trades if necessary', (done) => {
    const tradeMessage = [25, [[12, Date.now(), 1525.2523, 1214.2]]]

    onTradesMessage({
      channel,
      msg: tradeMessage,
      payload: tradeMessage[1],
      state: {
        ...defaultState,
        transform: true,
        emit: (eventName, packet = {}) => {
          if (eventName === 'data:trades') {
            const { msg, original, requested, chanFilter } = packet
            assert.deepStrictEqual(msg, tradeMessage)
            assert.deepStrictEqual(original, tradeMessage[1])
            assert(requested instanceof PublicTrade)
            assert.deepStrictEqual(chanFilter, channel)
            done()
          }
        }
      }
    })
  })
})
