/* eslint-env mocha */
'use strict'

const assert = require('assert')
const onCandlesMessage = require('../../../../lib/ws2/messages/candles')
const _isObject = require('lodash/isObject')

const defaultState = {
  transform: false,
  emit: () => {}
}

const channel = {
  key: 'trade:tBTCUSD:5m'
}

describe('ws2:messages:candles', () => {
  it('emits no data for heartbeats', (done) => {
    onCandlesMessage({
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
    const candleMessage = [25, [[Date.now(), 214, 235, 256, 195, 232552]]]

    onCandlesMessage({
      channel,
      msg: candleMessage,
      payload: candleMessage[1],
      state: {
        ...defaultState,
        emit: (eventName, packet = {}) => {
          if (eventName === 'data:candles') {
            const { msg, original, requested, chanFilter } = packet
            assert.deepStrictEqual(msg, candleMessage)
            assert.deepStrictEqual(original, candleMessage[1])
            assert.deepStrictEqual(requested, candleMessage[1])
            assert.deepStrictEqual(chanFilter, channel)
            done()
          }
        }
      }
    })
  })

  it('emits transformed candles if necessary', (done) => {
    const candleMessage = [25, [[Date.now(), 214, 235, 256, 195, 232552]]]

    onCandlesMessage({
      channel,
      msg: candleMessage,
      payload: candleMessage[1],
      state: {
        ...defaultState,
        transform: true,
        emit: (eventName, packet = {}) => {
          if (eventName === 'data:candles') {
            const { msg, original, requested, chanFilter } = packet
            assert.deepStrictEqual(msg, candleMessage)
            assert.deepStrictEqual(original, candleMessage[1])
            assert(_isObject(requested))
            assert.deepStrictEqual(chanFilter, channel)
            done()
          }
        }
      }
    })
  })
})
