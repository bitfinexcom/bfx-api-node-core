/* eslint-env mocha */
'use strict'

const assert = require('assert')
const onTickersMessage = require('ws2/messages/tickers')
const { TradingTicker, FundingTicker } = require('bfx-api-node-models')

const defaultState = {
  transform: false,
  emit: () => {}
}

const channel = {
  symbol: 'tBTCUSD',
  pair: 'BTCUSD'
}

describe('ws2:messages:tickers', () => {
  it('emits no data for heartbeats', (done) => {
    onTickersMessage({
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
    const tickerMessage = [25, [['tBTCUSD', 51, 12523, 12, 124632, 2352, 0.235, 124, 124152, 12, 9]]]

    onTickersMessage({
      channel,
      msg: tickerMessage,
      payload: tickerMessage[1],
      state: {
        ...defaultState,
        emit: (eventName, packet = {}) => {
          if (eventName === 'data:ticker') {
            const { msg, original, requested, chanFilter } = packet
            assert.deepStrictEqual(msg, tickerMessage)
            assert.deepStrictEqual(original, tickerMessage[1])
            assert.deepStrictEqual(requested, tickerMessage[1])
            assert.deepStrictEqual(chanFilter, channel)
            done()
          }
        }
      }
    })
  })

  it('emits transformed trading ticker if necessary', (done) => {
    const tickerMessage = [25, [['tBTCUSD', 51, 12523, 12, 124632, 2352, 0.235, 124, 124152, 12, 9]]]

    onTickersMessage({
      channel,
      msg: tickerMessage,
      payload: tickerMessage[1],
      state: {
        ...defaultState,
        transform: true,
        emit: (eventName, packet = {}) => {
          if (eventName === 'data:ticker') {
            const { msg, original, requested, chanFilter } = packet
            assert.deepStrictEqual(msg, tickerMessage)
            assert.deepStrictEqual(original, tickerMessage[1])
            assert(requested instanceof TradingTicker)
            assert.deepStrictEqual(chanFilter, channel)
            done()
          }
        }
      }
    })
  })

  it('emits transformed funding ticker if necessary', (done) => {
    const tickerMessage = [25, [['tBTCUSD', 51, 12523, 12, 124632, 2352, 0.235, 124, 124152, 12, 9]]]
    const channel = { // NOTE: Shadows
      symbol: 'fUSD',
      pair: 'USD'
    }

    onTickersMessage({
      channel,
      msg: tickerMessage,
      payload: tickerMessage[1],
      state: {
        ...defaultState,
        transform: true,
        emit: (eventName, packet = {}) => {
          if (eventName === 'data:ticker') {
            const { msg, original, requested, chanFilter } = packet
            assert.deepStrictEqual(msg, tickerMessage)
            assert.deepStrictEqual(original, tickerMessage[1])
            assert(requested instanceof FundingTicker)
            assert.deepStrictEqual(chanFilter, channel)
            done()
          }
        }
      }
    })
  })
})
