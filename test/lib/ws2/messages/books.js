/* eslint-env mocha */
'use strict'

const assert = require('assert')
const onBooksMessage = require('ws2/messages/books')
const { OrderBook } = require('bfx-api-node-models')

const defaultState = {
  transform: false,
  emit: () => {}
}

const channel = {
  symbol: 'tBTCUSD',
  prec: 'P0',
  len: '25'
}

describe('ws2:messages:books', () => {
  it('emits checksum event for checksums', (done) => {
    const csMessage = [23, 'cs', 2352666]

    onBooksMessage({
      channel,
      msg: csMessage,
      state: {
        ...defaultState,
        emit: (eventName, packet = {}) => {
          const { msg, original, requested, chanFilter } = packet

          if (eventName === 'data:book:cs') {
            assert.deepStrictEqual(msg, csMessage)
            assert.strictEqual(original, csMessage[2])
            assert.strictEqual(requested, csMessage[2])
            assert.deepStrictEqual(chanFilter, channel)
            done()
          }
        }
      }
    })
  })

  it('emits no event for heartbeats', (done) => {
    onBooksMessage({
      channel,
      msg: [25, 'hb'],
      state: {
        ...defaultState,
        emit: (eventName) => {
          done(new Error(`should not have emitted any event (${eventName})`))
        }
      }
    })

    done()
  })

  it('emits data:book event with raw data if not transforming', (done) => {
    const bookMessage = [25, [[235.2532, 2, 12]]]

    onBooksMessage({
      channel,
      msg: bookMessage,
      payload: bookMessage[1],
      state: {
        ...defaultState,
        emit: (eventName, packet = {}) => {
          if (eventName === 'data:book') {
            const { msg, original, requested, chanFilter } = packet
            assert.deepStrictEqual(msg, bookMessage)
            assert.deepStrictEqual(original, bookMessage[1])
            assert.deepStrictEqual(requested, bookMessage[1])
            assert.deepStrictEqual(chanFilter, channel)
            done()
          }
        }
      }
    })
  })

  it('emits data:book event with transformed data if necessary', (done) => {
    const bookMessage = [25, [[235.2532, 2, 12]]]

    onBooksMessage({
      channel,
      msg: bookMessage,
      payload: bookMessage[1],
      state: {
        ...defaultState,
        transform: true,
        emit: (eventName, packet = {}) => {
          if (eventName === 'data:book') {
            const { msg, original, requested, chanFilter } = packet
            assert.deepStrictEqual(msg, bookMessage)
            assert.deepStrictEqual(original, bookMessage[1])
            assert(requested instanceof OrderBook)
            assert.deepStrictEqual(requested.bids, bookMessage[1])
            assert.deepStrictEqual(chanFilter, channel)
            done()
          }
        }
      }
    })
  })
})
