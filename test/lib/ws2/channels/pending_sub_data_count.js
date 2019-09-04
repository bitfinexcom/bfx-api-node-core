/* eslint-env mocha */
'use strict'

const assert = require('assert')
const pendingSubDataCount = require('ws2/channels/pending_sub_data_count')

describe('ws2:channels:pending_sub_data_count', () => {
  it('returns the number of pending data subscriptions', () => {
    const count = pendingSubDataCount({
      pendingSubscriptions: [['ticker', 'tBTCUSD'], ['nope', 42], ['trades', 'tBTCUSD']]
    })

    assert.strictEqual(count, 2)
  })
})
