/* eslint-env mocha */
'use strict'

const assert = require('assert')
const dataCount = require('ws2/channels/data_count')

describe('ws2:channels:data_count', () => {
  it('returns the number of subscriptions plus pending subs, minus pending unsubs', () => {
    const countA = dataCount({
      pendingSubscriptions: [['ticker', 'tBTCUSD']],
      pendingUnsubscriptions: [42],
      channels: {
        0: { channel: 'auth' },
        42: { channel: 'ticker' }
      }
    })

    const countB = dataCount({
      pendingSubscriptions: [['ticker', 'tBTCUSD']],
      pendingUnsubscriptions: [],
      channels: {
        0: { channel: 'auth' },
        42: { channel: 'ticker' }
      }
    })

    const countC = dataCount({
      pendingSubscriptions: [],
      pendingUnsubscriptions: [],
      channels: {
        0: { channel: 'auth' },
        42: { channel: 'ticker' },
        52: { channel: 'candles' }
      }
    })

    assert.equal(countA, 1)
    assert.equal(countB, 2)
    assert.equal(countC, 2)
  })
})
