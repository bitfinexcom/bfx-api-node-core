/* eslint-env mocha */
'use strict'

const assert = require('assert')
const pendingSubDataCount = require('../../../../lib/ws2/channels/pending_sub_data_count')

describe('ws2:channels:pending_sub_data_count', () => {
  it('returns the number of pending data subscriptions', () => {
    const count = pendingSubDataCount({
      pendingSubscriptions: [{ channel: 'ticker', symbol: 'tBTCUSD' }, { channel: 'nope', symbol: 42 }, { channel: 'trades', symbol: 'tBTCUSD' }]
    })

    assert.strictEqual(count, 2)
  })
})
