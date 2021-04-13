/* eslint-env mocha */
'use strict'

const assert = require('assert')
const dataCount = require('../../../../lib/ws2/channels/data_count')

describe('ws2:channels:data_count', () => {
  it('returns the number of subscriptions plus pending subs, minus pending unsubs', () => {
    const countA = dataCount({
      pendingSubscriptions: [{ channel: 'ticker', symbol: 'tBTCUSD' }],
      pendingUnsubscriptions: [42],
      channels: {
        0: { channel: 'auth' },
        42: { channel: 'ticker' }
      }
    })

    const countB = dataCount({
      pendingSubscriptions: [{ channel: 'ticker', symbol: 'tBTCUSD' }],
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

    assert.strictEqual(countA, 1)
    assert.strictEqual(countB, 2)
    assert.strictEqual(countC, 2)
  })
})
